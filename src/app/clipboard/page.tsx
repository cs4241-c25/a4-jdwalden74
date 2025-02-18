'use client'

import "@/app/main.css"
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";  // Import signOut here
import { useRouter } from "next/navigation";

export type Note = {
    _id: string,
    title: string,
    content: string,
    date: string,
    color: string
}

export default function Clipboard() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [formOpen, setFormOpen] = useState(false);
    const [editNote, setEditNote] = useState<Note | null>(null); // Track note being edited
    const [newNote, setNewNote] = useState({
        title: "",
        content: "",
        date: "",
        color: "light-grey"
    });

    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    useEffect(() => {
        const getNotes = async () => {
            try {
                const response = await fetch("/api/noteRoute", {
                    method: "GET", credentials: "include",
                });
                const data = await response.json();
                setNotes(data.data || []);
            } catch (error) {
                console.error("Error fetching notes:", error);
            }
        };
        getNotes();
    }, []);

    const handleNoteSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (editNote) {
            const response = await fetch("/api/noteRoute", {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id: editNote._id,
                    title: editNote.title,
                    content: editNote.content,
                    color: editNote.color,
                    date: new Date().toISOString().split('T')[0]
                })
            });

            const data = await response.json();
            setNotes(data.notes);
            setEditNote(null);
        } else {
            // POST request for adding a new note
            const newNoteData = {
                title: newNote.title,
                content: newNote.content,
                color: newNote.color,
                date: new Date().toISOString().split('T')[0]
            };

            const response = await fetch("/api/noteRoute", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(newNoteData)
            });

            const data = await response.json();
            setNotes(data.notes);
        }

        resetForm();
    };

    const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        if (editNote) {
            setEditNote(prevState => prevState ? { ...prevState, [name]: value } : null);
        } else {
            setNewNote(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleColorChange = (color: string) => {
        if (editNote) {
            setEditNote(prevState => prevState ? { ...prevState, color: color } : null);
        } else {
            setNewNote(prevState => ({ ...prevState, color: color }));
        }
    };

    const removeNote = async (id: string) => {
        const response = await fetch(`/api/noteRoute`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            const data = await response.json();
            setNotes(data.notes);
        } else {
            console.error(`Failed to delete note with ID ${id}`);
        }
    };

    const editNoteHandler = (note: Note) => {
        setEditNote(note);
        setFormOpen(false); // Ensure new note form is closed
    };

    const resetForm = () => {
        setFormOpen(false);
        setEditNote(null);
        setNewNote({
            title: "",
            content: "",
            date: "",
            color: "light-grey"
        });
    };

    return (
        <>
            <div className="wrapper">
                <header>
                    <h3 id="sidebar">Users Notes</h3>
                    <p className="note-count">{"Count: " + notes.length}</p>
                    {/* Sign Out Button */}
                    <button onClick={() => signOut()} className="sign-out-btn">Sign Out</button>
                </header>
                <section id="note-display">
                    <div id="note-display-header">
                        <h2>Note Clipboard</h2>
                        <button
                            className="add-note-button"
                            onClick={() => {
                                setFormOpen(!formOpen);
                                setEditNote(null);
                            }}
                        >
                            Add Note
                        </button>
                    </div>
                    <div id="clipboard">
                        {notes.map((note) => (
                            <div
                                key={note._id}
                                className={`clipboard-item ${note.color}`}
                                onClick={() => editNoteHandler(note)}
                            >
                                <div className="note-header">
                                    <h1>{note.title}</h1>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        removeNote(note._id);
                                    }} className="delete-btn">X
                                    </button>
                                </div>
                                <p>{note.content}</p>
                                <p className="note-date">{note.date}</p>
                            </div>
                        ))}

                        {/* Form for Adding / Editing Notes */}
                        {(formOpen || editNote) && (
                            <form
                                className={`note-form ${editNote ? editNote.color : newNote.color}`}
                                onSubmit={handleNoteSubmit}
                                style={{backgroundColor: editNote ? editNote.color : newNote.color}}
                            >
                                <label>Title:</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editNote ? editNote.title : newNote.title}
                                    placeholder="Enter Title"
                                    onChange={handleNoteChange}
                                    className="newNoteTitle"
                                />
                                <label>Content:</label>
                                <textarea
                                    name="content"
                                    value={editNote ? editNote.content : newNote.content}
                                    placeholder="Enter Content"
                                    className="newNoteContent"
                                    onChange={handleNoteChange}
                                />
                                <label>Choose a color:</label>
                                <div className="color-options">
                                    {["light-blue", "light-green", "light-red", "light-yellow", "light-purple"].map(color => (
                                        <div key={color} className="color-option">
                                            <input
                                                type="radio"
                                                name="noteColor"
                                                value={color}
                                                checked={editNote ? editNote.color === color : newNote.color === color}
                                                onChange={() => handleColorChange(color)}
                                                id={color}
                                            />
                                            <label htmlFor={color} className={color}>
                                                {color.replace("light-", "").toUpperCase()}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <button type="submit">{editNote ? "Update Note" : "Add Note"}</button>
                                <button type="button" onClick={resetForm}>Cancel</button>
                            </form>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
