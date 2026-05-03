"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function SchedulePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  async function fetchClasses() {
    const { data, error } = await supabase
      .from("classes")
      .select(`
        *,
        students ( name )
      `)
      .order("date", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setClasses(data || []);
  }

  useEffect(() => {
    fetchClasses();
  }, []);

  const now = new Date();

  const upcoming = classes.filter(
    (c) => new Date(c.date) >= now
  );

  const past = classes.filter(
    (c) => new Date(c.date) < now
  );

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Schedule</h1>

      {/* UPCOMING */}
      <div>
        <h2 className="font-semibold mb-2">Upcoming</h2>

        {upcoming.map((c) => (
          <div
            key={c.id}
            className="p-3 border rounded-xl mb-2"
          >
            <p className="font-medium">
              {c.students?.name}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(c.date).toLocaleString()}
            </p>
          </div>
        ))}

        {upcoming.length === 0 && (
          <p className="text-gray-400">No upcoming classes</p>
        )}
      </div>

      {/* PAST */}
      <div className="mt-6">
        <h2 className="font-semibold mb-2">Past</h2>

        {past.map((c) => (
          <div
            key={c.id}
            className="p-3 border rounded-xl mb-2 opacity-60"
          >
            <p className="font-medium">
              {c.students?.name}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(c.date).toLocaleString()}
            </p>
          </div>
        ))}

        {past.length === 0 && (
          <p className="text-gray-400">No past classes</p>
        )}
      </div>
    </main>
  );
}