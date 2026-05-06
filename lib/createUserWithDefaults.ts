import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AccountType, type User } from "@prisma/client";
import {
  defaultAccounts,
  generateAccessCode,
  generateAccountNumber,
  generateInvestmentHoldings,
  randomInvestmentBalance,
} from "@/lib/accountSetup";
import { generateMockTransactionsForAccount } from "@/lib/mockTransactions";

type CreateUserInput = {
  fullName: string;
  email: string;
  password: string;
};

function randomMemberSinceDate() {
  const start = new Date(2023, 0, 1); // Jan 1, 2023
  const end = new Date(2023, 2, 31); // Mar 31, 2023

  const randomTime =
    start.getTime() + Math.random() * (end.getTime() - start.getTime());

  return new Date(randomTime);
}

export async function createUserWithDefaults({
  fullName,
  email,
  password,
}: CreateUserInput): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 10);
  const accessCode = generateAccessCode();
  const investmentBalance = randomInvestmentBalance();
  const memberSinceDate = randomMemberSinceDate();

  const user = await prisma.user.create({
    data: {
      fullName,
      email: email.toLowerCase().trim(),
      passwordHash,
      accessCode,
      createdAt: memberSinceDate,
      bankAccounts: {
        create: [
          ...defaultAccounts.map((account) => ({
            accountName: account.accountName,
            accountType: account.accountType,
            accountNumber: generateAccountNumber(),
            balance: account.balance,
            isPrimary: account.isPrimary,
            createdAt: memberSinceDate,
          })),
          {
            accountName: "Investment Account",
            accountType: AccountType.INVESTMENT,
            accountNumber: generateAccountNumber(),
            balance: investmentBalance.toFixed(2),
            isPrimary: false,
            createdAt: memberSinceDate,
          },
        ],
      },
    },
    include: {
      bankAccounts: true,
    },
  });

  const investmentHoldings = generateInvestmentHoldings(
    user.id,
    investmentBalance
  );

  await prisma.investmentHolding.createMany({
    data: investmentHoldings,
  });

  for (const account of user.bankAccounts) {
    const transactions = generateMockTransactionsForAccount({
      userId: user.id,
      bankAccountId: account.id,
      accountType: account.accountType,
      accountCreatedAt: account.createdAt,
    });

    await prisma.transaction.createMany({
      data: transactions,
      skipDuplicates: true,
    });
  }

  return user;
}