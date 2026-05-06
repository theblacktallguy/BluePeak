import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateInvestmentHoldings } from "@/lib/accountSetup";

type Props = {
  params: Promise<{ userId: string }>;
};

function money(value: unknown) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AdminInvestmentUserPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bankAccounts: true,
      investmentHoldings: {
        orderBy: { value: "desc" },
      },
    },
  });

  if (!user || user.role !== "USER") {
    notFound();
  }

  const investmentAccount = user.bankAccounts.find(
    (account) => account.accountType === "INVESTMENT"
  );

  if (!investmentAccount) {
    notFound();
  }

  const safeUserId = user.id;
  const safeInvestmentAccountId = investmentAccount.id;

  const portfolioTotal = user.investmentHoldings.reduce(
    (sum, holding) => sum + Number(holding.value),
    0
  );

  async function updateInvestmentBalance(formData: FormData) {
    "use server";

    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      redirect("/login");
    }

    const newBalance = Number(formData.get("balance") ?? 0);

    if (Number.isNaN(newBalance) || newBalance < 0) {
      return;
    }

    await prisma.$transaction([
      prisma.bankAccount.update({
        where: { id: safeInvestmentAccountId },
        data: {
          balance: newBalance.toFixed(2),
        },
      }),

      prisma.investmentHolding.deleteMany({
        where: { userId: safeUserId },
      }),

      prisma.investmentHolding.createMany({
        data: generateInvestmentHoldings(safeUserId, newBalance),
      }),
    ]);

    revalidatePath("/admin/investments");
    revalidatePath(`/admin/investments/${safeUserId}`);
    revalidatePath(`/admin/users/${safeUserId}`);
    revalidatePath("/dashboard");
    revalidatePath("/investments");

    redirect(`/admin/investments/${safeUserId}`);
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <Link href="/admin/investments" className="text-sm text-slate-500">
            ‹ Investments
          </Link>

          <h1 className="mt-2 text-xl font-bold text-slate-900">
            Manage Investment
          </h1>

          <p className="text-sm text-slate-500">
            {user.fullName} • {user.email}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Investment account"
            value={`$${money(investmentAccount.balance)}`}
          />

          <StatCard
            label="Portfolio total"
            value={`$${money(portfolioTotal)}`}
          />

          <StatCard
            label="Holdings"
            value={`${user.investmentHoldings.length}`}
          />
        </div>

        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">
            Update investment balance
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Updating this balance will regenerate the user’s 10-stock portfolio
            so the portfolio total matches the investment account balance.
          </p>

          <form action={updateInvestmentBalance} className="mt-5 space-y-4">
            <input
              name="balance"
              type="number"
              step="0.01"
              min="0"
              defaultValue={Number(investmentAccount.balance)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 outline-none focus:border-slate-900"
            />

            <button className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
              Update & Regenerate Portfolio
            </button>
          </form>
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Current Holdings
          </h2>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            {user.investmentHoldings.map((holding, index) => (
              <div
                key={holding.id}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${
                  index !== user.investmentHoldings.length - 1 ? "border-b" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {holding.symbol}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {holding.companyName}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    ${money(holding.value)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {money(holding.shares)} shares •{" "}
                    {Number(holding.changePct).toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}