import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function money(value: unknown) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AdminInvestmentsPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: {
      bankAccounts: true,
      investmentHoldings: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <Link href="/admin" className="text-sm text-slate-500">
            ‹ Admin
          </Link>

          <h1 className="mt-2 text-xl font-bold text-slate-900">
            Investment Controls
          </h1>

          <p className="text-sm text-slate-500">
            Review and manage user investment balances and portfolio holdings.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {users.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No users found.
            </div>
          ) : (
            users.map((user, index) => {
              const investmentAccount = user.bankAccounts.find(
                (account) => account.accountType === "INVESTMENT"
              );

              const portfolioTotal = user.investmentHoldings.reduce(
                (sum, holding) => sum + Number(holding.value),
                0
              );

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between gap-4 px-5 py-4 ${
                    index !== users.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {user.fullName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">{user.email}</p>

                    <p className="mt-1 text-xs text-slate-400">
                      {user.investmentHoldings.length} holdings • Portfolio: $
                      {money(portfolioTotal)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      ${money(investmentAccount?.balance ?? 0)}
                    </p>

                    <Link
                      href={`/admin/investments/${user.id}`}
                      className="mt-1 inline-block rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}