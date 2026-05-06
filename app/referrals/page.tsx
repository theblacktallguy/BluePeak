import Link from "next/link";
import { Gift, Users, ShieldCheck } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

export default function ReferralsPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-24">
      <section className="bg-[#15589b] px-5 pb-6 pt-6 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="text-sm text-white/90">
            ‹ Back
          </Link>

          <div className="mt-6">
            <p className="text-sm text-white/75">Invite program</p>
            <h1 className="mt-1 text-2xl font-semibold">Refer Friends</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-5">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4fb]">
            <Gift className="text-[#15589b]" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Referral program preview
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            BluePeak Trust referral rewards are currently unavailable for this
            account. When active, eligible users may invite approved friends or
            family members and receive account rewards after qualification.
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <Users className="text-[#15589b]" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Invite eligibility
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Referral access may depend on account age, verification level,
                  and account standing.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[#15589b]" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Secure invitation process
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Referral links are disabled in this account. No personal invite
                  link is available at this time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}