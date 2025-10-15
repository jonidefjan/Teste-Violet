import {
  canDeleteFarmer,
  ensureInactiveBeforeDelete,
} from "@/lib/farmer-rules";

describe("Farmer deletion rule", () => {
  it("allows deletion when farmer is inactive", () => {
    expect(canDeleteFarmer(false)).toBe(true);
    expect(() => ensureInactiveBeforeDelete(false)).not.toThrow();
  });

  it("blocks deletion when farmer is active", () => {
    expect(canDeleteFarmer(true)).toBe(false);
    expect(() => ensureInactiveBeforeDelete(true)).toThrow(
      "ACTIVE_FARMER_CANNOT_BE_DELETED"
    );
  });
});
