import {
  AccountType,
  InvestmentCategory,
} from "@/app/generated/prisma/client";

export function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function randomInvestmentBalance() {
  return Number((Math.random() * (180000 - 80000) + 80000).toFixed(2));
}

export const defaultAccounts = [
  {
    accountName: "Checking Account",
    accountType: AccountType.CHECKING,
    balance: "0.00",
    isPrimary: true,
  },
  {
    accountName: "Savings Account",
    accountType: AccountType.SAVINGS,
    balance: "0.00",
    isPrimary: false,
  },
  {
    accountName: "Family Savings Account",
    accountType: AccountType.SAVINGS,
    balance: "0.00",
    isPrimary: false,
  },
  {
    accountName: "Visa Platinum Card",
    accountType: AccountType.CREDIT,
    balance: "0.00",
    isPrimary: false,
  },
];

const stockTemplates = [
  ["AAPL", "Apple Inc.", InvestmentCategory.TECHNOLOGY],
  ["MSFT", "Microsoft Corporation", InvestmentCategory.TECHNOLOGY],
  ["GOOGL", "Alphabet Inc.", InvestmentCategory.TECHNOLOGY],
  ["AMZN", "Amazon.com Inc.", InvestmentCategory.CONSUMER],
  ["JPM", "JPMorgan Chase & Co.", InvestmentCategory.FINANCE],
  ["V", "Visa Inc.", InvestmentCategory.FINANCE],
  ["JNJ", "Johnson & Johnson", InvestmentCategory.HEALTHCARE],
  ["XOM", "Exxon Mobil Corporation", InvestmentCategory.ENERGY],
  ["CAT", "Caterpillar Inc.", InvestmentCategory.INDUSTRIAL],
  ["PG", "Procter & Gamble Co.", InvestmentCategory.CONSUMER],
] as const;

export function generateInvestmentHoldings(userId: string, totalValue: number) {
  const weights = [0.16, 0.14, 0.13, 0.11, 0.1, 0.09, 0.08, 0.07, 0.06, 0.06];

  let runningTotal = 0;

  return stockTemplates.map(([symbol, companyName, category], index) => {
    const isLast = index === stockTemplates.length - 1;

    const value = isLast
      ? Number((totalValue - runningTotal).toFixed(2))
      : Number((totalValue * weights[index]).toFixed(2));

    runningTotal += value;

    const price = Number((Math.random() * (520 - 80) + 80).toFixed(2));
    const shares = Number((value / price).toFixed(4));
    const changePct = Number((Math.random() * (4.5 - -2.5) + -2.5).toFixed(2));

    return {
      userId,
      symbol,
      companyName,
      category,
      value: value.toFixed(2),
      price: price.toFixed(2),
      shares: shares.toFixed(4),
      changePct: changePct.toFixed(2),
    };
  });
}