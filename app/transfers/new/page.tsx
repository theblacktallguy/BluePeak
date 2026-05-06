import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TransferFlow from "@/components/transfers/TransferFlow";

export default async function NewTransferPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bankAccounts: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const accounts = user.bankAccounts.map((account) => ({
    id: account.id,
    accountName: account.accountName,
    accountType: account.accountType,
    accountNumber: account.accountNumber,
    balance: Number(account.balance),
    currency: account.currency,
    isPrimary: account.isPrimary,
  }));

  return (
    <TransferFlow
      accounts={accounts}
      userAccessCode={user.accessCode ?? ""}
    />
  );
}