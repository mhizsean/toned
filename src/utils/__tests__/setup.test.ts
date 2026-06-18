import AsyncStorage from "@react-native-async-storage/async-storage";
import { pluralize } from "../text";

describe("test setup", () => {
  it("runs jest with jest-expo", () => {
    expect(pluralize(1, "exercise")).toBe("1 exercise");
  });

  it("mocks AsyncStorage", async () => {
    await AsyncStorage.setItem("test-key", "ok");
    await expect(AsyncStorage.getItem("test-key")).resolves.toBe("ok");
  });
});
