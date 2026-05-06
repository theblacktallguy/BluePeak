"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function makeReference() {
  return `BP-TX-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function approveTransfer(transferId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const transfer = await prisma.transferRequest.findUnique({
    where: { id: transferId },
  });

  if (!transfer || transfer.status !== "PENDING") {
    return;
  }

  const account = await prisma.bankAccount.findFirst({
    where: {
      id: transfer.fromAccountId,
      userId: transfer.userId,
    },
  });

  if (!account || account.accountType === "CREDIT") {
    return;
  }

  const currentBalance = Number(account.balance);
  const amount = Number(transfer.amount);

  if (currentBalance < amount) {
    await prisma.transferRequest.update({
      where: { id: transfer.id },
      data: {
        status: "FAILED",
        adminNote: "Insufficient account balance at approval time.",
      },
    });

    revalidatePath("/admin/transfers");
    return;
  }

  const newBalance = currentBalance - amount;

  await prisma.$transaction([
    prisma.bankAccount.update({
      where: { id: account.id },
      data: {
        balance: newBalance.toFixed(2),
      },
    }),

    prisma.transferRequest.update({
      where: { id: transfer.id },
      data: {
        status: "APPROVED",
        adminNote: "Transfer approved by admin.",
      },
    }),

    prisma.transaction.create({
      data: {
        userId: transfer.userId,
        bankAccountId: account.id,
        type: "TRANSFER",
        status: "SUCCESS",
        title: "External Transfer",
        description: `Transfer to ${transfer.recipientName} - ${transfer.recipientBank}`,
        amount: amount.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        reference: makeReference(),
        transactionDate: new Date(),
      },
    }),
  ]);

  revalidatePath("/admin/transfers");
  revalidatePath(`/admin/users/${transfer.userId}`);
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function declineTransfer(transferId: string) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  await prisma.transferRequest.update({
    where: { id: transferId },
    data: {
      status: "DECLINED",
      adminNote: "Transfer declined by admin.",
    },
  });

  revalidatePath("/admin/transfers");
}