"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import Card from "../../../components/Card";
import Button from "../../../components/Button";

export default function InvoicePage() {
    const { id } = useParams();
    const [student, setStudent] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [startDate, setStartDate] = useState("");
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const invoiceUrl = `${baseUrl}/invoice/${id}?from=${startDate}`;
    // fetch student
    async function fetchStudent() {
        const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();
        setStudent(data);
    }
    // fetch classes after date
    async function fetchClasses() {
        if (!startDate) return;
        const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("student_id", id)
        .eq("is_paid", false)
        .gte("date", startDate)
        .order("date", { ascending: true });
        if (error) return console.error(error);
        setClasses(data || []);
    }
    // Save invoice to db
    async function saveInvoice() {
        const { data: { user }, } = await supabase.auth.getUser();
        if (!student || classes.length === 0 || !user) return;
        const { data: invoice, error } = await supabase
            .from("invoices")
            .insert([
            {
                student_id: id,
                teacher_id: user.id,
                from_date: startDate,
                to_date: new Date().toISOString(),
                total_amount: totalAmount,
            },
            ])
            .select()
            .single();
        if (error) return console.error(error);
        await supabase
            .from("classes")
            .update({ invoice_id: invoice.id })
            .in(
            "id",
            classes.map((c) => c.id)
            );

        alert("Invoice saved!");
    }
    // Invoice paid
    async function markAsPaid() {
        const { error } = await supabase
            .from("classes")
            .update({ is_paid: true })
            .in(
            "id",
            classes.map((c) => c.id)
            );
        if (error) return console.error(error);
        alert("Marked as paid");
    }
    useEffect(() => {
        fetchStudent();
    }, [id]);
    // calculations
    const totalMinutes = classes.reduce(
        (sum, c) => sum + (c.duration || 0),
        0
    );
    const totalHours = totalMinutes / 60;
    const totalAmount =
        totalHours * (student?.hourly_rate || 0);
    return (
        <main className="p-4 max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-4">
            Invoice
        </h1>
        {/* STUDENT */}
        {student && (
            <div className="mb-4">
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-gray-500">
                {student.hourly_rate}฿ / hour
            </p>
            </div>
        )}
        {/* DATE PICKER */}
        <div className="mb-4">
            <label className="text-sm text-gray-500">
            From date
            </label>
            <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded"
            />
        </div>
        <Button
            onClick={fetchClasses}
            >
            Generate Invoice
        </Button>
        {/* SUMMARY */}
        {classes.length > 0 && (
            <Card>
                <p className="text-sm text-gray-500">
                    {classes.length} classes • {totalHours.toFixed(2)}h
                </p>
                <p className="text-2xl font-bold mt-1">
                    {totalAmount.toFixed(0)}฿
                </p>
            </Card>
        )}
        {/* QR */}
        {startDate && classes.length > 0 && (
            <Card>
                <p className="mb-2 font-medium text-center">Scan to view invoice</p>
                <div className="flex justify-center">
                    <QRCodeCanvas value={invoiceUrl} size={180} />
                </div>
                <p className="text-xs text-gray-400 mt-2 break-all text-center">
                    {invoiceUrl}
                </p>
            </Card>
        )}
        {classes.length > 0 && (
            <Button
                onClick={() => navigator.clipboard.writeText(invoiceUrl)}
                >
                Copy link
            </Button>
        )}
        {/* CLASS LIST */}
        <div className="mt-4 space-y-2">
            {classes.map((c) => {
            const price =
                (c.duration / 60) * student.hourly_rate;
            return (
                <Card
                key={c.id}
                >
                <p>
                    {new Date(c.date).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                    {c.duration} min • {price}฿
                </p>
                </Card>
            );
            })}
        </div>
        {classes.length > 0 && (
            <Button onClick={saveInvoice}>
                Save Invoice
            </Button>
        )}
        {startDate && classes.length > 0 && (
            <Button onClick={markAsPaid}>
                Mark as Paid
            </Button>
        )}
        {startDate && classes.length === 0 && (
            <p className="text-gray-400 mt-4">
                No classes found
            </p>
        )}
        </main>
    );
}