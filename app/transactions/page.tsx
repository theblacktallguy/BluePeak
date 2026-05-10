import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BottomNav from "@/components/layout/BottomNav";

function money(value: unknown) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function TransactionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      transactions: {
        orderBy: { transactionDate: "desc" },
        include: {
          bankAccount: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-dvh bg-[#f4f7fb] pb-20">
      <section className="bg-[#15589b] px-5 pb-6 pt-6 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="text-sm text-white/90">
            ‹ Back
          </Link>

          <div className="mt-6">
            <p className="text-sm text-white/75">Full transaction history</p>
            <h1 className="mt-1 text-2xl font-semibold">Activity</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-5">
        <div className="mb-4 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs text-slate-500">Total records</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {user.transactions.length}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {user.transactions.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No transactions yet.
            </div>
          ) : (
            user.transactions.map((tx, index) => {
              const isCredit = tx.type === "CREDIT";

              return (
                <div
                  key={tx.id}
                  className={`px-4 py-4 ${
                    index !== user.transactions.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {tx.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {tx.bankAccount.accountName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(tx.transactionDate).toLocaleDateString()} •{" "}
                        {tx.reference}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          isCredit ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {isCredit ? "+" : "-"}${money(tx.amount)}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {tx.status}
                      </p>
                    </div>
                  </div>

                  {tx.description && (
                    <p className="mt-2 text-xs text-slate-500">
                      {tx.description}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {user.transactions.length > 0 && (
          <div className="py-6 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#15589b]" />
            <p className="mt-2 text-xs text-slate-500">Loading more...</p>
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}