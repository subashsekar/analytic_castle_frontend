import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
} from "@/lib/utils/validation";

describe("validation", () => {
  it("requires and validates email", () => {
    expect(validateEmail("")).toMatch(/required/i);
    expect(validateEmail("not-an-email")).toMatch(/valid email/i);
    expect(validateEmail("ada@example.com")).toBeUndefined();
  });

  it("enforces password policy", () => {
    expect(validatePassword("")).toMatch(/required/i);
    expect(validatePassword("short")).toMatch(/8 characters/i);
    expect(validatePassword("alllowercase1!")).toMatch(/uppercase/i);
    expect(validatePassword("ALLUPPERCASE1!")).toMatch(/lowercase/i);
    expect(validatePassword("NoNumberHere!")).toMatch(/number/i);
    expect(validatePassword("NoSpecial123")).toMatch(/special character/i);
    expect(
      validatePassword("ada@example.com", { email: "ada@example.com" }),
    ).toMatch(/same as your email/i);
    expect(validatePassword("SecurePassword123!")).toBeUndefined();
  });

  it("requires matching password confirmation", () => {
    expect(validatePasswordConfirmation("SecurePassword123!", "")).toMatch(
      /required/i,
    );
    expect(
      validatePasswordConfirmation("SecurePassword123!", "otherpassword"),
    ).toMatch(/do not match/i);
    expect(
      validatePasswordConfirmation("SecurePassword123!", "SecurePassword123!"),
    ).toBeUndefined();
  });

  it("requires names", () => {
    expect(validateName("", "First name")).toMatch(/required/i);
    expect(validateName("Ada", "First name")).toBeUndefined();
  });
});
