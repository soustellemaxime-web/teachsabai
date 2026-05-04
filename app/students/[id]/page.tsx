"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

export default function StudentPage() {
    const { id } = useParams();
    const [student, setStudent] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [duration, setDuration] = useState("60");
    const [date, setDate] = useState("");
    const [user, setUser] = useState<any>(null);
    const [editingClass, setEditingClass] = useState<any>(null);

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

    // Edit handler
    function handleEditClass(c: any) {
        setEditingClass(c);
        setDate(c.date.slice(0, 16)); // for datetime-local
        setDuration(String(c.duration));
    }

    useEffect(() => {
        if (id) {
        fetchStudent();
        fetchClasses();
        }
    }, [id]);

    if (!student) {
        return <p className="p-4">Loading...</p>;
    }
    const total = student.course_total_classes || 0;
    const used = classes.length;
    const remaining = total - used;
    const progress = total > 0 ? (used / total) * 100 : 0;
    const barColor = progress < 70 ? "bg-blue-500" : progress < 100 ? "bg-orange-400" : "bg-green-500";

    // Add class
    async function handleAddClass() {
        if (!date || !user) return;
        if (editingClass) {
            // UPDATE
            const { error } = await supabase
            .from("classes")
            .update({
                date,
                duration: Number(duration),
            })
            .eq("id", editingClass.id);
            if (error) return console.error(error);
            setEditingClass(null);
        } else {
            // INSERT
            const { error } = await supabase.from("classes").insert([
            {
                student_id: id,
                teacher_id: user.id,
                date,
                duration: Number(duration),
            },
            ]);
            if (error) return console.error(error);
        }
        setDate("");
        setDuration("60");
        fetchClasses();
    }

    // Delete class
    async function handleDeleteClass(classId: string) {
        if (!confirm("Delete this class?")) return;
        const { error } = await supabase
            .from("classes")
            .delete()
            .eq("id", classId);
        if (error) return console.error(error);
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

    // Mark a class as paid
    async function togglePaid(c: any) {
        const { error } = await supabase
            .from("classes")
            .update({ is_paid: !c.is_paid })
            .eq("id", c.id);
        if (error) return console.error(error);
        fetchClasses();
    }
    return (
        <main className="p-4 max-w-md mx-auto">
        {/* STUDENT INFO */}
        <h1 className="text-2xl font-bold">{student.name}</h1>
        {student.pricing_type === "hourly" ? (
            <p className="text-gray-500">
                {student.hourly_rate}฿ / hour
            </p>
            ) : (
            <p className="text-gray-500">
                {student.course_total_classes} classes • {student.course_price}฿
            </p>
        )}
        {student.pricing_type === "course" && (
            <div className="mt-4 space-y-2">
                {/* TEXT */}
                <p className="text-sm text-gray-600">
                {used} / {total} classes used
                </p>
                {/* BAR BACKGROUND */}
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                {/* PROGRESS */}
                <div
                    className={`h-full ${barColor} transition-all`}
                    style={{ width: `${progress}%` }}
                />
                </div>
                {/* REMAINING */}
                <p className="text-sm text-black-500">
                {remaining} classes remaining
                </p>
            </div>
        )}

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
            <button onClick={handleAddClass} className="bg-green-500 text-white px-4 py-2 rounded-xl w-full">
                {editingClass ? "Edit Class" : "Add Class"}
            </button>
        </div>

        {/* CLASSES LIST */}
        <div className="mt-6 space-y-2">
            {classes.map((c) => {
                const isPast = new Date(c.date) < new Date();
                const price = student.pricing_type === "hourly" ? ((c.duration || 0) / 60) * (student.hourly_rate || 0) : 0;
                return (
                    <div key={c.id} className="p-3 border rounded-xl">
                        <div className="flex justify-between items-start">  
                            {/* LEFT */}
                            <div>
                            <p>{new Date(c.date).toLocaleString()}</p>
                            <p className="text-sm text-gray-500">
                                {c.duration} min
                                {student.pricing_type === "hourly" && ` • ${price}฿`}
                            </p>
                            <p className="text-sm text-gray-400">
                                {isPast ? "Done" : "Planned"}
                            </p>
                            </div>
                            {/* RIGHT ACTIONS */}
                            <div className="flex gap-2">
                            <button
                                onClick={() => handleEditClass(c)}
                                className="text-blue-500 hover:scale-110 transition"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => handleDeleteClass(c.id)}
                                className="text-red-500 hover:scale-110 transition"
                            >
                                <Trash2 size={16} />
                            </button>
                            </div>
                        </div>
                        {/* PAID BUTTON */}
                        {student.pricing_type === "hourly" && (
                            <button
                                onClick={() => togglePaid(c)}
                                className={`text-sm mt-2 ${
                                c.is_paid ? "text-green-600" : "text-gray-500"
                                }`}
                            >
                                {c.is_paid ? "Paid" : "Mark paid"}
                            </button>
                        )}
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