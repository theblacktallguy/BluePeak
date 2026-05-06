import Link from "next/link";

export default function SecurityNotice() {
  return (
    <section className="mt-6">
      <div className="rounded-xl bg-[#eaf3ff] px-4 py-4 ring-1 ring-blue-100">
        <p className="text-sm font-semibold text-slate-800">
          Protect your account
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          Never share your access code or password. BluePeak Trust will never ask
          for your login details by phone, email, or text.
        </p>

        <Link
          href="/security"
          className="mt-3 inline-block text-xs font-semibold text-[#15589b]"
        >
          Review security settings
        </Link>
      </div>
    </section>
  );
}