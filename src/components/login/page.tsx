'use client';

import "@/app/login.css";
import { useState,  } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const result = await signIn("credentials", {
            redirect: false,
            username,
            password,
        });

        if (result?.error) {
            setError("Invalid username or password");
        } else {
            router.push("/clipboard");
        }
    };

    return (
        <div className="wrapper-login">
            <h1 className="font-bold text-4xl py-5">Login</h1>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" className="text-black" required onChange={e => setUsername(e.target.value)} /><br />
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" className="text-black" required onChange={e => setPassword(e.target.value)} /><br />
                <button type="submit" className="login">Login</button>
            </form>

            <div className="mt-3 text-black">
                <p>Dont have an account? <a href="/register" className="text-blue-500">Create an account</a></p>
            </div>

            <button
                onClick={() => signIn("github")}
                className="github-login"
            >
                Sign in with GitHub
            </button>
        </div>
    );
}
