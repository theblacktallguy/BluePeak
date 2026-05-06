import Image from "next/image";
import { signOut } from "@/auth";

type Props = {
  bankName: string;
  fullName: string;
  totalBalance: number;
};

export default function DashboardHeader({
  fullName,
  totalBalance,
}: Props) {
  const firstName = fullName.split(" ")[0];

  return (
    <section className="bg-[#15589b] px-5 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="relative flex items-center justify-between">
          {/* Left Brand */}
          <div>
            <p className="text-sm font-semibold tracking-wide">
              BluePeak
            </p>

            <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">
              Private Bank
            </p>
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <div className="flex h-14 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white p-2 shadow-lg">
              <Image
                src="/bplogo.png"
                alt="BluePeak"
                width={120}
                height={60}
                className="h-full w-full rounded-xl object-contain"
                priority
              />
            </div>
          </div>

          {/* Right */}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10">
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-white/75">
            Total Deposit Balance
          </p>

          <h1 className="mt-2 text-4xl font-light tracking-tight">
            ${totalBalance.toLocaleString()}
          </h1>

          <p className="mt-3 text-sm text-white/90">
            Welcome back, {firstName}
          </p>
        </div>
      </div>
    </section>
  );
}