"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import CalendarView from "../components/CalendarView";

export default function SchedulePage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [duration, setDuration] = useState("60");
    const [students, setStudents] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const events = classes.map((c) => ({
        title: c.students?.name || "Class",
        start: c.date,
        end: new Date(new Date(c.date).getTime() + c.duration * 60000),

        extendedProps: {
            studentId: c.student_id,
        },
    }));

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
        fetchStudents();
    }, []);

    const now = new Date();

    const upcoming = classes.filter(
        (c) => new Date(c.date) >= now
    );

    const past = classes.filter(
        (c) => new Date(c.date) < now
    );
    async function fetchStudents() {
        const { data, error } = await supabase
            .from("students")
            .select("*");
        if (error) {
            console.error(error);
            return;
        }
        setStudents(data || []);
    }
    async function handleCreateClass() {
        if (!selectedStudent || !selectedDate) return;
        await supabase.from("classes").insert([
            {
            student_id: selectedStudent,
            teacher_id: user.id,
            date: selectedDate,
            duration: Number(duration),
            },
        ]);
        setShowModal(false);
        setSelectedStudent("");
        setDuration("60");
        fetchClasses();
    }

    return (
        <main className="p-4 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-4">Schedule</h1>
        <CalendarView
            events={events}
            onDateClick={(date) => {
                setSelectedDate(date);
                setShowModal(true);
            }}
        />
        {/*Modal Add Class*/}
        {showModal && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center pointer-events-auto" onClick={() => setShowModal(false)}>
                <div className="bg-white p-6 rounded-2xl w-[90%] max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>

                <h2 className="text-lg font-semibold">Add Class</h2>

                {/* DATE */}
                <p className="text-sm text-gray-500">
                    {selectedDate && new Date(selectedDate).toLocaleString()}
                </p>

                {/* STUDENT */}
                <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full border p-2 rounded"
                >
                    <option value="">Select student</option>
                    {students.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name}
                    </option>
                    ))}
                </select>

                {/* DURATION */}
                <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="Duration (minutes)"
                />

                {/* ACTIONS */}
                <div className="flex gap-2">
                    <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border rounded-xl py-2"
                    >
                    Cancel
                    </button>

                    <button
                    onClick={handleCreateClass}
                    className="flex-1 bg-blue-500 text-white rounded-xl py-2"
                    >
                    Save
                    </button>
                </div>
                </div>
            </div>
        )}

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
                {selectedDate && new Date(selectedDate).toLocaleString()}
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
                {selectedDate && new Date(selectedDate).toLocaleString()}
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