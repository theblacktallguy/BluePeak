"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const registered = searchParams.get("registered") === "1";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setMessage("Invalid email or password.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    if (session?.user?.role === "ADMIN") {
    router.push("/admin");
    } else {
    router.push("/dashboard");
    }

    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb]">
      {/* Top Header */}
      <section className="bg-[#15589b] px-5 pb-16 pt-6 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide">
                BluePeak
              </p>

              <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                Private Bank
              </p>
            </div>

            <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
              Secure Banking
            </div>
          </div>

          <div className="mt-10 flex justify-center">
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
              Welcome back
            </h1>

            <p className="mt-3 text-sm text-white/75">
              Access your secure BluePeak Private Banking dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Login Card */}
      <section className="relative mx-auto -mt-10 w-full max-w-md px-4">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200"
        >
          {registered && (
            <div className="mb-5 rounded-xl bg-green-50 px-4 py-3">
              <p className="text-sm font-medium text-green-700">
                Account created successfully. Please sign in.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email address
              </label>

              <input
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#15589b] focus:ring-4 focus:ring-[#15589b]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>

              <input
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#15589b] focus:ring-4 focus:ring-[#15589b]/10"
              />
            </div>
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
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-[#15589b]" />
            Secure encrypted banking session
          </div>
        </form>
      </section>
    </main>
  );
}