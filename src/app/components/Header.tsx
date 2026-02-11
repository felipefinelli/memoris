import { Trash2 } from 'lucide-react';

interface HeaderProps {
  onTrashClick: () => void;
  trashCount: number;
}

export function Header({ onTrashClick, trashCount }: HeaderProps) {
  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#FBD633"/>
            <path d="M12 16h16v12a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V16z" fill="#fff"/>
            <path d="M12 12h16v4H12z" fill="#fff" opacity="0.8"/>
          </svg>
          <h1 className="text-xl font-normal text-gray-700">Notas</h1>
        </div>
        
        <button
          onClick={onTrashClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors relative"
        >
          <Trash2 size={20} className="text-gray-600" />
          {trashCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {trashCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
