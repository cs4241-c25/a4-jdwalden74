'use client';
import {signIn, useSession} from "next-auth/react"
import "@/app/login.css";
import {useEffect} from "react";
import { useRouter } from "next/navigation";

export function Login() {


    const {data: session, status} = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;
        if (status === "authenticated"){
            router.push("/clipboard");
        }
    }, [status, router]);

    return (
        <div className="wrapper-login">
            <h1 className="font-bold text-4xl py-5">Login</h1>
            {session ? null : (
                <button
                    onClick={() => signIn("github")}
                    className="github-login text-black"
                >
                    Sign in with GitHub
                </button>
            )}
        </div>
    );
}
