import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs"

const mongo_uri = process.env.MONGO_URI;

if (!mongo_uri) {
    throw new Error("Missing MONGODB_URI environment variable");
}

const client = new MongoClient(mongo_uri);

export async function POST(request: NextRequest) {
    try {
        await client.connect();
        const db = client.db();
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
        }

        const existingUser = await db.collection("users").findOne({ username });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.collection("users").insertOne({ username, password: hashedPassword });

        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}
