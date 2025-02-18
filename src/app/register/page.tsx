'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            router.push("/");
        } else {
            const data = await response.json();
            setError(data.error || "Something went wrong");
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center text-gray-800 py-4">Create an Account</h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-lg font-medium text-gray-700">Username:</label>
                    <input
                        type="text"
                        id="username"
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                        required
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-lg font-medium text-gray-700">Password:</label>
                    <input
                        type="password"
                        id="password"
                        className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                        required
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        Create Account
                    </button>
                </div>
            </form>
        </div>
    );
}
