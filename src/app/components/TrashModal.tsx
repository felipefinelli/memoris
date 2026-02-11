import { X, RotateCcw, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Note } from './NoteCard';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  trashedNotes: Note[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
}

export function TrashModal({
  isOpen,
  onClose,
  trashedNotes,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
}: TrashModalProps) {
  if (!isOpen) return null;

  const getDaysRemaining = (createdAt: number) => {
    const deletedAt = createdAt;
    const now = Date.now();
    const daysPassed = Math.floor((now - deletedAt) / (1000 * 60 * 60 * 24));
    return Math.max(0, 15 - daysPassed);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-normal text-gray-800">Lixeira</h2>
            <p className="text-sm text-gray-600 mt-1">
              As notas são excluídas permanentemente após 15 dias
            </p>
          </div>
          <div className="flex gap-2">
            {trashedNotes.length > 0 && (
              <button
                onClick={onEmptyTrash}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Esvaziar lixeira
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {trashedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Trash2 size={64} className="mb-4 opacity-50" />
              <p>A lixeira está vazia</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trashedNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border shadow-md relative"
                  style={{ backgroundColor: note.color }}
                >
                  <div className="p-4">
                    {note.image && (
                      <ImageWithFallback
                        src={note.image}
                        alt="Note"
                        className="w-full rounded-lg mb-3 max-h-48 object-cover"
                      />
                    )}
                    
                    {note.title && (
                      <h3 className="font-medium text-gray-800 mb-2">{note.title}</h3>
                    )}
                    
                    {note.content && (
                      <p className="text-gray-700 whitespace-pre-wrap break-words line-clamp-3">
                        {note.content}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                      <span>Expira em {getDaysRemaining(note.createdAt)} dias</span>
                    </div>
                  </div>

                  <div className="px-2 pb-2 flex items-center gap-2">
                    <button
                      onClick={() => onRestore(note.id)}
                      className="flex-1 px-3 py-2 bg-white hover:bg-gray-100 rounded transition-colors flex items-center justify-center gap-2"
                      title="Restaurar"
                    >
                      <RotateCcw size={16} />
                      Restaurar
                    </button>
                    <button
                      onClick={() => onPermanentDelete(note.id)}
                      className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors flex items-center justify-center gap-2"
                      title="Excluir permanentemente"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
