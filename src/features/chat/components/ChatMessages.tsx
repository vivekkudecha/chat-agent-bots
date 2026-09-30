import React, { useEffect, useRef, useState } from 'react'
import { Copy, Check, FileText, Sparkles } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import type { Bot, Conversation } from '@/types'
import { useAppDispatch } from '@/app/hooks'
import { addUserMessage } from '@/features/chat/chatSlice'

interface ChatMessagesProps {
  conversation?: Conversation
  bot?: Bot
  isTyping: boolean
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  conversation,
  bot,
  isTyping,
}) => {
  const dispatch = useAppDispatch()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages, isTyping])

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSelectStarter = (promptText: string) => {
    if (!conversation) return
    dispatch(
      addUserMessage({
        conversationId: conversation.id,
        text: promptText,
      })
    )
  }

  const messages = conversation?.messages || []

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 space-y-6">
      {/* If conversation is empty, display welcome & starter prompts */}
      {messages.length === 0 ? (
        <div className="max-w-xl mx-auto py-12 text-center">
          <Avatar
            fallback={bot?.avatar || 'AI'}
            size="xl"
            status="online"
            className="mx-auto mb-4"
          />
          <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
            {bot?.name || 'AI Assistant'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500">
            {bot?.description || 'Ask questions, review documents, and explore solutions.'}
          </p>

          {/* Starter Prompts */}
          {bot?.suggestedPrompts && bot.suggestedPrompts.length > 0 ? (
            <div className="mt-8">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-zinc-700" />
                <span>Suggested conversation starters</span>
              </p>
              <div className="grid grid-cols-1 gap-2">
                {bot.suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectStarter(prompt)}
                    className="p-3 text-left text-xs sm:text-sm font-medium text-zinc-800 bg-white border border-zinc-200 rounded-xl hover:border-zinc-400 hover:bg-zinc-50/80 shadow-2xs transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <span>"{prompt}"</span>
                    <span className="text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Message Feed */}
      {messages.map((msg) => {
        const isUser = msg.sender === 'user'

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-3xl ${
              isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            {!isUser ? (
              <Avatar
                fallback={bot?.avatar || 'AI'}
                size="sm"
                status="online"
                className="mt-0.5"
              />
            ) : null}

            {/* Bubble Container */}
            <div className="flex flex-col space-y-1.5 max-w-[85%] sm:max-w-[78%]">
              <div
                className={`relative px-4 py-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-zinc-900 text-zinc-50 rounded-tr-xs shadow-2xs border border-zinc-950'
                    : 'bg-white text-zinc-900 border border-zinc-200 rounded-tl-xs shadow-2xs'
                }`}
              >
                {/* File attachments badge inside message */}
                {msg.files && msg.files.length > 0 ? (
                  <div className="mb-2.5 flex flex-wrap gap-1.5">
                    {msg.files.map((file) => (
                      <div
                        key={file.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          isUser
                            ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                            : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                        }`}
                      >
                        <FileText className="h-3 w-3" />
                        <span className="truncate max-w-[140px]">{file.name}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Message Text with simple formatting */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Copy button for assistant */}
                {!isUser ? (
                  <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{msg.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-100 hover:text-zinc-700 transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-zinc-400 text-right mt-1">
                    {msg.timestamp}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Typing indicator */}
      {isTyping ? (
        <div className="flex items-start gap-3 max-w-3xl mr-auto">
          <Avatar
            fallback={bot?.avatar || 'AI'}
            size="sm"
            status="online"
            className="mt-0.5"
          />
          <div className="px-4 py-3 rounded-xl rounded-tl-xs bg-white border border-zinc-200 shadow-2xs flex items-center gap-2">
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-zinc-900 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 rounded-full bg-zinc-900 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 rounded-full bg-zinc-900 animate-bounce"></span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">Analyzing response...</span>
          </div>
        </div>
      ) : null}

      <div ref={messagesEndRef} />
    </div>
  )
}
