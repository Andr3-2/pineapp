# Pine

Pine is a minimalist meditation app built with Expo and React Native. It focuses on one thing: making it easy to sit down for a guided breathing session and see your practice build up over time.

## Features

- **Guided sessions** — pick a duration (5, 10, or 30 minutes) and start a distraction-free breathing session with an ambient sound loop, a pulsing breathing glow, and a swaying pine forest backdrop.
- **Local reminders** — if a session is still running when the app is backgrounded, a local notification fires when the countdown ends, so you never miss the completion chime.
- **Progress tracking** — a home screen calendar marks the days you've meditated, tracks your current streak, counts sessions completed this month, and compares them against a weekly goal you set.
- **Onboarding** — a short first-run flow collects your name, weekly goal, and appearance preference before dropping you into the app.
- **Appearance** — light, dark, or device-matched theme.
- **Backup & restore** — export your name, goal, theme, and session history to a JSON file via the system share sheet, and import it back later on the same or another device.
- All data is stored locally on-device (via AsyncStorage) — there is no backend or account system.

## Tech stack

- [Expo](https://docs.expo.dev/versions/v57.0.0/) SDK 57 + [Expo Router](https://docs.expo.dev/versions/v57.0.0/sdk/router/) for file-based navigation
- React Native 0.86 / React 19
- [Zustand](https://github.com/pmndrs/zustand) for state, persisted to `@react-native-async-storage/async-storage`
- `react-native-reanimated` + `react-native-svg` for the animated forest and breathing glow
- `expo-audio`, `expo-notifications`, `expo-blur`, `expo-linear-gradient`, `expo-document-picker`, `expo-sharing`
- TypeScript throughout

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm
- The [Expo Go](https://expo.dev/go) app on your phone (easiest way to run the project), and/or Android Studio / Xcode if you want to run on an emulator or build native code
- The [Expo CLI](https://docs.expo.dev/versions/v57.0.0/more/expo-cli/) is used via `npx`, no global install required

### Install

```bash
git clone <this-repo-url>
cd pineapp
npm install
```

### Run

Start the Metro bundler and dev server:

```bash
npm start
```

This opens Expo's developer tools. From there you can:

- Scan the QR code with the **Expo Go** app on your phone
- Press `a` to open in an Android emulator
- Press `i` to open in an iOS simulator (macOS only)
- Press `w` to open the web build in your browser

Or launch a platform directly:

```bash
npm run android   # build and run on Android (emulator or device)
npm run ios       # build and run on iOS (simulator or device, macOS only)
npm run web       # run in the browser
```

> `npm run android` / `npm run ios` use `expo run:android` / `expo run:ios`, which generate native `android`/`ios` project folders on first run (these are gitignored — safe to delete and regenerate). For everyday development, `npm start` with Expo Go is faster and doesn't require native tooling.

## Project structure

- `app/` — screens and routes (Expo Router), one file per route: tracker home, onboarding, session, settings
- `src/components/` — UI components, grouped by screen (`session/`, `onboarding/`, `tracker/`)
- `src/store/` — Zustand store (persisted app state: onboarding, tracker history, session state)
- `src/lib/` — sound, notifications, date helpers, and backup import/export
- `src/theme/` — color tokens and the light/dark/device theme hook
- `src/hooks/` — shared hooks (e.g. the session countdown timer)
