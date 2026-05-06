import Link from "next/link";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

const locations = [
  {
    name: "BluePeak Financial Center",
    address: "1248 Madison Avenue, New York, NY 10029",
    hours: "Open today: 9:00 AM - 5:00 PM",
    phone: "(212) 555-0148",
  },
  {
    name: "BluePeak Austin Branch",
    address: "7306 Congress Avenue, Austin, TX 78745",
    hours: "Open today: 9:00 AM - 4:30 PM",
    phone: "(512) 555-0194",
  },
  {
    name: "BluePeak Miami Service Center",
    address: "410 Biscayne Boulevard, Miami, FL 33132",
    hours: "Open today: 10:00 AM - 5:00 PM",
    phone: "(305) 555-0171",
  },
  {
    name: "BluePeak Denver ATM",
    address: "901 Market Street, Denver, CO 80202",
    hours: "ATM available 24/7",
    phone: "(720) 555-0116",
  },
  {
    name: "BluePeak Seattle Branch",
    address: "218 Pine Street, Seattle, WA 98101",
    hours: "Open today: 9:00 AM - 5:00 PM",
    phone: "(206) 555-0188",
  },
];

export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-24">
      <section className="bg-[#15589b] px-5 pb-6 pt-6 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="text-sm text-white/90">
            ‹ Back
          </Link>

          <div className="mt-6">
            <p className="text-sm text-white/75">ATM and branch locator</p>
            <h1 className="mt-1 text-2xl font-semibold">Find ATMs</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-5">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-900">
            Nearby service locations
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Search results are shown for demo purposes. Visit any listed
            BluePeak Trust service point for deposits, withdrawals, card support,
            cashier assistance, and ATM access.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {locations.map((location) => (
            <div
              key={location.address}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef4fb]">
                  <MapPin size={19} className="text-[#15589b]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {location.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {location.address}
                  </p>

                  <div className="mt-3 space-y-2">
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={14} /> {location.hours}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone size={14} /> {location.phone}
                    </p>
                  </div>

                  <button className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#15589b]">
                    <Navigation size={14} />
                    Get directions
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}