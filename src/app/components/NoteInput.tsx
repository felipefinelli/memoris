import { useState, useRef, useEffect } from 'react';
import { Image, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NoteInputProps {
  onAddNote: (title: string, content: string, image?: string) => void;
}

export function NoteInput({ onAddNote }: NoteInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-salvar quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isExpanded) {
          handleSave();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, title, content, image]);

  // Auto-salvar quando sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isExpanded && (title.trim() || content.trim() || image)) {
        handleSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isExpanded, title, content, image]);

  const handleSave = () => {
    if (title.trim() || content.trim() || image) {
      onAddNote(title, content, image);
    }
    setTitle('');
    setContent('');
    setImage(undefined);
    setIsExpanded(false);
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

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div ref={containerRef} className="bg-white rounded-lg border shadow-md p-4">
        {!isExpanded ? (
          <input
            type="text"
            placeholder="Criar uma nota..."
            className="w-full outline-none text-gray-700"
            onFocus={() => setIsExpanded(true)}
          />
        ) : (
          <>
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full outline-none mb-3 font-medium text-gray-800"
            />
            <textarea
              placeholder="Criar uma nota..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full outline-none resize-none text-gray-700"
              rows={3}
            />
            
            {image && (
              <div className="mt-3 relative">
                <ImageWithFallback
                  src={image}
                  alt="Note preview"
                  className="w-full rounded-lg max-h-64 object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <Image size={20} className="text-gray-600" />
                </label>
              </div>

              <button
                onClick={() => {
                  setIsExpanded(false);
                  setTitle('');
                  setContent('');
                  setImage(undefined);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
