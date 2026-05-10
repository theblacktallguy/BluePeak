import Link from "next/link";
import { ShieldCheck, TrendingUp, AlertCircle } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

const score = 784;

export default function CreditScorePage() {
  return (
    <main className="min-h-dvh bg-[#f4f7fb] pb-20">
      <section className="bg-[#15589b] px-5 pb-8 pt-6 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="text-sm text-white/90">
            ‹ Back
          </Link>

          <div className="mt-6">
            <p className="text-sm text-white/75">Credit monitoring</p>
            <h1 className="mt-1 text-2xl font-semibold">Credit Score</h1>
          </div>

          <div className="mt-8 rounded-2xl bg-white/10 p-5 text-center backdrop-blur-sm">
            <p className="text-sm text-white/75">Current score</p>
            <h2 className="mt-2 text-5xl font-light">{score}</h2>
            <p className="mt-2 text-sm font-medium text-green-200">
              Excellent range
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-5">
        <div className="grid gap-3">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="text-green-600" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Score trend
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your score is estimated between 750 and 800 based on payment
                  history, utilization, account age, and recent activity.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-[#15589b]" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Report summary
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Payment history: Strong
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Credit utilization: Low
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Account standing: Current
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-500" size={20} />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Monitoring notice
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  This score is displayed for account insight purposes inside
                  the banking portal and it is your real credit bureau
                  report.
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