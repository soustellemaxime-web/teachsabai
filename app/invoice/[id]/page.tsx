"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams, useSearchParams } from "next/navigation";

export default function PublicInvoicePage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const from = searchParams.get("from");
    const [student, setStudent] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);

    // fetch student
    async function fetchStudent() {
        const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();

        setStudent(data);
    }

    // fetch classes
    async function fetchClasses() {
        if (!from) return;

        const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("student_id", id)
        .gte("date", from)
        .lt("date", new Date().toISOString()); // only past classes
        if (error) return console.error(error);
        setClasses(data || []);
    }
    useEffect(() => {
        fetchStudent();
    }, [id]);
    useEffect(() => {
        fetchClasses();
    }, [from]);
    // calculations
    const totalMinutes = classes.reduce(
        (sum, c) => sum + (c.duration || 0),
        0
    );
    const totalHours = totalMinutes / 60;
    const totalAmount =
        totalHours * (student?.hourly_rate || 0);
    return (
        <main className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">
            Invoice
        </h1>
        {student && (
            <div className="mb-4">
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-gray-500">
                {student.hourly_rate}฿ / hour
            </p>
            </div>
        )}
        <div className="p-4 border rounded-xl">
            <p>Total classes: {classes.length}</p>
            <p>Total hours: {totalHours.toFixed(2)}</p>
            <p className="font-bold mt-2">
            Total: {totalAmount.toFixed(0)}฿
            </p>
        </div>
        <div className="mt-4 space-y-2">
            {classes.map((c) => {
            const price =
                (c.duration / 60) * student.hourly_rate;
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
        {classes.length === 0 && (
            <p className="text-gray-400 mt-4">
            No classes found
            </p>
        )}
        </main>
    );
}