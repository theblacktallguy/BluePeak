import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { approveTransfer, declineTransfer } from "./actions";

function money(value: unknown) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AdminTransfersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const transfers = await prisma.transferRequest.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
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
            Transfer Requests
          </h1>

          <p className="text-sm text-slate-500">
            Review and manage customer transfer activity.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {transfers.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No transfer requests found.
            </div>
          ) : (
            transfers.map((transfer, index) => (
              <div
                key={transfer.id}
                className={`px-5 py-5 ${
                  index !== transfers.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {transfer.recipientName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {transfer.recipientBank}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {transfer.recipientAccount}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      From user:{" "}
                      <span className="font-semibold">
                        {transfer.user.fullName}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      ${money(transfer.amount)}
                    </p>

                    <p
                      className={`mt-2 text-xs font-semibold ${
                        transfer.status === "APPROVED"
                          ? "text-green-600"
                          : transfer.status === "DECLINED"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {transfer.status}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {transfer.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {transfer.note && (
                  <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-600">
                      {transfer.note}
                    </p>
                  </div>
                )}

                {transfer.status === "PENDING" && (
                    <div className="mt-4 flex gap-3">
                        <form
                            action={async () => {
                            "use server";
                            await approveTransfer(transfer.id);
                            }}
                        >
                            <button className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white">
                            Approve
                            </button>
                        </form>

                        <form
                            action={async () => {
                            "use server";
                            await declineTransfer(transfer.id);
                            }}
                        >
                            <button className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white">
                            Decline
                            </button>
                        </form>
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}