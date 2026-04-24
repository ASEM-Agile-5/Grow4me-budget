import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges tailwind classes and resolves conflicts (last wins)", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles conditional classes", () => {
    const showHidden = false;
    const showBlock = true;
    expect(cn("base", showHidden && "hidden", showBlock && "block")).toBe("base block");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
