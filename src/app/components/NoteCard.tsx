import { Copy, MoreVertical, Palette, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'motion/react';

export interface Note {
  id: string;
  title: string;
  content: string;
  image?: string;
  color: string;
  createdAt: number;
}

interface NoteCardProps {
  note: Note;
  index: number;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onColorChange: (id: string, color: string) => void;
  onMoveNote: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (note: Note) => void;
}

const COLORS = [
  { name: 'Padrão', value: '#ffffff' },
  { name: 'Vermelho', value: '#f28b82' },
  { name: 'Laranja', value: '#fbbc04' },
  { name: 'Amarelo', value: '#fff475' },
  { name: 'Verde', value: '#ccff90' },
  { name: 'Azul', value: '#a7ffeb' },
  { name: 'Azul Escuro', value: '#cbf0f8' },
  { name: 'Roxo', value: '#aecbfa' },
  { name: 'Rosa', value: '#fdcfe8' },
  { name: 'Cinza', value: '#e8eaed' },
];

const ItemType = 'NOTE';

export function NoteCard({ note, index, onDelete, onDuplicate, onColorChange, onMoveNote, onEdit }: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item: { index: number }, monitor) => {
      if (!cardRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = cardRef.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      
      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;
      
      // Aumentar sensibilidade para 30% ao invés de 50%
      const hoverThresholdY = (hoverBoundingRect.bottom - hoverBoundingRect.top) * 0.3;
      const hoverThresholdX = (hoverBoundingRect.right - hoverBoundingRect.left) * 0.3;

      // Mover se passar 30% da área
      if (dragIndex < hoverIndex && hoverClientY < hoverThresholdY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > (hoverBoundingRect.bottom - hoverBoundingRect.top) - hoverThresholdY) {
        return;
      }

      onMoveNote(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(cardRef));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowColorPicker(false);
      }
    };

    if (showMenu || showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showColorPicker]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Não abrir o editor se clicar nos botões de ação
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onEdit(note);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isDragging ? 0 : 1,
        scale: isDragging ? 1.05 : 1,
      }}
      transition={{
        layout: { duration: 0.3, type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }}
      className={`rounded-lg border group relative cursor-pointer transition-shadow ${
        isDragging ? 'shadow-[0_10px_40px_rgba(0,0,0,0.3)]' : 'shadow-md hover:shadow-lg'
      }`}
      style={{ 
        backgroundColor: note.color,
        visibility: isDragging ? 'hidden' : 'visible',
      }}
      onClick={handleCardClick}
    >
      <div className="p-4">
        {note.image && (
          <ImageWithFallback
            src={note.image}
            alt="Note"
            className="w-full rounded-lg mb-3 max-h-48 object-cover pointer-events-none"
          />
        )}
        
        {note.title && (
          <h3 className="font-medium text-gray-800 mb-2">{note.title}</h3>
        )}
        
        {note.content && (
          <p className="text-gray-700 whitespace-pre-wrap break-words line-clamp-6">{note.content}</p>
        )}
      </div>

      <div className="px-2 pb-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(note.id);
            }}
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
            title="Duplicar nota"
          >
            <Copy size={18} className="text-gray-700" />
          </button>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
                setShowMenu(false);
              }}
              className="p-2 rounded-full hover:bg-black/10 transition-colors"
              title="Mudar cor"
            >
              <Palette size={18} className="text-gray-700" />
            </button>

            {showColorPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-3 z-10 border">
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        onColorChange(note.id, color.value);
                        setShowColorPicker(false);
                      }}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-600 transition-colors"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
              setShowColorPicker(false);
            }}
            className="p-2 rounded-full hover:bg-black/10 transition-colors"
          >
            <MoreVertical size={18} className="text-gray-700" />
          </button>

          {showMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg py-1 z-10 border min-w-[150px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}