import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuickActions from "@/components/dashboard/QuickActions";
import AccountCards from "@/components/dashboard/AccountCards";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import PendingTransfers from "@/components/dashboard/PendingTransfers";
import SpendingSummary from "@/components/dashboard/SpendingSummary";
import SecurityNotice from "@/components/dashboard/SecurityNotice";
import BottomNav from "@/components/layout/BottomNav";

export default async function DashboardPage() {
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
      transactions: {
        orderBy: { transactionDate: "desc" },
        take: 7,
      },
      transferRequests: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const totalBalance = user.bankAccounts.reduce((acc, account) => {
    return acc + Number(account.balance);
  }, 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const monthlyDebitTotal = await prisma.transaction.aggregate({
    where: {
      userId: user.id,
      type: {
        in: ["DEBIT", "TRANSFER"],
      },
      transactionDate: {
        gte: monthStart,
        lt: nextMonthStart,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return (
    <main className="min-h-dvh bg-[#f4f7fb] pb-20">
      <DashboardHeader
        bankName="BluePeak Trust"
        fullName={user.fullName}
        totalBalance={totalBalance}
      />

      <section className="mx-auto -mt-5 max-w-3xl px-4">
        <QuickActions />
        <AccountCards accounts={user.bankAccounts} />
        <RecentTransactions transactions={user.transactions} />
        <PendingTransfers transfers={user.transferRequests} />
        <SpendingSummary amount={Number(monthlyDebitTotal._sum.amount ?? 0)} />
        <SecurityNotice />
      </section>

      <BottomNav />
    </main>
  );
}