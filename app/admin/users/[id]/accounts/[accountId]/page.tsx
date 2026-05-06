import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
    accountId: string;
  }>;
};

function money(value: unknown) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AdminEditAccountPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const { id, accountId } = await params;

  const account = await prisma.bankAccount.findFirst({
    where: {
      id: accountId,
      userId: id,
    },
    include: {
      user: true,
    },
  });

    if (!account || account.user.role !== "USER") {
        notFound();
    }

    const safeAccountId = account.id;

    async function updateBalance(formData: FormData) {
        "use server";

        const session = await auth();

        if (!session?.user?.id || session.user.role !== "ADMIN") {
        redirect("/login");
        }

        const newBalance = Number(formData.get("balance") ?? 0);

        if (Number.isNaN(newBalance) || newBalance < 0) {
        return;
        }

        await prisma.bankAccount.update({
        where: {
            id: safeAccountId,
        },
        data: {
            balance: newBalance.toFixed(2),
        },
        });

        revalidatePath(`/admin/users/${id}`);
        revalidatePath(`/admin/users/${id}/accounts/${accountId}`);
        revalidatePath("/dashboard");

        redirect(`/admin/users/${id}`);
    }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <Link href={`/admin/users/${id}`} className="text-sm text-slate-500">
            ‹ Back to user
          </Link>

          <h1 className="mt-3 text-xl font-bold text-slate-900">
            Edit Balance
          </h1>

          <p className="text-sm text-slate-500">
            {account.user.fullName} • {account.accountName}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-6">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Current balance</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            ${money(account.balance)}
          </p>

          <form action={updateBalance} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                New balance
              </label>

              <input
                name="balance"
                type="number"
                step="0.01"
                min="0"
                defaultValue={Number(account.balance)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 outline-none focus:border-slate-900"
              />
            </div>

            <button className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white">
              Update Balance
            </button>
          </form>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Balance edits update the user’s displayed account balance only. They
            do not create user transaction history.
          </p>
        </div>
      </section>
    </main>
  );
}