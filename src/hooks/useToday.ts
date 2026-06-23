import { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useFocusEffect } from "expo-router";
import { getToday } from "../constants/planning";

export function useToday() {
  const [today, setToday] = useState(getToday);

  const refresh = useCallback(() => {
    setToday((current) => {
      const next = getToday();
      return current === next ? current : next;
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          refresh();
        }
      },
    );

    return () => subscription.remove();
  }, [refresh]);

  return today;
}
