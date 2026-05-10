"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AccountType } from "@prisma/client";
import { generateMockTransactionsForAccount } from "@/lib/mockTransactions";

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export async function createUserAccount(userId: string, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const accountName = String(formData.get("accountName") ?? "").trim();
  const accountType = String(formData.get("accountType") ?? "") as AccountType;
  const balance = Number(formData.get("balance") ?? 0);

  if (!accountName || !accountType || Number.isNaN(balance) || balance < 0) {
    return;
  }

  await prisma.bankAccount.create({
    data: {
      userId,
      accountName,
      accountType,
      accountNumber: generateAccountNumber(),
      balance: balance.toFixed(2),
      isPrimary: false,
    },
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  revalidatePath("/admin/investments");
  revalidatePath("/dashboard");
  revalidatePath("/investments");
}

export async function toggleUserFreeze(userId: string, freeze: boolean) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isFrozen: freeze,
      isActive: !freeze,
    },
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  revalidatePath("/admin/investments");
  revalidatePath("/dashboard");
  revalidatePath("/investments");
}

export async function regenerateUserHistory(userId: string, formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const startYear = Number(formData.get("startYear"));
  const startMonth = Number(formData.get("startMonth"));
  const endYear = Number(formData.get("endYear"));
  const endMonth = Number(formData.get("endMonth"));

  if (
    Number.isNaN(startYear) ||
    Number.isNaN(startMonth) ||
    Number.isNaN(endYear) ||
    Number.isNaN(endMonth) ||
    startMonth < 0 ||
    startMonth > 11 ||
    endMonth < 0 ||
    endMonth > 11
  ) {
    return;
  }

  const startDate = new Date(startYear, startMonth, 1);
  const endDate = new Date(endYear, endMonth, 1);

  if (startDate > endDate) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bankAccounts: true,
    },
  });

  if (!user || user.role !== "USER") {
    return;
  }

  await prisma.transaction.deleteMany({
    where: {
      userId,
    },
  });

  for (const account of user.bankAccounts) {
    const transactions = generateMockTransactionsForAccount({
      userId,
      bankAccountId: account.id,
      accountType: account.accountType,
      accountCreatedAt: account.createdAt,
      startYear,
      startMonth,
      endYear,
      endMonth,
    });

    await prisma.transaction.createMany({
      data: transactions,
      skipDuplicates: true,
    });
  }

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}