import { supabase } from "@/src/services/supabase";
import { Tables } from "@/src/types/database";

type NudgeRule = Tables<"nudge_rules">;
type NudgeLog = Tables<"nudges_log">;

export type Nudge = {
  id?: string;
  ruleType: string;
  message: string;
  context?: Record<string, unknown>;
};

type RuleConfig = {
  threshold_minutes?: number;
  threshold_percent?: number;
  days_before?: number;
  message?: string;
};

/**
 * Simple rule-based nudge engine
 * Evaluates conditions and generates nudges
 */
export class NudgeEngine {
  private userId: string;
  private partnershipId: string;
  private rules: NudgeRule[] = [];

  constructor(userId: string, partnershipId: string) {
    this.userId = userId;
    this.partnershipId = partnershipId;
  }

  async initialize() {
    const { data } = await supabase
      .from("nudge_rules")
      .select("*")
      .eq("partnership_id", this.partnershipId)
      .eq("is_enabled", true);

    this.rules = data ?? [];
  }

  /**
   * Check if enough time has passed since last nudge of this type
   */
  private async canSendNudge(ruleType: string, cooldownMinutes: number): Promise<boolean> {
    const cooldownTime = new Date();
    cooldownTime.setMinutes(cooldownTime.getMinutes() - cooldownMinutes);

    const { data } = await supabase
      .from("nudges_log")
      .select("id")
      .eq("user_id", this.userId)
      .eq("rule_type", ruleType)
      .gte("created_at", cooldownTime.toISOString())
      .limit(1);

    return !data || data.length === 0;
  }

  /**
   * Log a sent nudge
   */
  private async logNudge(nudge: Nudge, ruleId?: string): Promise<void> {
    await supabase.from("nudges_log").insert({
      user_id: this.userId,
      partnership_id: this.partnershipId,
      rule_id: ruleId,
      rule_type: nudge.ruleType,
      message: nudge.message,
      context: nudge.context ?? {},
    });
  }

  /**
   * Evaluate work hours rule
   * Triggers when partner has been at same location for X hours
   */
  async evaluateWorkHoursRule(
    partnerLocations: { latitude: number; longitude: number; created_at: string }[]
  ): Promise<Nudge | null> {
    const rule = this.rules.find((r) => r.rule_type === "work_hours");
    if (!rule) return null;

    const config = rule.config as RuleConfig;
    const thresholdMs = (config.threshold_minutes ?? 180) * 60 * 1000;

    // Check if partner has been at roughly same location for threshold time
    if (partnerLocations.length < 2) return null;

    const firstLoc = partnerLocations[partnerLocations.length - 1];
    const lastLoc = partnerLocations[0];

    const timeDiff = new Date(lastLoc.created_at).getTime() - new Date(firstLoc.created_at).getTime();
    if (timeDiff < thresholdMs) return null;

    // Check if location is roughly the same (within ~100m)
    const latDiff = Math.abs(lastLoc.latitude - firstLoc.latitude);
    const lngDiff = Math.abs(lastLoc.longitude - firstLoc.longitude);
    if (latDiff > 0.001 || lngDiff > 0.001) return null;

    // Check cooldown
    if (!(await this.canSendNudge("work_hours", rule.cooldown_minutes ?? 60))) {
      return null;
    }

    const hours = Math.round(timeDiff / (1000 * 60 * 60));
    const message = config.message ?? `Your partner has been at the same place for ${hours} hours — send a quick message?`;

    const nudge: Nudge = {
      ruleType: "work_hours",
      message,
      context: { hours, location: lastLoc },
    };

    await this.logNudge(nudge, rule.id);
    return nudge;
  }

  /**
   * Evaluate battery low rule
   */
  async evaluateBatteryRule(batteryLevel?: number): Promise<Nudge | null> {
    if (batteryLevel === undefined) return null;

    const rule = this.rules.find((r) => r.rule_type === "battery_low");
    if (!rule) return null;

    const config = rule.config as RuleConfig;
    const threshold = config.threshold_percent ?? 15;

    if (batteryLevel > threshold) return null;

    // Check cooldown
    if (!(await this.canSendNudge("battery_low", rule.cooldown_minutes ?? 120))) {
      return null;
    }

    const message = config.message ?? `Your partner's phone is at ${batteryLevel}% battery.`;

    const nudge: Nudge = {
      ruleType: "battery_low",
      message,
      context: { batteryLevel },
    };

    await this.logNudge(nudge, rule.id);
    return nudge;
  }

  /**
   * Evaluate anniversary/special date rule
   */
  async evaluateAnniversaryRule(): Promise<Nudge | null> {
    const rule = this.rules.find((r) => r.rule_type === "anniversary");
    if (!rule) return null;

    const config = rule.config as RuleConfig;
    const daysBefore = config.days_before ?? 7;

    // Get upcoming events
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysBefore);

    const { data: events } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("partnership_id", this.partnershipId)
      .in("event_type", ["anniversary", "birthday"]);

    if (!events || events.length === 0) return null;

    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    for (const event of events) {
      const eventDate = new Date(event.event_date);
      const eventMonth = eventDate.getMonth();
      const eventDay = eventDate.getDate();

      // Check if event is within daysBefore days
      const targetMonth = targetDate.getMonth();
      const targetDay = targetDate.getDate();

      if (eventMonth === targetMonth && eventDay <= targetDay && eventDay >= todayDay) {
        // Check cooldown (use longer cooldown for anniversary nudges)
        if (!(await this.canSendNudge("anniversary", rule.cooldown_minutes ?? 1440))) {
          continue;
        }

        const daysUntil = eventDay - todayDay;
        const message =
          config.message ??
          `${event.title} is in ${daysUntil} days — want to plan something special?`;

        const nudge: Nudge = {
          ruleType: "anniversary",
          message,
          context: { event, daysUntil },
        };

        await this.logNudge(nudge, rule.id);
        return nudge;
      }
    }

    return null;
  }

  /**
   * Run all rule evaluations and return any triggered nudges
   */
  async evaluate(context: {
    partnerLocations?: { latitude: number; longitude: number; created_at: string }[];
    partnerBatteryLevel?: number;
  }): Promise<Nudge[]> {
    const nudges: Nudge[] = [];

    if (context.partnerLocations) {
      const workNudge = await this.evaluateWorkHoursRule(context.partnerLocations);
      if (workNudge) nudges.push(workNudge);
    }

    if (context.partnerBatteryLevel !== undefined) {
      const batteryNudge = await this.evaluateBatteryRule(context.partnerBatteryLevel);
      if (batteryNudge) nudges.push(batteryNudge);
    }

    const anniversaryNudge = await this.evaluateAnniversaryRule();
    if (anniversaryNudge) nudges.push(anniversaryNudge);

    return nudges;
  }
}

