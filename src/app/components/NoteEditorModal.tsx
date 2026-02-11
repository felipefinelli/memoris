import { useState, useRef, useEffect } from 'react';
import { Image, X, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Note } from './NoteCard';

interface NoteEditorModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, title: string, content: string, image?: string) => void;
  onDelete: (id: string) => void;
}

export function NoteEditorModal({ note, isOpen, onClose, onSave, onDelete }: NoteEditorModalProps) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [image, setImage] = useState<string | undefined>(note.image);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(note.title || '');
    setContent(note.content || '');
    setImage(note.image);
  }, [note]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, title, content, image]);

  const handleSave = () => {
    if (title.trim() || content.trim() || image) {
      onSave(note.id, title, content, image);
    } else {
      onDelete(note.id);
    }
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja mover esta nota para a lixeira?')) {
      onDelete(note.id);
      onClose();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20">
      <div
        ref={modalContentRef}
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl"
        style={{ backgroundColor: note.color }}
      >
        <div className="p-6">
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full outline-none mb-4 font-medium text-gray-800 text-xl bg-transparent"
          />
          
          <textarea
            placeholder="Criar uma nota..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full outline-none resize-none text-gray-700 bg-transparent"
            rows={8}
            autoFocus
          />
          
          {image && (
            <div className="mt-4 relative">
              <ImageWithFallback
                src={image}
                alt="Note preview"
                className="w-full rounded-lg max-h-96 object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload-editor"
              />
              <label
                htmlFor="image-upload-editor"
                className="p-2 rounded-full hover:bg-black/10 cursor-pointer transition-colors"
              >
                <Image size={20} className="text-gray-600" />
              </label>
              
              <button
                onClick={handleDelete}
                className="p-2 rounded-full hover:bg-black/10 transition-colors"
                title="Mover para lixeira"
              >
                <Trash2 size={20} className="text-gray-600" />
              </button>
            </div>

            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gray-800 text-white hover:bg-gray-700 rounded transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}