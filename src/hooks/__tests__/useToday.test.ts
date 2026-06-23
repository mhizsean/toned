import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";
import { AppState } from "react-native";
import { useToday } from "../useToday";

const mockGetToday = jest.fn<() => string>();

jest.mock("../../constants/planning", () => ({
  getToday: () => mockGetToday(),
}));

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useFocusEffect: (callback: () => void) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

describe("useToday", () => {
  let appStateHandler: ((state: string) => void) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToday.mockReturnValue("Wed");
    jest.spyOn(AppState, "addEventListener").mockImplementation((event, handler) => {
      if (event === "change") {
        appStateHandler = handler as (state: string) => void;
      }
      return { remove: jest.fn() };
    });
  });

  it("returns the current day from getToday", () => {
    const { result } = renderHook(() => useToday());
    expect(result.current).toBe("Wed");
    expect(mockGetToday).toHaveBeenCalled();
  });

  it("updates when the app becomes active on a new day", () => {
    mockGetToday.mockReturnValue("Wed");

    const { result } = renderHook(() => useToday());
    expect(result.current).toBe("Wed");

    mockGetToday.mockReturnValue("Thu");
    act(() => {
      appStateHandler?.("active");
    });

    expect(result.current).toBe("Thu");
  });
});
