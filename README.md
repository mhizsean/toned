# Toned

Toned is a mobile workout app for planning your training week and tracking progress over time. Set up gym, home, or rest days, build an exercise library, log sets and weights during sessions, and review your history and personal records all in one place.

It started as a personal workout app built around my own routine and has grown into something anyone can use to structure their training and see how they're improving.

## Features

### Home

- Dashboard with total sessions, workouts this week, and PR count
- Start a new workout or resume an in-progress session
- Quick view of recent sessions (tap to open in History)

### Plan

- **Weekly schedule**: Configure each day of the week (Mon–Sun) as gym, home, or rest
- **Day setup**: Pick one or more focus areas (e.g. Glutes & Legs + Core & Posture) and assign exercises by name — no target sets/reps at planning time
- **Exercise library**: Curate your own list of exercises from a built-in catalogue of 100+ movements, organised by category, with tag filters

### Sessions

- Log exercises and record weight and reps (or seconds for timed holds) for each set
- Add or remove sets during a workout
- Pick exercises from your personal library
- View exercise form guides (muscles worked, steps, tips, and common mistakes) from the catalogue
- Finish or discard a session; in-progress sessions are saved automatically if the app closes

### History & records

- **History**: Browse past sessions with expandable set-by-set breakdowns; delete sessions you no longer need
- **PRs**: Best set per exercise — heaviest weight, longest hold, or most reps for bodyweight moves — with the date each record was set

### Settings

- Toggle between dark and light mode
- App version (from `app.json`) and credits

### Data & offline

- All data is stored locally on your device (sessions, active session, schedule, library, and theme preference)
- No account or internet connection required to use the app

## Screens

| Tab | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Dashboard and workout start |
| Plan | `/plan` | Weekly schedule and exercise library |
| History | `/history` | Past session log |
| PRs | `/prs` | Personal records |
| Settings | `/settings` | Appearance and about |

Hidden routes (no tab): `/session` (active workout), `/day-setup` (configure a day).

## Tech stack

| Library | Purpose |
| --- | --- |
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

## Testing

### Unit & component tests

```bash
npm test           # run all Jest tests
npm run test:watch # watch mode
```

### E2E tests (Maestro, iOS Simulator)

End-to-end tests use [Maestro](https://maestro.mobile.dev/) against a standalone simulator build (not Expo Go).

1. **Install Maestro CLI** (one-time):

   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   brew install openjdk@17
   ```

   Maestro requires Java. The `npm run e2e` scripts set `JAVA_HOME` for Homebrew's OpenJDK 17.

2. **Build and install on the iOS Simulator** (first run generates the `ios/` folder via prebuild):

   ```bash
   npx expo run:ios --device "iPhone 17 Pro"
   ```

   Use an **iOS 26.4+** simulator (not iOS 17.x). In Xcode → Settings → Components, install **iOS 26.5** Platform Support if the build says the SDK is missing.

   For Debug builds the app loads JS from Metro — start the dev server in another terminal (`npm start`) before running Maestro, or build Release for a fully standalone app.

3. **Run E2E flows** — use **separate terminal tabs**, one command each (do not paste `# comment` lines into the shell):

   **Tab A** — Metro (leave running):

   ```bash
   npm start
   ```

   **Tab B** — build/install (once, or after native changes):

   ```bash
   npx expo run:ios --device "iPhone 17 Pro"
   ```

   **Tab C** — E2E:

   ```bash
   npm run e2e:smoke
   npm run e2e
   ```

   Maestro installs to `~/.maestro/bin` (npm scripts use that path directly). After manual install, open a new terminal or run `export PATH="$PATH:$HOME/.maestro/bin"`.

   If Metro says port 8081 is in use, stop the other process (`lsof -i :8081`) before starting again.

**Flows:**

| File | Coverage |
| --- | --- |
| `smoke.yml` | Fresh launch, home dashboard |
| `tab-navigation.yml` | All five tabs and screen headers |
| `plan-library.yml` | Add an exercise to the library |
| `workout-log.yml` | Full workout: library → session → history → PRs |

**Troubleshooting:**

- **`maestro: command not found`**: Install with the curl command above, or run `npm run e2e:smoke` (scripts point at `~/.maestro/bin/maestro`).
- **`iOS driver not ready in time`**: You do **not** need a `.env` file. `MAESTRO_DRIVER_STARTUP_TIMEOUT` is already set in `package.json` (5 minutes). Boot the **iPhone 17 Pro** simulator first, quit any stuck Maestro run, then retry. First run after a reboot can take 2–3 minutes before tests start.
- **Metro Watchman / Operation not permitted**: The project disables Watchman via `metro.config.js`. Use `npm start` (sets `CI=1`). If Metro still crashes, move the repo off Desktop or grant Full Disk Access to Terminal in System Settings → Privacy.
- If tests time out on the splash screen, wait for fonts to load — flows use a 30s `extendedWaitUntil` for `TONED`.
- Each flow starts with `clearState: true` so AsyncStorage is wiped between runs.
- **`iOS 26.5 is not installed`**: In Xcode → Settings → Components, download **iOS 26.5** under Platform Support (~8 GB). Your Xcode version needs this SDK to compile, even if you use an older simulator.
- **Use a compatible simulator** after the platform SDK is installed: `npx expo run:ios --device "iPhone 17 Pro"` (iOS 26.4) instead of an iOS 17.x device.
- **`expo-linking` / manifest error on simulator**: The embedded `app.config` was missing because `expo-constants` mishandles paths with spaces. Run `npm install` (applies `scripts/patch-expo-constants.sh`), then rebuild: `npx expo run:ios --device "iPhone 17 Pro"`.

## Project structure

```
Toned/
├── .maestro/             # Maestro E2E flows (iOS Simulator)
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
| --- | --- |
| `toned_sessions` | Completed workout sessions |
| `toned_active_session` | In-progress workout (restored on launch) |
| `toned_schedule` | Weekly day-by-day plan |
| `toned_library` | User's exercise library |
| `toned_theme` | Dark or light mode preference |
