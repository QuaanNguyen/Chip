# 🐿️ Chip — The App for Two

> **Chip** is a private companion app built for exactly **two people** — you and your partner.  
> It helps you stay connected through context-aware nudges, shared places, and personalized date ideas — all while respecting your privacy.

---

## ✨ Features

### 💞 For Two Only
- Pair securely with your partner using an invite code — once paired, it’s *just the two of you*.
- Real-time map view that shows your partner’s location and battery status (only when both consent).
- “Go Live” mode with auto-timeout and visible sharing indicators for full transparency.

### 🧠 Smart AI Nudges
Chip notices everyday moments and gently reminds you to check in:
- “Your girlfriend has been at work for **3 hours** — send a quick message?”
- “She’s been driving a lot today — maybe ask if she’s tired?”
- “It’s your 1-year anniversary soon — want me to suggest a date plan?”

All AI behavior is rule-based for transparency and privacy, with quiet hours and cooldowns to avoid spam.

### 📍 Shared Map & Date Planner
- Pin cafés, restaurants, or any favorite spots on your shared map.
- Auto-generate date ideas using your saved pins + local recommendations.
- Add thoughtful extras like “pick up flowers 🌻” or “grab a dessert nearby.”

### 🗓️ Relationship Calendar
- Track anniversaries, birthdays, and meaningful dates.
- Countdown widgets and reminders for special occasions.

### 🔒 Privacy First
- Two-way opt-in; both can pause or stop location sharing anytime.  
- Approximate or precise modes for control over what’s shared.  
- No default history; location data auto-expires after short intervals.  
- One-tap data deletion and “Privacy Pause” switch.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Framework** | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) |
| **Realtime Backend** | Firebase / Supabase Realtime |
| **Database** | Firestore or Supabase (Postgres) |
| **Maps** | `react-native-maps` or Mapbox |
| **Notifications** | `expo-notifications` |
| **AI & Logic** | Context rule engine → optional LLM upgrade |
| **Build & Deploy** | Expo EAS Build (iOS + Android) |

---

## 🛠️ Getting Started

### Prerequisites
- Node ≥ 18  
- npm or Yarn  
- Expo CLI (`npm install -g expo-cli`)  
- Firebase or Supabase project (optional for MVP)

### Installation
```bash
git clone https://github.com/<QuaanNguyen>/chip.git
cd chip
npm install
```
### Run in Development
```
npx expo start
```

## 🛡 License

This project is licensed under the Apache 2.0 License.
