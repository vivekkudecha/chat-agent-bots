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
  const [activeDetail, setActiveDetail] = useState<{ msgId: string; type: 'sources' | 'usage' } | null>(null)

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
        <div className="max-w-xl mx-auto py-8 sm:py-12 text-center">
          <Avatar
            fallback={bot?.avatar || 'AI'}
            size="xl"
            status="online"
            className="mx-auto mb-3.5"
          />
          <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
            {bot?.name || 'AI Assistant'}
          </h2>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200/80 px-2 py-0.5 rounded-full">
              {bot?.department || bot?.category || 'Enterprise'}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-xs text-zinc-500">{bot?.role}</span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
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

                {/* Assistant Message Actions & Metadata Icons */}
                {!isUser ? (
                  <div className="mt-3 pt-2.5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{msg.timestamp}</span>

                      {/* Small Icon for Grounded Sources (if available) */}
                      {msg.sources && msg.sources.length > 0 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveDetail((prev) =>
                              prev?.msgId === msg.id && prev.type === 'sources'
                                ? null
                                : { msgId: msg.id, type: 'sources' }
                            )
                          }
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                            activeDetail?.msgId === msg.id && activeDetail.type === 'sources'
                              ? 'bg-zinc-900 text-white shadow-2xs'
                              : 'text-zinc-600 hover:text-zinc-950 bg-zinc-100/80 hover:bg-zinc-200/80 border border-zinc-200'
                          }`}
                          title="Click to view grounded sources"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Sources ({msg.sources.length})</span>
                        </button>
                      ) : null}

                      {/* Small Icon for Token Usage & Latency (if available) */}
                      {msg.usage ? (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveDetail((prev) =>
                              prev?.msgId === msg.id && prev.type === 'usage'
                                ? null
                                : { msgId: msg.id, type: 'usage' }
                            )
                          }
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                            activeDetail?.msgId === msg.id && activeDetail.type === 'usage'
                              ? 'bg-zinc-900 text-white shadow-2xs'
                              : 'text-zinc-600 hover:text-zinc-950 bg-zinc-100/80 hover:bg-zinc-200/80 border border-zinc-200'
                          }`}
                          title="Click to view token usage & metrics"
                        >
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          <span>
                            {typeof msg.usage.total_tokens === 'number'
                              ? `${msg.usage.total_tokens} tokens`
                              : 'Usage'}
                          </span>
                        </button>
                      ) : null}
                    </div>

                    {/* Copy message button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-100 hover:text-zinc-800 transition-colors cursor-pointer text-zinc-400"
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

                {/* Sources Details Panel: ONLY visible when user clicks the sources icon */}
                {!isUser &&
                  activeDetail?.msgId === msg.id &&
                  activeDetail.type === 'sources' &&
                  msg.sources &&
                  msg.sources.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-zinc-50 border border-zinc-200/90 text-xs animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-[11px]">
                          <FileText className="h-3.5 w-3.5 text-zinc-700" />
                          <span>Grounded Document Sources ({msg.sources.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveDetail(null)}
                          className="text-zinc-400 hover:text-zinc-900 text-[11px] p-0.5 rounded cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-2">
                        {msg.sources.map((src, sIdx) => {
                          const scorePercent =
                            typeof src.score === 'number'
                              ? `${Math.round(src.score * 100)}% Match`
                              : null

                          return (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-md bg-white border border-zinc-200 flex items-start justify-between gap-3 shadow-2xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-zinc-900 truncate">
                                    {src.fileName}
                                  </span>
                                  {src.page ? (
                                    <span className="text-[10px] text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded font-medium shrink-0">
                                      Page {src.page}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                                  ID: {src.documentId}
                                </p>
                              </div>

                              {scorePercent ? (
                                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                  {scorePercent}
                                </span>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                {/* Token Usage Details Panel: ONLY visible when user clicks the usage icon */}
                {!isUser &&
                  activeDetail?.msgId === msg.id &&
                  activeDetail.type === 'usage' &&
                  msg.usage && (
                    <div className="mt-3 p-3 rounded-lg bg-zinc-50 border border-zinc-200/90 text-xs animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
                        <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-[11px]">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          <span>Generation & Token Metrics</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveDetail(null)}
                          className="text-zinc-400 hover:text-zinc-900 text-[11px] p-0.5 rounded cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="p-2 rounded bg-white border border-zinc-200">
                          <span className="block text-[10px] text-zinc-400 font-medium">
                            Total Tokens
                          </span>
                          <span className="text-xs font-bold text-zinc-900 mt-0.5 block">
                            {msg.usage.total_tokens ?? 'N/A'}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-white border border-zinc-200">
                          <span className="block text-[10px] text-zinc-400 font-medium">
                            Prompt
                          </span>
                          <span className="text-xs font-bold text-zinc-900 mt-0.5 block">
                            {msg.usage.prompt_tokens ?? 'N/A'}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-white border border-zinc-200">
                          <span className="block text-[10px] text-zinc-400 font-medium">
                            Completion
                          </span>
                          <span className="text-xs font-bold text-zinc-900 mt-0.5 block">
                            {msg.usage.completion_tokens ?? 'N/A'}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-white border border-zinc-200">
                          <span className="block text-[10px] text-zinc-400 font-medium">
                            Latency
                          </span>
                          <span className="text-xs font-bold text-zinc-900 mt-0.5 block">
                            {msg.usage.latency_ms ? `${msg.usage.latency_ms}ms` : 'Fast'}
                          </span>
                        </div>
                      </div>

                      {msg.usage.model && (
                        <p className="mt-2 text-[10px] text-zinc-400 font-mono text-center">
                          Model: {String(msg.usage.model)}
                        </p>
                      )}
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
