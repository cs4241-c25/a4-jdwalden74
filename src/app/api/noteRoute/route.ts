import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const mongo_uri = process.env.MONGO_URI;
if (!mongo_uri) {
    throw new Error("Missing MONGODB_URI environment variable");
}
export const client = new MongoClient(mongo_uri || "");

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await client.connect();
        const db = client.db();
        const notes = await db.collection("notes").find({ userId: session.user?.name }).toArray();
        return NextResponse.json({ success: true, data: notes }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await client.connect();
        const db = client.db();
        const body = await request.json();

        if (!body) {
            return NextResponse.json({ error: "Note data missing" }, { status: 400 });
        }

        const newNote = {
            title: body.title,
            content: body.content,
            color: body.color,
            date: body.date,
            userId: session.user?.name,
        };

        const notesCollection = db.collection("notes");
        await notesCollection.insertOne(newNote);

        const notes = await notesCollection.find({ userId: session.user?.name }).toArray();
        return NextResponse.json({ message: "Note saved successfully!", notes }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await client.connect();
        const db = client.db();
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Missing note ID" }, { status: 400 });
        }

        const notesCollection = db.collection("notes");
        const result = await notesCollection.deleteOne({ _id: new ObjectId(id), userId: session.user?.name });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        const notes = await notesCollection.find({ userId: session.user?.name }).toArray();
        return NextResponse.json({ message: "Note deleted successfully", notes }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await client.connect();
        const db = client.db();
        const body = await request.json();
        const noteId = body.id;

        if (!noteId) {
            return NextResponse.json({ error: "Missing note ID" }, { status: 400 });
        }

        const notesCollection = db.collection("notes");
        const result = await notesCollection.updateOne(
            { _id: new ObjectId(noteId), userId: session.user?.name },
            {
                $set: {
                    title: body.title,
                    content: body.content,
                    date: body.date,
                    color: body.color,
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        const notes = await notesCollection.find({ userId: session.user?.name }).toArray();
        return NextResponse.json({ message: "Note updated successfully", notes }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
    }
}