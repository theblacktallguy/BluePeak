import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import BottomNav from "@/components/layout/BottomNav";
import { ShieldCheck, User, Bell, Headphones } from "lucide-react";

function money(value: unknown) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bankAccounts: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const totalBalance = user.bankAccounts.reduce(
    (acc, account) => acc + Number(account.balance),
    0
  );

  const investmentAccount = user.bankAccounts.find(
    (account) => account.accountType === "INVESTMENT"
  );

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-24">
      <section className="bg-[#15589b] px-5 pb-6 pt-6 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="text-sm text-white/90">
            ‹ Back
          </Link>

          <div className="mt-6">
            <p className="text-sm text-white/75">Account profile</p>
            <h1 className="mt-1 text-2xl font-semibold">Profile</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4fb]">
              <User className="text-[#15589b]" />
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-900">
                {user.fullName}
              </p>
              <p className="text-sm text-slate-500">{user.email}</p>
              <p className="mt-1 text-xs font-semibold text-green-600">
                {user.isActive && !user.isFrozen ? "Active account" : "Restricted"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <InfoCard label="Member since" value={user.createdAt.toLocaleDateString()} />
          <InfoCard label="Total balance" value={`$${money(totalBalance)}`} />
          <InfoCard label="Linked accounts" value={`${user.bankAccounts.length}`} />
          <InfoCard
            label="Investment balance"
            value={`$${money(investmentAccount?.balance ?? 0)}`}
          />
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Security
          </h2>

          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-[#15589b]" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Transfer access code
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {user.accessCode ? "Access code is set." : "Access code is not set."}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Your access code is required before transfer requests can be submitted.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Preferences
          </h2>

          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start gap-3">
              <Bell className="text-[#15589b]" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Notifications
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Email alerts enabled for account activity and transfer updates.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Support
          </h2>

          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start gap-3">
              <Headphones className="text-[#15589b]" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Need help?
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Contact support for account questions, card support, or transfer assistance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="mt-6"
        >
          <button className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white">
            Sign out
          </button>
        </form>
      </section>

      <BottomNav />
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}