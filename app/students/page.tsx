"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Student } from "../lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../components/Card";
import Button from "../components/Button";
import { User, Pencil, Trash2, Plus } from "lucide-react";

export default function StudentsPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");
    const [hourly_rate, setHourly_rate] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) {
                router.push("/login");
            } else {
                setUser(data.user);
            }
        });
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session?.user) {
                router.push("/login");
            } else {
                setUser(session.user);
            }
        });
        return () => subscription.unsubscribe();
    }, []);
    // FETCH
    async function fetchStudents() {
        const { data, error } = await supabase.from("students").select("*");
        if (error) {
        console.error(error);
        return;
        }
        setStudents(data);
    }

    useEffect(() => {
        fetchStudents();
    }, []);

    // ADD or UPDATE
    async function handleSaveStudent() {
        if (!name || !hourly_rate) return;
        if (editingId) {
        // UPDATE
        const { error } = await supabase
            .from("students")
            .update({
            name,
            hourly_rate: Number(hourly_rate),
            })
            .eq("id", editingId);
        if (error) return console.error(error);
        } else {
        // INSERT
            console.log(user);
            if (!user) {
                alert("You must be logged in");
                return;
            }
            const { error } = await supabase.from("students").insert([
                {
                name,
                    hourly_rate: Number(hourly_rate),
                    teacher_id: user?.id,
                },
            ]);
        if (error) return console.error(error);
        }

        // reset
        setName("");
        setHourly_rate("");
        setEditingId(null);
        setShowForm(false);

        fetchStudents();
    }

    // DELETE
    async function handleDelete(id: string) {
        const { error } = await supabase.from("students").delete().eq("id", id);
        if (error) return console.error(error);
        fetchStudents();
    }

    // START EDIT
    function handleEdit(student: Student) {
        setName(student.name);
        setHourly_rate(student.hourly_rate.toString());
        setEditingId(student.id);
        setShowForm(true);
    }

    return (
        <main className="p-6 max-w-md mx-auto space-y-6">
            {/* HEADER */}
            <div className="flex flex-col items-center gap-3">
                <h1 className="text-2xl font-bold">Students</h1>
                <button
                    onClick={() => {
                    setShowForm(true);
                    setEditingId(null);
                    setName("");
                    setHourly_rate("");
                    }}
                    className="flex items-center gap-2 border px-4 py-2 rounded-xl hover:bg-gray-100"
                >
                        <Plus size={18} className="text-green-600" />
                        Add student
                </button>
            </div>
            {/* FORM */}
            {showForm && (
            <Card>
                <div className="space-y-2">
                <input
                    type="text"
                    placeholder="Student name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                />

                <input
                    type="number"
                    placeholder="Price per hour"
                    value={hourly_rate}
                    onChange={(e) => setHourly_rate(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                />

                <Button onClick={handleSaveStudent}>
                    {editingId ? "Update" : "Save"}
                </Button>
                </div>
            </Card>
            )}

            {/* LIST */}
            <div className="grid grid-cols-2 gap-4">
            {students.map((student) => (
                <Link key={student.id} href={`/students/${student.id}`}>
                    <Card>
                        <div className="flex flex-col gap-2">
                            {/* TOP ROW */}
                            <div className="flex justify-between items-start">
                            <User size={28} className="text-gray-600" />
                            <div className="flex gap-2 text-xs">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleEdit(student);
                                    }}
                                    className="text-blue-500"
                                    >
                                    <Pencil size={18} className="text-blue-500" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDelete(student.id);
                                    }}
                                    className="text-red-500"
                                    >
                                    <Trash2 size={18} className="text-red-500" />
                                </button>
                            </div>
                            </div>
                            {/* INFO */}
                            <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-gray-500">
                                {student.hourly_rate}฿ / hour
                            </p>
                            </div>

                        </div>
                    </Card>
                </Link>
            ))}
            </div>

            {students.length === 0 && (
            <p className="text-gray-400 text-center mt-4">
                No students yet
            </p>
            )}
        </main>
        );
}