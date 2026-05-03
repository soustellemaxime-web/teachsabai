"use client";

import { useState } from "react";
import { signIn, signUp } from "../lib/auth";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin() {
        const { data, error } = await signIn(email, password);
        console.log("LOGIN DATA:", data);
        console.log("LOGIN ERROR:", error);
        if (error) {
            alert(error.message);
            return;
        }
        // wait a tiny bit for session to be stored
        setTimeout(() => {
            window.location.href = "/students";
        }, 500);
    }

    async function handleSignup() {
        const { data, error } = await signUp(email, password);
        console.log("SIGNUP DATA:", data);
        console.log("SIGNUP ERROR:", error);
        alert("Account created, you can now log in");
    }

    return (
        <main className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
        />

        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
        />

        <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-2"
        >
            Login
        </button>

        <button
            onClick={handleSignup}
            className="bg-gray-500 text-white px-4 py-2 rounded w-full"
        >
            Sign Up
        </button>
        </main>
    );
}