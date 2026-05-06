import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BottomNav from "@/components/layout/BottomNav";
import {
  ArrowRightLeft,
  Building2,
  Landmark,
  Globe,
  Receipt,
} from "lucide-react";

const options = [
  {
    title: "Internal Transfer",
    description: "Move money between your accounts",
    icon: ArrowRightLeft,
    href: "/transfers/new?type=internal",
    active: true,
  },
  {
    title: "External Transfer",
    description: "Send money to another bank",
    icon: Building2,
    href: "/transfers/new?type=external",
    active: true,
  },
  {
    title: "Wire Transfer",
    description: "Secure domestic wire transfer",
    icon: Landmark,
    href: "/transfers/new?type=wire",
    active: true,
  },
  {
    title: "Bill Payment",
    description: "Pay utilities and recurring bills",
    icon: Receipt,
    href: "/transfers/new?type=bill",
    active: true,
  },
  {
    title: "International Transfer",
    description: "Send money globally",
    icon: Globe,
    href: "/transfers/new?type=international",
    active: true,
  },
];

export default async function TransferPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-24">
      <section className="bg-[#15589b] px-5 pb-6 pt-6 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="text-sm text-white/90">
            ‹ Back
          </Link>

          <div className="mt-6">
            <p className="text-sm text-white/75">Send and manage transfers</p>
            <h1 className="mt-1 text-2xl font-semibold">Transfer</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-5">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-700">
            Transfer options
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Choose how you want to move money.
          </p>
        </div>

        <div className="space-y-3">
          {options.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4fb]">
                    <Icon size={20} className="text-[#15589b]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>

                <span className="text-slate-300">›</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4">
        <div className="rounded-xl bg-[#eaf3ff] px-4 py-4 ring-1 ring-blue-100">
          <p className="text-sm font-semibold text-slate-800">
            Secure Transfers
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            All transfer requests require your access code for verification and
            may be subject to approval before completion.
          </p>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}