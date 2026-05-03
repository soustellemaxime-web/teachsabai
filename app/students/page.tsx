"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Student } from "../lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  // LOAD students from DB
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

  // ADD student to DB
  async function handleAddStudent() {
    if (!name || !price) return;

    const { error } = await supabase.from("students").insert([
      {
        name,
        price: Number(price),
      },
    ]);

    if (error) {
      console.error(error);
      return;
    }

    setName("");
    setPrice("");
    setShowForm(false);

    fetchStudents(); // reload list
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Students</h1>

      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-xl"
      >
        Add Student
      </button>

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
            onClick={handleAddStudent}
            className="bg-green-500 text-white px-4 py-2 rounded-xl w-full"
          >
            Save
          </button>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {students.map((student) => (
          <div
            key={student.id}
            className="p-3 border rounded-xl flex justify-between"
          >
            <span>{student.name}</span>
            <span>{student.price}฿</span>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <p className="text-gray-500 mt-4">No students yet</p>
      )}
    </main>
  );
}