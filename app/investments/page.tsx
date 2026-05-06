import Link from "next/link";
import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import BottomNav from "@/components/layout/BottomNav";

function money(value: unknown) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function InvestmentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bankAccounts: true,
      investmentHoldings: {
        orderBy: {
          value: "desc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const investmentAccount = user.bankAccounts.find(
    (account) => account.accountType === "INVESTMENT"
  );

  const portfolioTotal = user.investmentHoldings.reduce((acc, holding) => {
    return acc + Number(holding.value);
  }, 0);

  const monthlyChange = user.investmentHoldings.reduce((acc, holding) => {
    return acc + Number(holding.changePct);
  }, 0);

  const averageChange =
    user.investmentHoldings.length > 0
      ? monthlyChange / user.investmentHoldings.length
      : 0;

  const positive = averageChange >= 0;

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-24">
      <section className="bg-[#15589b] px-5 pb-8 pt-6 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="text-sm text-white/90">
            ‹ Back
          </Link>

          <div className="mt-6">
            <p className="text-sm text-white/75">
              Managed investment portfolio
            </p>

            <h1 className="mt-1 text-2xl font-semibold">
              Investments
            </h1>
          </div>

          <div className="mt-8 rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm text-white/75">
              Total portfolio value
            </p>

            <h2 className="mt-2 text-4xl font-light tracking-tight">
              ${money(portfolioTotal)}
            </h2>

            <div className="mt-4 flex items-center gap-2">
              {positive ? (
                <TrendingUp size={18} className="text-green-300" />
              ) : (
                <TrendingDown size={18} className="text-red-300" />
              )}

              <p
                className={`text-sm font-medium ${
                  positive ? "text-green-200" : "text-red-200"
                }`}
              >
                {averageChange.toFixed(2)}% this month
              </p>
            </div>

            {investmentAccount && (
              <p className="mt-4 text-xs text-white/70">
                Investment Account • {investmentAccount.accountNumber}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Portfolio Holdings
          </h2>

          <p className="text-xs text-slate-500">
            {user.investmentHoldings.length} stocks
          </p>
        </div>

        <div className="space-y-3">
          {user.investmentHoldings.map((holding) => {
            const up = Number(holding.changePct) >= 0;

            return (
              <div
                key={holding.id}
                className="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {holding.symbol}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {holding.companyName}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {holding.category}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      ${money(holding.value)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {money(holding.shares)} shares
                    </p>

                    <p
                      className={`mt-2 text-xs font-semibold ${
                        up ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {up ? "+" : ""}
                      {Number(holding.changePct).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}