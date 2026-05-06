"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AccountType } from "@prisma/client";


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
  revalidatePath("/dashboard");
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