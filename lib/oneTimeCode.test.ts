import { describe, expect, it } from "vitest";
import { CODE_LENGTH, onlyCode } from "./oneTimeCode";

describe("onlyCode", () => {
  it("keeps all six digits of a code pasted with spaces around or inside it", () => {
    expect(onlyCode(" 123456")).toBe("123456");
    expect(onlyCode("123 456\n")).toBe("123456");
  });

  it("finds the code in a pasted sentence", () => {
    expect(onlyCode("Your code: 654321.")).toBe("654321");
  });

  it("never holds more than a code's worth of digits", () => {
    expect(onlyCode("12345678")).toHaveLength(CODE_LENGTH);
  });
});
