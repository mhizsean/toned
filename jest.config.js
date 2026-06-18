module.exports = {
  preset: "jest-expo",
  setupFiles: [
    "@react-native-async-storage/async-storage/jest/async-storage-mock",
  ],
  moduleNameMapper: {
    "^@react-native-async-storage/async-storage$":
      "@react-native-async-storage/async-storage/jest/async-storage-mock",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)",
  ],
};
