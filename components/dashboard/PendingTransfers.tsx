import Link from "next/link";
import type { TransferRequest } from "@prisma/client";

type Props = {
  transfers: TransferRequest[];
};

function money(value: unknown) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PendingTransfers({ transfers }: Props) {
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          Transfer Status
        </h2>

        <Link href="/transfers" className="text-xs font-semibold text-[#15589b]">
          Manage
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        {transfers.length === 0 ? (
          <div className="px-4 py-4">
            <p className="text-sm font-medium text-slate-800">
              No pending transfer requests
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Transfers requiring approval will appear here.
            </p>
          </div>
        ) : (
          transfers.map((transfer, index) => (
            <div
              key={transfer.id}
              className={`px-4 py-4 ${
                index !== transfers.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {transfer.recipientName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {transfer.recipientBank} • {transfer.recipientAccount}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-yellow-600">
                    Pending approval
                  </p>
                </div>

                <p className="text-sm font-bold text-slate-900">
                  ${money(transfer.amount)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}