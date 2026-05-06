import Link from "next/link";
import type { Transaction } from "@/app/generated/prisma/client";

type Props = {
  transactions: Transaction[];
};

export default function RecentTransactions({ transactions }: Props) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          Recent Transactions
        </h2>

        <Link href="/transactions" className="text-xs font-semibold text-[#15589b]">
          View all
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {transactions.length === 0 ? (
          <div className="px-4 py-5 text-center text-sm text-slate-500">
            No transactions yet.
          </div>
        ) : (
          transactions.map((tx, index) => {
            const isCredit = tx.type === "CREDIT";

            return (
              <div
                key={tx.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  index !== transactions.length - 1 ? "border-b" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{tx.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(tx.transactionDate).toLocaleDateString()}
                  </p>
                </div>

                <p
                  className={`text-sm font-semibold ${
                    isCredit ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isCredit ? "+" : "-"}${Number(tx.amount).toLocaleString()}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}