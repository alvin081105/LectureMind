import { type KeyboardEvent, useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-white border-t border-gray-200">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder="강의 내용에 대해 질문하세요... (Enter로 전송)"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-32"
        style={{ height: 'auto' }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        }}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        전송
      </button>
    </div>
  );
}
