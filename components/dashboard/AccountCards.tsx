import Link from "next/link";
import type { BankAccount } from "@prisma/client";

type Props = {
  accounts: BankAccount[];
};

function formatAccountType(type: string) {
  switch (type) {
    case "CHECKING":
      return "Checking";
    case "SAVINGS":
      return "Savings";
    case "CREDIT":
      return "Credit";
    case "INVESTMENT":
      return "Investment";
    default:
      return type;
  }
}

function getAccountHref(account: BankAccount) {
  if (account.accountType === "INVESTMENT") {
    return "/investments";
  }

  return `/accounts/${account.id}`;
}

export default function AccountCards({ accounts }: Props) {
  return (
    <section className="mt-4 space-y-3">
      {accounts.map((account) => (
        <Link
          href={getAccountHref(account)}
          key={account.id}
          className="flex items-center justify-between rounded-md bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
        >
          <div>
            <p className="text-[11px] text-slate-500">
              {account.accountName} ({formatAccountType(account.accountType)})
            </p>

            <p className="mt-1 text-2xl font-light text-slate-900">
              ${Number(account.balance).toLocaleString()}
            </p>
          </div>

          <span className="text-xl text-slate-300">›</span>
        </Link>
      ))}
    </section>
  );
}