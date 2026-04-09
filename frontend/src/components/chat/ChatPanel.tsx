import { useEffect, useRef, useState } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import LoadingSpinner from '../common/LoadingSpinner';
import { chatApi } from '../../api/chatApi';
import type { ChatMessage, ChatSession } from '../../types';

interface ChatPanelProps {
  session: ChatSession;
  onClose?: () => void;
}

export default function ChatPanel({ session, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 메시지 히스토리 로드
  useEffect(() => {
    chatApi.getMessages(session.sessionId)
      .then((res) => setMessages(res.data))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [session.sessionId]);

  const handleSend = async (text: string) => {
    const optimisticMsg: ChatMessage = {
      messageId: Date.now(),
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setSending(true);

    try {
      const res = await chatApi.sendMessage(session.sessionId, text);
      const aiMsg = res.data;
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          messageId: Date.now() + 1,
          role: 'ASSISTANT',
          content: '오류가 발생했습니다. 다시 시도해주세요.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">AI 채팅 튜터</h3>
          <p className="text-xs text-gray-400 truncate">{session.lectureTitle}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-2">×</button>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loadingHistory ? (
          <div className="flex justify-center py-8"><LoadingSpinner size="sm" /></div>
        ) : (
          <>
            {messages.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">
                강의 내용에 대해 자유롭게 질문하세요.
              </p>
            )}
            {messages.map((msg) => (
              <ChatBubble key={msg.messageId} message={msg} />
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={sending || loadingHistory} />
    </div>
  );
}
