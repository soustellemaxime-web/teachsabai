"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  async function fetchInvoices() {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        students ( name )
      `)
      .order("created_at", { ascending: false });

    if (error) return console.error(error);

    setInvoices(data || []);
  }

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Invoices</h1>

        {invoices.map((inv) => (
            <Link key={inv.id} href={`/invoices/${inv.id}`}>
                <div className="p-4 border rounded-xl cursor-pointer">
                <p className="font-medium">
                    {inv.students?.name}
                </p>
                <p className="text-sm text-gray-500">
                    From {inv.from_date}
                </p>
                <p className="text-lg font-bold mt-1">
                    {inv.total_amount}฿
                </p>
                <p
                    className={`text-sm ${
                    inv.is_paid
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                >
                    {inv.is_paid ? "Paid" : "Unpaid"}
                </p>
                </div>
            </Link>
        ))}

      {invoices.length === 0 && (
        <p className="text-gray-400">
          No invoices yet
        </p>
      )}
    </main>
  );
}