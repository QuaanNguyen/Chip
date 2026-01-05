import { supabase } from "@/src/services/supabase";

export type PartnershipResult = {
  partnership_id: string;
  invite_code?: string;
  partner_id?: string;
  paired_at?: string;
  error?: string;
};

export type PartnerInfo = {
  partner_id?: string;
  display_name?: string | null;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    is_live?: boolean;
    mode?: string;
    updated_at?: string;
  } | null;
  battery?: {
    level: number;
    is_charging: boolean;
  } | null;
  error?: string;
};

/**
 * Create a new partnership and get an invite code
 */
export async function createPartnership(): Promise<PartnershipResult> {
  const { data, error } = await supabase.rpc("create_partnership");

  if (error) {
    if (error.message.includes("already has an active partnership")) {
      throw new Error("You already have an active partnership");
    }
    throw new Error(error.message);
  }

  return data as PartnershipResult;
}

/**
 * Join an existing partnership using an invite code
 */
export async function joinPartnership(
  inviteCode: string
): Promise<PartnershipResult> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error("Request timed out - check your network connection")
        ),
      15000
    )
  );

  const rpcPromise = supabase.rpc("join_partnership", {
    p_invite_code: inviteCode.toUpperCase(),
  });

  const { data, error } = await Promise.race([rpcPromise, timeoutPromise]);

  if (error) {
    if (error.message.includes("Invalid or expired")) {
      throw new Error("Invalid or expired invite code");
    }
    if (error.message.includes("Cannot join your own")) {
      throw new Error("You cannot join your own partnership");
    }
    if (error.message.includes("already has an active")) {
      throw new Error("You already have an active partnership");
    }
    throw new Error(error.message);
  }

  return data as PartnershipResult;
}

/**
 * Get information about your partner
 */
export async function getPartnerInfo(): Promise<PartnerInfo> {
  const { data, error } = await supabase.rpc("get_partner_info");

  if (error) {
    throw new Error(error.message);
  }

  return data as PartnerInfo;
}

/**
 * Dissolve the current partnership
 */
export async function dissolvePartnership(): Promise<boolean> {
  const { data, error } = await supabase.rpc("dissolve_partnership");

  if (error) {
    throw new Error(error.message);
  }

  return data as boolean;
}

/**
 * Get the current user's partnership status
 */
export async function getPartnershipStatus(): Promise<{
  hasPartnership: boolean;
  status: string | null;
  inviteCode: string | null;
  partnerId: string | null;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("partnership_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.partnership_id) {
    return {
      hasPartnership: false,
      status: null,
      inviteCode: null,
      partnerId: null,
    };
  }

  const { data: partnership } = await supabase
    .from("partnerships")
    .select("*")
    .eq("id", profile.partnership_id)
    .single();

  if (!partnership) {
    return {
      hasPartnership: false,
      status: null,
      inviteCode: null,
      partnerId: null,
    };
  }

  const partnerId =
    partnership.user1_id === user.id
      ? partnership.user2_id
      : partnership.user1_id;

  return {
    hasPartnership: true,
    status: partnership.status,
    inviteCode: partnership.status === "pending" ? partnership.invite_code : null,
    partnerId,
  };
}

