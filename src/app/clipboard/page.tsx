'use client'

import "@/app/main.css"
import { useState, useEffect } from "react";

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
    const [newNote, setNewNote] = useState({
        _id: "",
        title: "",
        content: "",
        date: "",
        color: "light-grey"
    });

    useEffect(() => {
        // Get notes on load
        const getNotes = async () => {
            try {
                const response = await fetch("/api/noteRoute");
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
            body: JSON.stringify(newNoteData)
        });

        const data = await response.json();
        setNotes(data.notes);
        setNewNote({
            _id: "",
            title: "",
            content: "",
            date: "",
            color: "light-grey"
        })
        setFormOpen(false);
    };

    const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewNote(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleColorChange = (color: string) => {
        setNewNote(prevState => ({
            ...prevState,
            color: color
        }));
    };

    const removeNote = async (id: string) => {
        const response = await fetch(`/api/noteRoute`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            const data = await response.json();
            setNotes(data.notes);
        } else {
            console.error(`Failed to delete note with ID ${id}`);
        }
    };


    return (
        <div className="wrapper">
            <header>
                <h1 id="sidebar">Sidebar</h1>
                <p className="note-count">{notes.length}</p>
            </header>
            <section id="note-display">
                <div id="note-display-header">
                    <h2>Note Clipboard</h2>
                    <button className="add-note-button" onClick={() => setFormOpen(!formOpen)}>Add Note</button>
                </div>
                <div id="clipboard">
                    {notes.map((note) => (
                        <div key={note._id} className={`clipboard-item ${note.color}`}>
                            <div className="note-header">
                                <h1>{note.title}</h1>
                                <button onClick={() => removeNote(note._id)} className="delete-btn">X</button>
                            </div>
                            <p>{note.content}</p>
                            <p className="note-date">{note.date}</p>
                        </div>
                    ))}
                    {formOpen && (
                        <form
                            className={`note-form ${newNote.color}`}
                            onSubmit={handleNoteSubmit}
                            style={{ backgroundColor: newNote.color }} // Dynamically set form background color
                        >
                            <label>Title:</label>
                            <input
                                type="text"
                                name="title"
                                value={newNote.title}
                                placeholder="Enter Title"
                                onChange={handleNoteChange}
                                className="newNoteTitle"
                            />
                            <label>Content:</label>
                            <textarea
                                name="content"
                                value={newNote.content}
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
                                            checked={newNote.color === color}
                                            onChange={() => handleColorChange(color)}
                                            id={color}
                                        />
                                        <label htmlFor={color} className={color}>
                                            {color.replace("light-", "").toUpperCase()}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <button type="submit">Add Note</button>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
}
