import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toggleUserFreeze, createUserAccount } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
};

function money(value: unknown) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AdminUserDetailPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      bankAccounts: {
        orderBy: { createdAt: "asc" },
      },
      transferRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user || user.role !== "USER") {
    notFound();
  }

  const totalBalance = user.bankAccounts.reduce(
    (sum, account) => sum + Number(account.balance),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <Link href="/admin/users" className="text-sm text-slate-500">
            ‹ Users
          </Link>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {user.fullName}
              </h1>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                user.isFrozen
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {user.isFrozen ? "Frozen" : "Active"}
            </span>
            
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total balance" value={`$${money(totalBalance)}`} />
          <StatCard label="Accounts" value={`${user.bankAccounts.length}`} />
          <StatCard
            label="Access code"
            value={user.accessCode ?? "Not set"}
          />
          <StatCard
            label="Joined"
            value={user.createdAt.toLocaleDateString()}
          />
        </div>

        <form
            action={async () => {
                "use server";
                await toggleUserFreeze(user.id, !user.isFrozen);
            }}
            className="mt-6"
            >
            <button
                className={`rounded-lg px-5 py-3 text-sm font-semibold text-white ${
                user.isFrozen ? "bg-green-600" : "bg-red-600"
                }`}
            >
                {user.isFrozen ? "Unfreeze User" : "Freeze User"}
            </button>
        </form>

        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">
            Create account section
        </h2>

        <p className="mt-1 text-xs text-slate-500">
            Add a missing account type for this user. Balance edits do not create transaction history.
        </p>

        <form
            action={async (formData) => {
            "use server";
            await createUserAccount(user.id, formData);
            }}
            className="mt-5 grid gap-3 md:grid-cols-4"
        >
            <input
            name="accountName"
            placeholder="Account name"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />

            <select
            name="accountType"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            defaultValue="CHECKING"
            >
            <option value="CHECKING">Checking</option>
            <option value="SAVINGS">Savings</option>
            <option value="CREDIT">Credit</option>
            <option value="INVESTMENT">Investment</option>
            </select>

            <input
            name="balance"
            type="number"
            min="0"
            step="0.01"
            placeholder="Balance"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />

            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Create Account
            </button>
        </form>
    </div>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Account balances
          </h2>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            {user.bankAccounts.map((account, index) => (
              <div
                key={account.id}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${
                  index !== user.bankAccounts.length - 1 ? "border-b" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {account.accountName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {account.accountType} • {account.accountNumber}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    ${money(account.balance)}
                  </p>
                  <Link
                    href={`/admin/users/${user.id}/accounts/${account.id}`}
                    className="mt-1 inline-block text-xs font-semibold text-blue-600"
                  >
                    Edit balance
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Recent transfer requests
          </h2>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            {user.transferRequests.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500">
                No transfer requests yet.
              </div>
            ) : (
              user.transferRequests.map((transfer, index) => (
                <div
                  key={transfer.id}
                  className={`flex items-center justify-between gap-4 px-5 py-4 ${
                    index !== user.transferRequests.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {transfer.recipientName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {transfer.recipientBank} • {transfer.recipientAccount}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      ${money(transfer.amount)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {transfer.status}
                    </p>
                  </div>
                </div>
              ))
            )}
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