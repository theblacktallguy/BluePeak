import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BottomNav from "@/components/layout/BottomNav";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function money(value: unknown) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function maskAccountNumber(accountNumber: string) {
  if (accountNumber.length <= 4) return accountNumber;
  return `•••• ${accountNumber.slice(-4)}`;
}

function getRoutingNumber(accountNumber: string) {
  return `0210${accountNumber.slice(-5)}`;
}

export default async function AccountDetailsPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const account = await prisma.bankAccount.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      transactions: {
        orderBy: {
          transactionDate: "desc",
        },
        take: 30,
      },
    },
  });

  if (!account) {
    notFound();
  }

  if (account.accountType === "INVESTMENT") {
    redirect("/investments");
  }

  const isCredit = account.accountType === "CREDIT";
  const routingNumber = getRoutingNumber(account.accountNumber);

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-24">
      <section className="bg-[#15589b] px-5 pb-8 pt-6 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="text-sm text-white/90">
            ‹ Accounts
          </Link>

          <div className="mt-6">
            <p className="text-sm text-white/75">
              {isCredit ? "Available to spend" : "Available balance"}
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              {account.accountName}
            </h1>
          </div>

          <div className="mt-8 rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm text-white/75">
              {isCredit ? "Current balance" : "Available balance"}
            </p>

            <h2 className="mt-2 text-4xl font-light tracking-tight">
              ${money(account.balance)}
            </h2>

            <p className="mt-4 text-xs text-white/70">
              {maskAccountNumber(account.accountNumber)}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-5">
        {isCredit ? (
            <div className="space-y-4">
                <div className="rounded-2xl bg-[#15589b] p-5 text-white shadow-lg">
                <p className="text-xs text-white/75">BluePeak Trust</p>

                <div className="mt-8 text-lg tracking-[0.25em]">
                    •••• •••• •••• {account.accountNumber.slice(-4)}
                </div>

                <div className="mt-6 flex items-end justify-between">
                    <div>
                    <p className="text-[10px] uppercase text-white/60">
                        Cardholder
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                        Premium Member
                    </p>
                    </div>

                    <div className="text-right">
                    <p className="text-[10px] uppercase text-white/60">
                        Type
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                        Visa Platinum
                    </p>
                    </div>
                </div>
                </div>

                <div className="grid gap-3">
                <div className="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs text-slate-500">Available to spend</p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">
                    ${money(account.balance)}
                    </p>
                </div>

                <div className="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs text-slate-500">Card number</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                    {maskAccountNumber(account.accountNumber)}
                    </p>
                </div>

                <div className="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs text-slate-500">Payment status</p>
                    <p className="mt-1 text-sm font-semibold text-green-600">
                    Current
                    </p>
                </div>
                </div>
            </div>
        ) : (
          <div className="grid gap-3">
            <div className="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs text-slate-500">Current balance</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                ${money(account.balance)}
              </p>
            </div>

            <div className="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs text-slate-500">Account number</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {account.accountNumber}
              </p>
            </div>

            <div className="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs text-slate-500">Routing number</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {routingNumber}
              </p>
            </div>
          </div>
        )}

        <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">
                    Account history
                </h2>

                <Link
                    href="/transactions"
                    className="text-xs font-semibold text-[#15589b]"
                >
                    View all
                </Link>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                {account.transactions.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No history for this account yet.
                    </div>
                ) : (
                    account.transactions.map((tx, index) => {
                    const isCreditTx = tx.type === "CREDIT";

                    return (
                        <div
                        key={tx.id}
                        className={`px-4 py-4 ${
                            index !== account.transactions.length - 1
                            ? "border-b"
                            : ""
                        }`}
                        >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                            <p className="text-sm font-semibold text-slate-800">
                                {tx.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                {new Date(tx.transactionDate).toLocaleDateString()} •{" "}
                                {tx.reference}
                            </p>
                            </div>

                            <div className="text-right">
                            <p
                                className={`text-sm font-bold ${
                                isCreditTx ? "text-green-600" : "text-red-500"
                                }`}
                            >
                                {isCreditTx ? "+" : "-"}${money(tx.amount)}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                {tx.status}
                            </p>
                            </div>
                        </div>
                        </div>
                    );
                    })
                )}
            </div>
            {account.transactions.length > 0 && (
            <Link
                href="/transactions"
                className="mt-4 flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-[#15589b] shadow-sm active:bg-slate-50"
            >
                Load more activity
            </Link>
            )}
        </section>
      </section>

      <BottomNav />
    </main>
  );
}