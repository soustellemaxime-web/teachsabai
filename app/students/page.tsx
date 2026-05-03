"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Student } from "../lib/types";

export default function StudentsPage() {
    const [user, setUser] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            console.log("INITIAL USER:", data.user);
            setUser(data.user);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("AUTH CHANGE:", session?.user);
            setUser(session?.user ?? null);
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
        if (!name || !price) return;

        if (editingId) {
        // UPDATE
        const { error } = await supabase
            .from("students")
            .update({
            name,
            price: Number(price),
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
                    price: Number(price),
                    teacher_id: user?.id,
                },
            ]);
        if (error) return console.error(error);
        }

        // reset
        setName("");
        setPrice("");
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
        setPrice(student.price.toString());
        setEditingId(student.id);
        setShowForm(true);
    }

    return (
        <main className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Students</h1>

        <button
            onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setName("");
            setPrice("");
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl"
        >
            Add Student
        </button>

        {/* FORM */}
        {showForm && (
            <div className="mt-4 p-4 border rounded-xl">
            <input
                type="text"
                placeholder="Student name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mb-2 p-2 border rounded"
            />

            <input
                type="number"
                placeholder="Price per class"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full mb-2 p-2 border rounded"
            />

            <button
                onClick={handleSaveStudent}
                className="bg-green-500 text-white px-4 py-2 rounded-xl w-full"
            >
                {editingId ? "Update" : "Save"}
            </button>
            </div>
        )}

        {/* LIST */}
        <div className="mt-6 space-y-2">
            {students.map((student) => (
            <div
                key={student.id}
                className="p-3 border rounded-xl flex justify-between items-center"
            >
                <div>
                <p>{student.name}</p>
                <p className="text-sm text-gray-500">{student.price}฿</p>
                </div>

                <div className="flex gap-2">
                <button
                    onClick={() => handleEdit(student)}
                    className="text-blue-500"
                >
                    Edit
                </button>

                <button
                    onClick={() => handleDelete(student.id)}
                    className="text-red-500"
                >
                    Delete
                </button>
                </div>
            </div>
            ))}
        </div>

        {students.length === 0 && (
            <p className="text-gray-500 mt-4">No students yet</p>
        )}
        </main>
    );
}