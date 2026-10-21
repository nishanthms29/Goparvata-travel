import { describe, expect, it } from "vitest";
import { calculatePrice, formatInr } from "./pricing";

describe("calculatePrice", () => {
  it("calculates traveller totals, discount, tax, and fees in paise", () => {
    expect(calculatePrice({
      adultPricePaise: 100_000,
      childPricePaise: 50_000,
      adults: 2,
      children: 1,
      discountPaise: 5_000,
      taxBasisPoints: 500,
      feePaise: 100,
    })).toEqual({
      subtotalPaise: 250_000,
      discountPaise: 5_000,
      taxablePaise: 245_000,
      taxPaise: 12_250,
      feePaise: 100,
      totalPaise: 257_350,
    });
  });

  it("caps discounts at the subtotal and validates safe arithmetic", () => {
    expect(calculatePrice({
      adultPricePaise: 25_000,
      childPricePaise: null,
      adults: 1,
      children: 0,
      discountPaise: 50_000,
    }).totalPaise).toBe(0);
    expect(() => calculatePrice({
      adultPricePaise: Number.MAX_SAFE_INTEGER,
      childPricePaise: null,
      adults: 2,
      children: 0,
    })).toThrow("Price exceeds the supported limit.");
    expect(() => calculatePrice({
      adultPricePaise: 1,
      childPricePaise: null,
      adults: 1,
      children: 0,
      taxBasisPoints: Number.MAX_SAFE_INTEGER,
    })).toThrow("Tax calculation exceeds the supported limit.");
  });
});

describe("formatInr", () => {
  it("preserves paise when formatting fractional rupees", () => {
    expect(formatInr(12_345_678)).toContain("1,23,456.78");
    expect(formatInr(2_850_000)).toContain("28,500");
    expect(formatInr(2_850_000)).not.toContain(".00");
  });

  it("rejects non-integer paise", () => {
    expect(() => formatInr(1.5)).toThrow("Amount must be an integer number of paise.");
  });
});
