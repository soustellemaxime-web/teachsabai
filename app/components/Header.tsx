"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function Header() {
  const [user, setUser] = useState<any>(null);

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
    <header className="p-4 border-b flex justify-between items-center">
      <Link href="/" className="font-bold text-lg">
        TeachSabai
      </Link>

      <nav className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/students">Students</Link>

            <span className="text-sm text-gray-500">
              {user.email}
            </span>

            <button
              onClick={handleLogout}
              className="text-red-500"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}