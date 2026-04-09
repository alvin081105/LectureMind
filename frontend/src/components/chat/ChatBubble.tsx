import BloomBadge from '../common/BloomBadge';
import type { BloomLevel, ChatMessage } from '../../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'USER';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isUser && message.bloomLevel && (
          <BloomBadge level={message.bloomLevel as BloomLevel} size="sm" />
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-indigo-500 text-white rounded-br-sm shadow-sm'
              : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
          }`}
        >
          {message.content}
        </div>
        {!isUser && message.suggestion && (
          <p className="text-xs text-indigo-500 px-1">{message.suggestion}</p>
        )}
      </div>
    </div>
  );
}
