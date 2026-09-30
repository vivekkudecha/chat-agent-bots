import React, { useState, useRef } from 'react'
import { ArrowUp, Paperclip, X, FileText } from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { addUserMessage, addAssistantMessage, setIsTyping } from '@/features/chat/chatSlice'
import type { AttachedFile, Bot, Conversation } from '@/types'

interface ChatInputProps {
  conversation?: Conversation
  bot?: Bot
  disabled?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({
  conversation,
  bot,
  disabled = false,
}) => {
  const dispatch = useAppDispatch()
  const [text, setText] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles: AttachedFile[] = Array.from(e.target.files).map((f) => ({
      id: `chat-file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
    }))
    setAttachedFiles((prev) => [...prev, ...newFiles])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleSendMessage = () => {
    if (!conversation || (!text.trim() && attachedFiles.length === 0)) return

    const userText = text.trim()
    const filesToSend = [...attachedFiles]

    // Clear input immediately
    setText('')
    setAttachedFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // 1. Add User Message
    dispatch(
      addUserMessage({
        conversationId: conversation.id,
        text: userText,
        files: filesToSend,
      })
    )

    // 2. Simulate AI response tailored to bot persona
    dispatch(setIsTyping(true))
    setTimeout(() => {
      let reply = ''
      const botName = bot?.name || 'Assistant'
      const attachedSummary = filesToSend.length > 0
        ? `I have reviewed the attached document(s): **${filesToSend.map((f) => f.name).join(', ')}**.\n\n`
        : ''

      if (bot?.id === 'bot-org-2') {
        reply = `${attachedSummary}Here is the engineering assessment regarding: "${userText}":\n\n- **Modularity & Decoupling**: Ensure logic is encapsulated in isolated services.\n- **Error Boundaries**: Wrap critical async thunks with predictable fallback states.\n- **Verification**: Verified zero memory leaks or unhandled promise rejections.`
      } else if (bot?.id === 'bot-org-1') {
        reply = `${attachedSummary}I have analyzed the customer context for "${userText}". Here is the recommended mitigation action plan:\n\n1. Acknowledge customer impact immediately with SLA timestamp verification.\n2. Apply appropriate credit policy according to Tier-1 enterprise clauses.\n3. Schedule technical review call with customer engineering stakeholders.`
      } else if (bot?.isCustom) {
        reply = `${attachedSummary}As **${botName}** with instructions: *"${bot.systemInstruction.slice(0, 70)}..."*:\n\nBased on your prompt "${userText}", I have processed the relevant data points and confirmed consistency with the knowledge base.`
      } else {
        reply = `${attachedSummary}Thank you for your message. As **${botName}**, I have examined your request regarding "${userText}". All system guidelines and constraints have been verified.`
      }

      dispatch(
        addAssistantMessage({
          conversationId: conversation.id,
          text: reply,
        })
      )
    }, 900)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    // Auto-grow textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 shrink-0">
      <div className="max-w-3xl mx-auto">
        {/* Attached Files Preview Chips */}
        {attachedFiles.length > 0 ? (
          <div className="mb-2.5 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-1">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300"
              >
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                <span className="truncate max-w-[160px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.id)}
                  className="p-0.5 hover:bg-blue-200/50 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {/* Tailgrids-inspired Floating Input Container */}
        <div className="relative flex items-end rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-2">
          {/* File Attachment Action Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-colors cursor-pointer shrink-0 mb-0.5"
            title="Attach documents or data files"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={`Message ${bot?.name || 'AI Assistant'}...`}
            className="flex-1 max-h-44 min-h-[40px] resize-none bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={disabled || (!text.trim() && attachedFiles.length === 0)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 mb-0.5 active:scale-95"
          >
            <ArrowUp className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
          Press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Enter</kbd> to send, <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}
