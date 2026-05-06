import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [totalUsers, activeUsers, frozenUsers, pendingTransfers] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "USER", isActive: true } }),
      prisma.user.count({ where: { role: "USER", isFrozen: true } }),
      prisma.transferRequest.count({ where: { status: "PENDING" } }),
    ]);

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">System management panel</p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700"
          >
            User view
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total users" value={totalUsers} />
          <StatCard label="Active users" value={activeUsers} />
          <StatCard label="Frozen users" value={frozenUsers} />
          <StatCard label="Pending transfers" value={pendingTransfers} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <AdminLink title="Manage Users" href="/admin/users" />
          <AdminLink title="Transfer Requests" href="/admin/transfers" />
          <AdminLink title="Investment Controls" href="/admin/investments" />
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function AdminLink({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl bg-white p-5 font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
    >
      {title}
    </Link>
  );
}