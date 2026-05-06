"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ArrowLeftRight,
  History,
  TrendingUp,
  User,
} from "lucide-react";

const nav = [
  { name: "Accounts", href: "/dashboard", icon: Home },
  { name: "Transfer", href: "/transfers", icon: ArrowLeftRight },
  { name: "Activity", href: "/transactions", icon: History },
  { name: "Investment", href: "/investments", icon: TrendingUp },
  { name: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white">
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center text-[11px]"
            >
              <Icon
                size={22}
                className={
                  active ? "text-blue-600" : "text-gray-400"
                }
              />
              <span
                className={
                  active
                    ? "mt-1 text-blue-600 font-medium"
                    : "mt-1 text-gray-400"
                }
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}