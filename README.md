# Toned

Toned is a mobile workout app for planning your training week and tracking progress over time. Set up gym, home, or rest days, build an exercise library, log sets and weights during sessions, and review your history and personal records all in one place.

It started as a personal workout app built around my own routine and has grown into something anyone can use to structure their training and see how they're improving.

## Features

### Home
- Dashboard with total sessions, workouts this week, and PR count
- Start a new workout or resume an in-progress session
- Quick view of recent sessions

### Plan
- **Weekly schedule**: Configure each day of the week (Mon–Sun) as gym, home, or rest
- **Day setup**: Set a focus area (e.g. glutes & legs, upper body) and assign exercises with target sets and reps
- **Exercise library**: Curate your own list of exercises from a built-in catalogue of 100+ movements, organised by category

### Sessions
- Log exercises and record weight and reps for each set
- Add or remove sets during a workout
- Pick exercises from your personal library
- View exercise form guides (muscles worked, steps, tips, and common mistakes) from the catalogue
- Finish or discard a session

### History & records
- **History**: Browse past sessions with expandable set-by-set breakdowns; delete sessions you no longer need
- **PRs**: See your heaviest lift per exercise, sorted by weight, with the date each record was set

### Settings
- Toggle between dark and light mode
- App version and credits

### Data & offline
- All data is stored locally on your device (sessions, schedule, library, and theme preference)
- No account or internet connection required to use the app

## Screens

| Tab | Route | Purpose |
|---|---|---|
| Home | `/` | Dashboard and workout start |
| Plan | `/plan` | Weekly schedule and exercise library |
| History | `/history` | Past session log |
| PRs | `/prs` | Personal records |
| Settings | `/settings` | Appearance and about |

Hidden routes (no tab): `/session` (active workout), `/day-setup` (configure a day).

## Tech stack

| Library | Purpose |
|---|---|
| [Expo](https://expo.dev/) (~54) | React Native framework and dev tooling |
| [expo-router](https://docs.expo.dev/router/introduction/) | File-based navigation (tabs + stack) |
| [zustand](https://github.com/pmndrs/zustand) | Workout state (sessions, schedule, library) |
| [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) | Local persistence |
| [expo-font](https://docs.expo.dev/versions/latest/sdk/font/) + Google Fonts | Bebas Neue & DM Sans typography |
| [@expo/vector-icons](https://docs.expo.dev/guides/icons/) | Tab and UI icons (Ionicons) |
| [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) | Safe area handling on notched devices |
| TypeScript | Typed components, store, and data models |

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

   If you hit peer dependency conflicts, the project includes an `.npmrc` with `legacy-peer-deps=true` so a plain `npm install` should work.

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
├── app.json              # Expo configuration
├── eas.json              # EAS Build profiles
├── assets/               # App icon, splash screen, favicon
├── src/
│   ├── app/              # Screens (expo-router file-based routes)
│   │   ├── _layout.tsx   # Root tabs + theme provider
│   │   ├── index.tsx     # Home
│   │   ├── plan.tsx      # Weekly plan & library
│   │   ├── day-setup.tsx # Configure a single day
│   │   ├── session.tsx   # Active workout logging
│   │   ├── history.tsx   # Session history
│   │   ├── prs.tsx       # Personal records
│   │   └── settings.tsx  # Theme & about
│   ├── components/       # Reusable UI (pickers, sheets)
│   ├── constants/        # Theme, planning helpers, date formatting
│   ├── context/          # ThemeContext (dark / light mode)
│   ├── data/             # Exercise catalogue
│   ├── store/            # Zustand workout store
│   ├── types/            # Shared TypeScript types
│   └── utils/            # PR calculations, etc.
└── package.json
```

## Local storage keys

| Key | Data |
|---|---|
| `toned_sessions` | Completed workout sessions |
| `toned_schedule` | Weekly day-by-day plan |
| `toned_library` | User's exercise library |
| `toned_theme` | Dark or light mode preference |
