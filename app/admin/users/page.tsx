import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: {
      role: "USER",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      bankAccounts: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-slate-500">
              ‹ Admin
            </Link>
            <h1 className="mt-2 text-xl font-bold text-slate-900">
              Manage Users
            </h1>
            <p className="text-sm text-slate-500">
              View and manage customer accounts.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {users.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No users found.
            </div>
          ) : (
            users.map((user, index) => (
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
                    {user.bankAccounts.length} accounts • Joined{" "}
                    {user.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      user.isFrozen
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {user.isFrozen ? "Frozen" : "Active"}
                  </span>

                  <Link
                    href={`/admin/users/${user.id}`}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}