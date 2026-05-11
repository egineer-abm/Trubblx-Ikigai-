import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Book, Plus, Trash2, Save, Calendar } from "lucide-react";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { JournalEntry } from "../types";

interface Props {
  sessionId: string;
}

export default function Journal({ sessionId }: Props) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, `sessions/${sessionId}/journal`),
      orderBy("timestamp", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as JournalEntry)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `sessions/${sessionId}/journal`);
    });
  }, [sessionId]);

  const handleSave = async () => {
    if (!newNote.trim()) return;
    try {
      await addDoc(collection(db, `sessions/${sessionId}/journal`), {
        content: newNote,
        timestamp: serverTimestamp()
      });
      setNewNote("");
      setIsAdding(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `sessions/${sessionId}/journal`);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, `sessions/${sessionId}/journal`, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `sessions/${sessionId}/journal`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-serif italic">Reflection Journal</h3>
          <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Private thoughts & insights</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="h-10 w-10 rounded-full border border-page-text flex items-center justify-center hover:bg-page-text hover:text-white transition-all shadow-sm"
        >
          <Plus size={18} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="editorial-card p-6 border-passion/30 bg-passion/5"
          >
            <textarea
              autoFocus
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="What new insight did you find today?"
              className="w-full bg-transparent border-none focus:ring-0 text-sm font-serif italic placeholder:opacity-30 min-h-[100px] resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setIsAdding(false)} className="text-[10px] uppercase font-bold opacity-40 hover:opacity-100">Cancel</button>
              <button 
                onClick={handleSave}
                disabled={!newNote.trim()}
                className="bg-page-text text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold disabled:opacity-20"
              >
                Save Insight
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            layout
            className="editorial-card p-6 group hover:border-page-text/20 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 opacity-30 text-[9px] uppercase tracking-widest font-bold">
                <Calendar size={10} />
                {entry.timestamp?.seconds ? new Date(entry.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}
              </div>
              <button 
                onClick={() => deleteEntry(entry.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <p className="text-sm font-serif italic leading-relaxed text-page-text/80 whitespace-pre-wrap">
              {entry.content}
            </p>
          </motion.div>
        ))}

        {entries.length === 0 && !isAdding && (
          <div className="py-20 text-center opacity-30 italic font-serif border-2 border-dashed border-page-border rounded-2xl">
            No entries yet. Capture your reflections here.
          </div>
        )}
      </div>
    </div>
  );
}
