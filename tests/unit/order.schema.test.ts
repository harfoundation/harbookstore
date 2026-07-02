import { describe, expect, it } from "vitest";
import {
  calculateGroupBuyProgress,
  calculateOrderSubtotalCents,
  checkoutSchema,
} from "@/lib/validation/order.schema";

describe("checkoutSchema", () => {
  it("accepts a valid checkout payload", () => {
    const result = checkoutSchema.safeParse({
      items: [{ bookId: "3fa85f64-5717-4562-b3fc-2c963f66afa6", quantity: 2 }],
      paymentMethod: "bank_transfer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty cart", () => {
    const result = checkoutSchema.safeParse({
      items: [],
      paymentMethod: "bank_transfer",
    });
    expect(result.success).toBe(false);
  });
});

describe("calculateOrderSubtotalCents", () => {
  it("sums quantity * unit price across items", () => {
    const subtotal = calculateOrderSubtotalCents([
      { quantity: 2, unitPriceCents: 1500 },
      { quantity: 1, unitPriceCents: 2000 },
    ]);
    expect(subtotal).toBe(5000);
  });

  it("returns 0 for an empty list", () => {
    expect(calculateOrderSubtotalCents([])).toBe(0);
  });
});

describe("calculateGroupBuyProgress", () => {
  it("computes a rounded percentage", () => {
    expect(calculateGroupBuyProgress(3, 10)).toBe(30);
  });

  it("caps at 100 even if current exceeds target", () => {
    expect(calculateGroupBuyProgress(15, 10)).toBe(100);
  });

  it("returns 0 when target is 0 to avoid divide-by-zero", () => {
    expect(calculateGroupBuyProgress(5, 0)).toBe(0);
  });
});
