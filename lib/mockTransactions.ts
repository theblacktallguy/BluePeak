import {
  TransactionStatus,
  TransactionType,
  type AccountType,
} from "@prisma/client";

const debitTitles = [
  "Grocery Store Purchase",
  "Online Shopping",
  "Utility Bill Payment",
  "Mobile Phone Bill",
  "Restaurant Payment",
  "Fuel Station Purchase",
  "Insurance Payment",
  "Subscription Renewal",
  "ATM Withdrawal",
  "Card Purchase",
  "Transfer to External Account",
  "Medical Payment",
  "Internet Bill",
  "Travel Booking",
  "School Fee Payment",
];

const creditTitles = [
  "Payroll Deposit",
  "Mobile Check Deposit",
  "Refund Received",
  "Cash Deposit",
  "Interest Credit",
  "Incoming Transfer",
  "Dividend Payment",
  "Business Deposit",
];

function randomFrom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomAmount(min: number, max: number) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

function makeReference() {
  return `BP-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function randomDateInMonth(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.floor(Math.random() * lastDay) + 1;
  const hour = Math.floor(Math.random() * 23);
  const minute = Math.floor(Math.random() * 59);

  return new Date(year, month, day, hour, minute);
}

export function generateMockTransactionsForAccount(params: {
  userId: string;
  bankAccountId: string;
  accountType: AccountType;
  accountCreatedAt: Date;
}) {
  const transactions = [];

  /**
   * We generate history from one year BEFORE account creation date.
   * Example:
   * account created: May 5, 2026
   * history starts: May 2025
   */
  const startDate = new Date(params.accountCreatedAt);
  startDate.setFullYear(startDate.getFullYear() - 1);
  startDate.setDate(1);

  for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(startDate.getMonth() + monthOffset);

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    transactions.push({
      userId: params.userId,
      bankAccountId: params.bankAccountId,
      type: TransactionType.CREDIT,
      status: TransactionStatus.SUCCESS,
      title:
        params.accountType === "INVESTMENT"
          ? "Monthly Investment Return"
          : "Monthly Direct Deposit",
      description: "Recurring monthly credit",
      amount:
        params.accountType === "INVESTMENT"
          ? randomAmount(80, 750)
          : randomAmount(1200, 6500),
      reference: makeReference(),
      transactionDate: new Date(year, month, 3, 9, 30),
    });

    transactions.push({
      userId: params.userId,
      bankAccountId: params.bankAccountId,
      type: TransactionType.DEBIT,
      status: TransactionStatus.SUCCESS,
      title:
        params.accountType === "CREDIT"
          ? "Monthly Card Payment"
          : "Monthly Service Payment",
      description: "Recurring monthly debit",
      amount: randomAmount(25, 850),
      reference: makeReference(),
      transactionDate: new Date(year, month, 7, 13, 15),
    });

    for (let i = 0; i < 18; i++) {
      const isCredit = Math.random() > 0.55;

      transactions.push({
        userId: params.userId,
        bankAccountId: params.bankAccountId,
        type: isCredit ? TransactionType.CREDIT : TransactionType.DEBIT,
        status: TransactionStatus.SUCCESS,
        title: isCredit ? randomFrom(creditTitles) : randomFrom(debitTitles),
        description: isCredit
          ? "Incoming account activity"
          : "Completed account payment",
        amount: isCredit ? randomAmount(100, 5000) : randomAmount(10, 1200),
        reference: makeReference(),
        transactionDate: randomDateInMonth(year, month),
      });
    }
  }

  return transactions.sort(
    (a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()
  );
}