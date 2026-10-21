export type PriceInput = {
  adultPricePaise: number;
  childPricePaise: number | null;
  adults: number;
  children: number;
  discountPaise?: number;
  feePaise?: number;
  taxBasisPoints?: number;
};

export type PriceBreakdown = {
  subtotalPaise: number;
  discountPaise: number;
  taxablePaise: number;
  taxPaise: number;
  feePaise: number;
  totalPaise: number;
};

export function calculatePrice(input: PriceInput): PriceBreakdown {
  const integerFields = [
    input.adultPricePaise,
    input.adults,
    input.children,
    input.discountPaise ?? 0,
    input.feePaise ?? 0,
    input.taxBasisPoints ?? 0,
  ];
  if (integerFields.some((value) => !Number.isSafeInteger(value) || value < 0)) {
    throw new Error("Price inputs must be non-negative safe integers.");
  }
  if (input.adults < 1 || input.adults > 20 || input.children > 20 || input.adults + input.children > 20) {
    throw new Error("Choose between 1 and 20 travellers.");
  }
  const childPrice = input.childPricePaise ?? input.adultPricePaise;
  if (!Number.isSafeInteger(childPrice) || childPrice < 0) {
    throw new Error("Child price must be a non-negative safe integer.");
  }

  const subtotalPaise = input.adultPricePaise * input.adults + childPrice * input.children;
  if (!Number.isSafeInteger(subtotalPaise)) throw new Error("Price exceeds the supported limit.");
  const discountPaise = Math.min(input.discountPaise ?? 0, subtotalPaise);
  const taxablePaise = subtotalPaise - discountPaise;
  const taxNumerator = taxablePaise * (input.taxBasisPoints ?? 0);
  if (!Number.isSafeInteger(taxNumerator) || taxNumerator > Number.MAX_SAFE_INTEGER - 5000) {
    throw new Error("Tax calculation exceeds the supported limit.");
  }
  const taxPaise = Math.floor((taxNumerator + 5000) / 10000);
  const feePaise = input.feePaise ?? 0;
  const totalPaise = taxablePaise + taxPaise + feePaise;
  if (!Number.isSafeInteger(totalPaise)) throw new Error("Price exceeds the supported limit.");
  return { subtotalPaise, discountPaise, taxablePaise, taxPaise, feePaise, totalPaise };
}

export function formatInr(amountPaise: number): string {
  if (!Number.isSafeInteger(amountPaise)) throw new Error("Amount must be an integer number of paise.");
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: amountPaise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amountPaise / 100);
}
