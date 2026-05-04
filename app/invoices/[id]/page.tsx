"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams } from "next/navigation";

export default function InvoiceDetailPage() {
  const { id } = useParams();

  const [invoice, setInvoice] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  // fetch invoice
  async function fetchInvoice() {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        students ( name, hourly_rate )
      `)
      .eq("id", id)
      .single();

    if (error) return console.error(error);

    setInvoice(data);
  }

  // fetch classes linked to invoice
  async function fetchClasses() {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("invoice_id", id)
      .order("date", { ascending: true });

    if (error) return console.error(error);

    setClasses(data || []);
  }

  useEffect(() => {
    if (id) {
      fetchInvoice();
      fetchClasses();
    }
  }, [id]);

  // mark invoice paid
  async function markInvoicePaid() {
    // 1. update invoice
    await supabase
      .from("invoices")
      .update({ is_paid: true })
      .eq("id", id);

    // 2. update classes
    await supabase
      .from("classes")
      .update({ is_paid: true })
      .eq("invoice_id", id);

    alert("Invoice marked as paid");

    fetchInvoice();
    fetchClasses();
  }

  if (!invoice) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Invoice</h1>

      {/* STUDENT */}
      <div>
        <p className="font-medium">
          {invoice.students?.name}
        </p>
        <p className="text-sm text-gray-500">
          {invoice.students?.hourly_rate}฿ / hour
        </p>
      </div>

      {/* DATES */}
      <div className="text-sm text-gray-500">
        <p>From: {invoice.from_date}</p>
        <p>To: {invoice.to_date}</p>
      </div>

      {/* SUMMARY */}
      <div className="p-4 border rounded-xl">
        <p>Total: {invoice.total_amount}฿</p>
        <p
          className={`mt-1 ${
            invoice.is_paid
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          {invoice.is_paid ? "Paid" : "Unpaid"}
        </p>
      </div>

      {/* CLASSES */}
      <div className="space-y-2">
        {classes.map((c) => {
          const price =
            (c.duration / 60) *
            invoice.students.hourly_rate;

          return (
            <div
              key={c.id}
              className="p-3 border rounded-xl"
            >
              <p>
                {new Date(c.date).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                {c.duration} min • {price}฿
              </p>
            </div>
          );
        })}
      </div>

      {/* ACTION */}
      {!invoice.is_paid && (
        <button
          onClick={markInvoicePaid}
          className="w-full bg-green-500 text-white py-2 rounded-xl"
        >
          Mark as Paid
        </button>
      )}
    </main>
  );
}