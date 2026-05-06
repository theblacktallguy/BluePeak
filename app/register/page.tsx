"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Landmark, LineChart } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      <section className="bg-[#15589b] px-5 pb-14 pt-6 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide">BluePeak</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                Private Bank
              </p>
            </div>

            <Link
              href="/login"
              className="rounded-full border border-white/25 px-4 py-1.5 text-xs font-semibold text-white/90"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-9 flex justify-center">
            <div className="flex h-14 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white p-3 shadow-2xl">
              <Image
                src="/bplogo1.png"
                alt="BluePeak"
                width={180}
                height={80}
                className="h-full w-full object-contain"
                priority
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <h1 className="text-3xl font-light tracking-tight">
              Open your account
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/75">
              Create your secure BluePeak Private Banking profile with deposit,
              card, transfer, and investment access.
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-8 w-full max-w-md px-4 pb-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200"
        >
          <div className="mb-5 grid grid-cols-3 gap-2 text-center">
            <MiniFeature icon={<Landmark size={16} />} label="Accounts" />
            <MiniFeature icon={<LineChart size={16} />} label="Invest" />
            <MiniFeature icon={<ShieldCheck size={16} />} label="Secure" />
          </div>

          <div className="space-y-4">
            <FieldLabel label="Full name" />
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Enter your full name"
              className={inputClass}
            />

            <FieldLabel label="Email address" />
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
              placeholder="Enter your email"
              className={inputClass}
            />

            <FieldLabel label="Password" />
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              type="password"
              placeholder="Create a password"
              className={inputClass}
            />

            <FieldLabel label="Confirm password" />
            <input
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              type="password"
              placeholder="Confirm your password"
              className={inputClass}
            />
          </div>

          {message && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{message}</p>
            </div>
          )}

          <button
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#15589b] py-3.5 text-sm font-semibold text-white transition hover:bg-[#11497f] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            By continuing, you acknowledge BluePeak account verification,
            security review, and digital banking terms.
          </p>
        </form>
      </section>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#15589b] focus:ring-4 focus:ring-[#15589b]/10";

  function FieldLabel({ label }: { label: string }) {
    return (
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
    );
  }

function MiniFeature({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-[#eef4fb] px-2 py-3 text-[#15589b]">
      <div className="flex justify-center">{icon}</div>
      <p className="mt-1 text-[10px] font-semibold text-slate-700">{label}</p>
    </div>
  );
}