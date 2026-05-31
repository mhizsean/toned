# Toned

A personal workout app built for my own training routine. It keeps my weekly plan in one place—what I do each day, including rest days—and shows the sets and reps for every exercise. It also helps me log the weight I lift so I can track progress over time.

## Features

- **Daily workout plan** — See which workout is scheduled for today (or a rest day)
- **Sets & reps** — Clear targets for each exercise in the routine
- **Weight logging** — Record weights used during a session and refer back to them later

## Tech stack

| Library | Purpose |
|---|---|
| [Expo](https://expo.dev/) | React Native framework and dev tooling |
| [expo-router](https://docs.expo.dev/router/introduction/) | File-based navigation |
| [zustand](https://github.com/pmndrs/zustand) | Lightweight state management (workout data, logs) |
| [expo-font](https://docs.expo.dev/versions/latest/sdk/font/) + `@expo-google-fonts/bebas-neue` & `@expo-google-fonts/dm-sans` | Custom typography |
| [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) | Safe area handling on notched devices |
| [react-native-screens](https://github.com/software-mansion/react-native-screens) | Native screen primitives for navigation |

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (comes with Node)
- [Expo Go](https://expo.dev/go) on your phone, **or** Xcode (iOS Simulator) / Android Studio (Android Emulator)

## Setup

1. **Clone the repo** and move into the project folder:

   ```bash
   cd Toned
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   This installs everything listed in `package.json`, including Expo, React Native, expo-router, zustand, and the font packages.

3. **Start the dev server**:

   ```bash
   npm start
   ```

   From the Expo dev tools you can:
   - Press `i` to open the iOS Simulator
   - Press `a` to open the Android Emulator
   - Scan the QR code with Expo Go on your device

   Or run a platform directly:

   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   npm run web      # Web browser
   ```

## Project structure

```
Toned/
├── App.tsx          # Root component
├── app.json         # Expo configuration
├── assets/          # App icon, splash screen, favicon
├── index.ts         # Entry point
└── package.json     # Dependencies and scripts
```
