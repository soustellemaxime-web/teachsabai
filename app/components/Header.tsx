"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="border-b">
      {/* TOP BAR */}
      <div className="p-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-lg">
          TeachSabai
        </Link>
        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link href="/students">Students</Link>
              <Link href="/schedule">Schedule</Link>
              <Link href="/invoices">Invoices</Link>
              <span className="text-sm text-gray-500">
                {user.email}
              </span>
              <button onClick={handleLogout} className="text-red-500">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </nav>
        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-xl"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden flex flex-col px-4 pb-4 gap-3 bg-white shadow-sm">
          {user ? (
            <>
              <Link href="/students" onClick={() => setOpen(false)}>
                Students
              </Link>
              <Link href="/schedule" onClick={() => setOpen(false)}>
                Schedule
              </Link>
              <Link href="/invoices" onClick={() => setOpen(false)}>
                Invoices
              </Link>
              <span className="text-sm text-gray-500">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-500 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}