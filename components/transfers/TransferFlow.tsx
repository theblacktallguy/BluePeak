"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import BottomNav from "@/components/layout/BottomNav";

type TransferAccount = {
  id: string;
  accountName: string;
  accountType: "CHECKING" | "SAVINGS" | "CREDIT" | "INVESTMENT";
  accountNumber: string;
  balance: number;
  currency: string;
  isPrimary: boolean;
};

type Props = {
  accounts: TransferAccount[];
  userAccessCode: string;
};

type TransferForm = {
  fromAccountId: string;
  recipientName: string;
  recipientBank: string;
  recipientAccount: string;
  recipientRouting: string;
  amount: string;
  note: string;
  accessCode: string;
};

const steps = ["Account", "Recipient", "Amount", "Verify", "Review"];

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#15589b] focus:ring-2 focus:ring-[#15589b]/10";

export default function TransferFlow({ accounts, userAccessCode }: Props) {
  const transferableAccounts = accounts.filter(
    (account) => account.accountType !== "CREDIT"
  );

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<TransferForm>({
    fromAccountId: transferableAccounts[0]?.id ?? accounts[0]?.id ?? "",
    recipientName: "",
    recipientBank: "",
    recipientAccount: "",
    recipientRouting: "",
    amount: "",
    note: "",
    accessCode: "",
  });

  const selectedAccount = useMemo(() => {
    return accounts.find((account) => account.id === form.fromAccountId);
  }, [accounts, form.fromAccountId]);

  const amountNumber = Number(form.amount || 0);
  const selectedBalance = Number(selectedAccount?.balance ?? 0);
  const isCreditAccount = selectedAccount?.accountType === "CREDIT";
  const hasEnoughBalance = amountNumber > 0 && amountNumber <= selectedBalance;
  const accessCodeValid = form.accessCode === userAccessCode;

  function canContinue() {
    if (step === 0) {
      return Boolean(form.fromAccountId) && !isCreditAccount;
    }

    if (step === 1) {
      return (
        form.recipientName.trim().length > 1 &&
        form.recipientBank.trim().length > 1 &&
        form.recipientAccount.trim().length >= 6 &&
        form.recipientRouting.trim().length >= 6
      );
    }

    if (step === 2) {
      return amountNumber > 0 && hasEnoughBalance && !isCreditAccount;
    }

    if (step === 3) {
      return form.accessCode.trim().length > 0;
    }

    return true;
  }

  function next() {
    setError("");
    if (!canContinue()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function back() {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submitTransfer() {
    setError("");

    if (!accessCodeValid) {
      setError("Invalid access code.");
      return;
    }

    if (!selectedAccount || isCreditAccount || !hasEnoughBalance) {
      setError("This transfer cannot be completed from the selected account.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromAccountId: form.fromAccountId,
          recipientName: form.recipientName,
          recipientBank: form.recipientBank,
          recipientAccount: form.recipientAccount,
          recipientRouting: form.recipientRouting,
          amount: form.amount,
          note: form.note,
          accessCode: form.accessCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Transfer failed.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-dvh bg-[#f4f7fb] pb-20">
        <section className="bg-[#15589b] px-5 pb-6 pt-6 text-white">
          <div className="mx-auto max-w-3xl">
            <Link href="/transfers" className="text-sm text-white/90">
              ‹ Transfers
            </Link>
            <h1 className="mt-6 text-2xl font-semibold">Transfer Submitted</h1>
            <p className="mt-1 text-sm text-white/75">
              Your request is pending review.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-5">
          <div className="rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green-600">
              ✓
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Transfer request received
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This transfer has been submitted for approval. You will see the
              final status in your activity history once reviewed.
            </p>

            <Link
              href="/dashboard"
              className="mt-5 inline-flex rounded-md bg-[#15589b] px-5 py-2 text-sm font-semibold text-white"
            >
              Back to dashboard
            </Link>
          </div>
        </section>

        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#f4f7fb] pb-20">
      <section className="bg-[#15589b] px-5 pb-6 pt-6 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/transfers" className="text-sm text-white/90">
            ‹ Transfers
          </Link>

          <div className="mt-6">
            <p className="text-sm text-white/75">Step {step + 1} of 5</p>
            <h1 className="mt-1 text-2xl font-semibold">New Transfer</h1>
          </div>

          <div className="mt-5 grid grid-cols-5 gap-1">
            {steps.map((item, index) => (
              <div
                key={item}
                className={`h-1.5 rounded-full ${
                  index <= step ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-5">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          {step === 0 && (
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Select source account
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Choose the account you want to transfer from.
              </p>

              <div className="mt-4 space-y-3">
                {accounts.map((account) => {
                  const selected = form.fromAccountId === account.id;
                  const blocked = account.accountType === "CREDIT";

                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, fromAccountId: account.id })
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-left ${
                        selected
                          ? "border-[#15589b] bg-[#eef4fb]"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {account.accountName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {account.accountType} • Available balance
                          </p>
                          <p className="mt-1 text-lg font-light text-slate-900">
                            ${Number(account.balance).toLocaleString()}
                          </p>
                        </div>

                        {selected && (
                          <span className="rounded-full bg-[#15589b] px-2 py-1 text-[10px] font-semibold text-white">
                            Selected
                          </span>
                        )}
                      </div>

                      {blocked && (
                        <p className="mt-2 text-xs text-red-500">
                          Transfers cannot be sent from credit accounts.
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recipient details
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Enter the receiver’s bank information.
              </p>

              <div className="mt-4 space-y-3">
                <input
                  value={form.recipientName}
                  onChange={(e) =>
                    setForm({ ...form, recipientName: e.target.value })
                  }
                  placeholder="Recipient full name"
                  className={inputClass}
                />

                <input
                  value={form.recipientBank}
                  onChange={(e) =>
                    setForm({ ...form, recipientBank: e.target.value })
                  }
                  placeholder="Bank name"
                  className={inputClass}
                />

                <input
                  value={form.recipientAccount}
                  onChange={(e) =>
                    setForm({ ...form, recipientAccount: e.target.value })
                  }
                  placeholder="Account number"
                  className={inputClass}
                />

                <input
                  value={form.recipientRouting}
                  onChange={(e) =>
                    setForm({ ...form, recipientRouting: e.target.value })
                  }
                  placeholder="Routing number"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-base font-semibold text-slate-900">Amount</h2>
              <p className="mt-1 text-xs text-slate-500">
                Enter how much you want to transfer.
              </p>

              <div className="mt-4 space-y-3">
                <input
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  type="number"
                  placeholder="0.00"
                  className={inputClass}
                />

                {selectedAccount && (
                  <p className="text-xs text-slate-500">
                    Available balance: ${selectedBalance.toLocaleString()}
                  </p>
                )}

                {selectedAccount && amountNumber > selectedBalance && (
                  <p className="text-xs text-red-500">
                    Insufficient balance in {selectedAccount.accountName}.
                  </p>
                )}

                <input
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Note optional"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Access code
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Enter your transfer access code to continue.
              </p>

              <div className="mt-4">
                <input
                  value={form.accessCode}
                  onChange={(e) =>
                    setForm({ ...form, accessCode: e.target.value })
                  }
                  type="password"
                  placeholder="Enter access code"
                  className={inputClass}
                />

                {form.accessCode.length > 0 && !accessCodeValid && (
                  <p className="mt-2 text-xs text-red-500">
                    Access code will be verified before submission.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Review transfer
              </h2>

              <div className="mt-4 space-y-3 text-sm">
                <ReviewRow
                  label="From"
                  value={selectedAccount?.accountName ?? "-"}
                />
                <ReviewRow label="Recipient" value={form.recipientName} />
                <ReviewRow label="Bank" value={form.recipientBank} />
                <ReviewRow label="Account" value={form.recipientAccount} />
                <ReviewRow label="Routing" value={form.recipientRouting} />
                <ReviewRow
                  label="Amount"
                  value={`$${amountNumber.toLocaleString()}`}
                />
                {form.note && <ReviewRow label="Note" value={form.note} />}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={!canContinue() || loading}
              onClick={next}
              className="flex-1 rounded-lg bg-[#15589b] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={!canContinue() || loading}
              onClick={submitTransfer}
              className="flex-1 rounded-lg bg-[#15589b] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Submitting..." : "Submit Transfer"}
            </button>
          )}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}