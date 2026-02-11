import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Header } from './components/Header';
import { NoteInput } from './components/NoteInput';
import { NoteCard, Note } from './components/NoteCard';
import { TrashModal } from './components/TrashModal';
import { NoteEditorModal } from './components/NoteEditorModal';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Carregar notas do localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    const savedTrash = localStorage.getItem('trashedNotes');
    
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    
    if (savedTrash) {
      setTrashedNotes(JSON.parse(savedTrash));
    }
  }, []);

  // Salvar notas no localStorage
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('trashedNotes', JSON.stringify(trashedNotes));
  }, [trashedNotes]);

  // Limpar notas da lixeira após 15 dias
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
      
      setTrashedNotes((prev) =>
        prev.filter((note) => now - note.createdAt < fifteenDaysInMs)
      );
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, []);

  const handleAddNote = (title: string, content: string, image?: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      image,
      color: '#ffffff',
      createdAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
  };

  const handleDeleteNote = (id: string) => {
    const noteToDelete = notes.find((note) => note.id === id);
    if (noteToDelete) {
      setNotes(notes.filter((note) => note.id !== id));
      setTrashedNotes([{ ...noteToDelete, createdAt: Date.now() }, ...trashedNotes]);
      // Fechar o modal de edição se a nota excluída for a que está sendo editada
      if (editingNote && editingNote.id === id) {
        setEditingNote(null);
      }
    }
  };

  const handleDuplicateNote = (id: string) => {
    const noteToDuplicate = notes.find((note) => note.id === id);
    if (noteToDuplicate) {
      const duplicatedNote: Note = {
        ...noteToDuplicate,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      setNotes([duplicatedNote, ...notes]);
    }
  };

  const handleColorChange = (id: string, color: string) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, color } : note)));
  };

  const handleMoveNote = (dragIndex: number, hoverIndex: number) => {
    const draggedNote = notes[dragIndex];
    const newNotes = [...notes];
    newNotes.splice(dragIndex, 1);
    newNotes.splice(hoverIndex, 0, draggedNote);
    setNotes(newNotes);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
  };

  const handleSaveNote = (id: string, title: string, content: string, image?: string) => {
    setNotes(notes.map((note) => 
      note.id === id ? { ...note, title, content, image } : note
    ));
  };

  const handleRestoreNote = (id: string) => {
    const noteToRestore = trashedNotes.find((note) => note.id === id);
    if (noteToRestore) {
      setTrashedNotes(trashedNotes.filter((note) => note.id !== id));
      setNotes([{ ...noteToRestore, createdAt: Date.now() }, ...notes]);
    }
  };

  const handlePermanentDelete = (id: string) => {
    setTrashedNotes(trashedNotes.filter((note) => note.id !== id));
  };

  const handleEmptyTrash = () => {
    if (window.confirm('Tem certeza que deseja esvaziar a lixeira? Esta ação não pode ser desfeita.')) {
      setTrashedNotes([]);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <Header onTrashClick={() => setShowTrash(true)} trashCount={trashedNotes.length} />
        
        <main className="max-w-[1800px] mx-auto px-6 py-8">
          <NoteInput onAddNote={handleAddNote} />
          
          {notes.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">Nenhuma nota ainda</p>
              <p className="text-sm mt-2">Clique acima para criar sua primeira nota</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 auto-rows-max">
              {notes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  index={index}
                  onDelete={handleDeleteNote}
                  onDuplicate={handleDuplicateNote}
                  onColorChange={handleColorChange}
                  onMoveNote={handleMoveNote}
                  onEdit={handleEditNote}
                />
              ))}
            </div>
          )}
        </main>

        <TrashModal
          isOpen={showTrash}
          onClose={() => setShowTrash(false)}
          trashedNotes={trashedNotes}
          onRestore={handleRestoreNote}
          onPermanentDelete={handlePermanentDelete}
          onEmptyTrash={handleEmptyTrash}
        />

        {editingNote && (
          <NoteEditorModal
            note={editingNote}
            isOpen={!!editingNote}
            onClose={() => setEditingNote(null)}
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
          />
        )}
      </div>
    </DndProvider>
  );
}