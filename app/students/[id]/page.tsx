"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function StudentPage() {
    const { id } = useParams();
    const [student, setStudent] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [duration, setDuration] = useState("60");
    const [date, setDate] = useState("");
    const [user, setUser] = useState<any>(null);

    // Get user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        });
    }, []);

    // Fetch student
    async function fetchStudent() {
        const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", id)
        .single();

        setStudent(data);
    }

    // Fetch classes
    async function fetchClasses() {
        const { data } = await supabase
        .from("classes")
        .select("*")
        .eq("student_id", id)
        .order("date", { ascending: true });

        setClasses(data || []);
    }

    useEffect(() => {
        if (id) {
        fetchStudent();
        fetchClasses();
        }
    }, [id]);

    // Add class
    async function handleAddClass() {
        if (!date || !user) return;
        const { error } = await supabase.from("classes").insert([
        {
            student_id: id,
            teacher_id: user.id,
            date,
            duration: Number(duration),
        },
        ]);
        if (error) return console.error(error);
        setDate("")
        setDuration("60");
        fetchClasses();
    }

    // Mark a class as done
    async function handleMarkDone(classId: string) {
        const now = new Date().toISOString();
        const { error } = await supabase
            .from("classes")
            .update({ date: now })
            .eq("id", classId);
        if (error) return console.error(error);
        fetchClasses();
    }

    if (!student) {
        return <p className="p-4">Loading...</p>;
    }
    return (
        <main className="p-4 max-w-md mx-auto">
        {/* STUDENT INFO */}
        <h1 className="text-2xl font-bold">{student.name}</h1>
        <p className="text-gray-500">{student.hourly_rate}฿ / hour</p>

        {/* Get invoice */}
        <Link
        href={`/students/${id}/invoice`}
        className="block mt-4 text-blue-500 underline"
        >
        Generate Invoice
        </Link>

        {/* ADD CLASS */}
        <div className="mt-6 p-4 border rounded-xl">
            <h2 className="font-semibold mb-2">Add Class</h2>
            <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full mb-2 p-2 border rounded"
            />
            <input
                type="number"
                placeholder="Duration (minutes)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full mb-2 p-2 border rounded"
            />
            <button
            onClick={handleAddClass}
            className="bg-green-500 text-white px-4 py-2 rounded-xl w-full"
            >
            Add Class
            </button>
        </div>

        {/* CLASSES LIST */}
        <div className="mt-6 space-y-2">
            {classes.map((c) => {
                const isPast = new Date(c.date) < new Date();
                const price =
                    ((c.duration || 0) / 60) * (student.hourly_rate || 0);
                return (
                    <div key={c.id} className="p-3 border rounded-xl">
                    <p>{new Date(c.date).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                        {c.duration} min • {price}฿
                    </p>
                    <p className="text-sm text-gray-400">
                        {isPast ? "Done" : "Planned"}
                    </p>
                    </div>
                );
            })}
        </div>
        {classes.length === 0 && (
            <p className="text-gray-500 mt-4">No classes yet</p>
        )}
        </main>
    );
}