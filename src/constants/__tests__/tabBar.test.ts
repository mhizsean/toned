import { describe, it, expect } from "@jest/globals";
import { getTabBarInset } from "../tabBar";

describe("getTabBarInset", () => {
  it("includes tab bar height, float gap, and safe area", () => {
    expect(getTabBarInset(0)).toBe(68 + 12 + 12 + 8);
    expect(getTabBarInset(34)).toBe(68 + 34 + 12 + 8);
  });
});
