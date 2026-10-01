import { useState } from 'react'
import {
  UploadCloud,
  FileText,
  Trash2,
  Bot,
  Loader2,
  Lock,
  Building2,
  Globe,
  AlertCircle,
} from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { closeCreateBotModal, setActiveTab } from '@/features/ui/uiSlice'
import { createBotWithDocuments, clearCreateError, setSelectedBot } from '@/features/bots/botsSlice'
import { fetchBotConversations } from '@/features/chat/chatSlice'

export const CreateBotModal: React.FC = () => {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.ui.isCreateBotModalOpen)
  const isCreating = useAppSelector((state) => state.bots.isCreating)
  const createError = useAppSelector((state) => state.bots.createError)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [systemInstruction, setSystemInstruction] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [conversationStarters, setConversationStarters] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'organization' | 'public'>('private')
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [localError, setLocalError] = useState<string | null>(null)

  const handleClose = () => {
    if (isCreating) return
    setName('')
    setDescription('')
    setSystemInstruction('')
    setWelcomeMessage('')
    setConversationStarters('')
    setVisibility('private')
    setFiles([])
    setErrors({})
    setLocalError(null)
    dispatch(clearCreateError())
    dispatch(closeCreateBotModal())
  }

  const handleFileUpload = (incomingFiles: FileList | null) => {
    if (!incomingFiles || incomingFiles.length === 0) return
    const newFiles = Array.from(incomingFiles)
    // Avoid duplicate files with same name & size
    setFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`))
      const filtered = newFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`))
      return [...prev, ...filtered]
    })
  }

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== indexToRemove))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { [key: string]: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Bot name is required'
    }
    if (!systemInstruction.trim()) {
      newErrors.systemInstruction = 'System instructions are required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLocalError(null)
    dispatch(clearCreateError())

    // Parse conversation starters (split lines or commas)
    const startersList = conversationStarters
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    try {
      const createdBot = await dispatch(
        createBotWithDocuments({
          name: name.trim(),
          description: description.trim() || undefined,
          system_instruction: systemInstruction.trim(),
          welcome_message: welcomeMessage.trim() || undefined,
          conversation_starters: startersList.length > 0 ? startersList : undefined,
          visibility,
          files: files.length > 0 ? files : undefined,
        })
      ).unwrap()

      // Automatically launch chat with newly created bot
      dispatch(setSelectedBot(createdBot.id))
      dispatch(
        fetchBotConversations({
          botId: createdBot.id,
          botName: createdBot.name,
          page: 1,
        })
      )

      // Switch to Chat tab & close modal
      dispatch(setActiveTab('chat'))
      handleClose()
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : 'Failed to create bot. Please check your inputs.'
      setLocalError(msg)
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Custom AI Bot"
      description="Configure bot instructions, visibility, and upload documents to ground its responses with Qdrant knowledge base."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert Banner */}
        {(localError || createError) && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Creation Error</p>
              <p className="text-red-600 mt-0.5">{localError || createError}</p>
            </div>
          </div>
        )}

        {/* Row 1: Bot Name & Visibility */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Bot Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Vivek-Bot"
              value={name}
              disabled={isCreating}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
              error={errors.name}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Visibility <span className="text-zinc-400 font-normal">(Default: Private)</span>
            </label>
            <div className="relative">
              <select
                value={visibility}
                disabled={isCreating}
                onChange={(e) => setVisibility(e.target.value as 'private' | 'organization' | 'public')}
                className="w-full text-xs font-medium bg-white text-zinc-800 border border-zinc-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-colors"
              >
                <option value="private">Private (Only You)</option>
                <option value="organization">Organization (Team)</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
            Description
          </label>
          <Input
            placeholder="e.g. This is bot for Vivek"
            value={description}
            disabled={isCreating}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* System Instructions */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-zinc-800">
              System Instruction <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-zinc-400">Guides how the bot interprets context and answers</span>
          </div>
          <Textarea
            rows={3}
            disabled={isCreating}
            placeholder="e.g. You are Vivek's bot and by understanding his professional experience you have to explain Vivek."
            value={systemInstruction}
            onChange={(e) => {
              setSystemInstruction(e.target.value)
              if (errors.systemInstruction)
                setErrors((prev) => ({ ...prev, systemInstruction: '' }))
            }}
            error={errors.systemInstruction}
          />
        </div>

        {/* Welcome Message & Conversation Starters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Welcome Message (optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-800">
                Welcome Message
              </label>
              <span className="text-[11px] text-zinc-400">Optional</span>
            </div>
            <Input
              placeholder="e.g. You're at Vivek Kudecha's Place"
              value={welcomeMessage}
              disabled={isCreating}
              onChange={(e) => setWelcomeMessage(e.target.value)}
            />
            <p className="text-[10px] text-zinc-400 mt-1">Displayed when a new chat starts.</p>
          </div>

          {/* Conversation Starters (optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-800">
                Conversation Starters
              </label>
              <span className="text-[11px] text-zinc-400">Optional (one per line)</span>
            </div>
            <Textarea
              rows={2}
              disabled={isCreating}
              placeholder="e.g. What is your background?&#10;Which projects did you work on?"
              value={conversationStarters}
              onChange={(e) => setConversationStarters(e.target.value)}
            />
          </div>
        </div>

        {/* Knowledge Base File Upload */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-zinc-800">
              Knowledge Base Documents
            </label>
            <span className="text-[11px] text-zinc-400">PDF, TXT, DOCX, CSV up to 200MB</span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-zinc-900 bg-zinc-100'
                : 'border-zinc-200 hover:border-zinc-400 bg-zinc-50/60'
            } ${isCreating ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              type="file"
              multiple
              disabled={isCreating}
              accept=".pdf,.txt,.json,.csv,.doc,.docx,.md"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 mb-1.5 border border-zinc-200">
              <UploadCloud className="h-4.5 w-4.5" />
            </div>
            <p className="text-xs font-medium text-zinc-800">
              <span className="text-zinc-950 underline font-semibold">Click to browse</span> or drag & drop documents
            </p>
            <p className="text-[10.5px] text-zinc-400 mt-0.5">
              Documents are automatically indexed and embedded into Qdrant for this bot
            </p>
          </div>

          {/* Attached Files List */}
          {files.length > 0 ? (
            <div className="mt-2.5 space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-zinc-800 shrink-0" />
                    <span className="font-medium text-zinc-800 truncate">{file.name}</span>
                    <span className="text-zinc-400 shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isCreating}
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1 text-zinc-400 hover:text-red-600 rounded-md transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            {visibility === 'private' && (
              <>
                <Lock className="h-3.5 w-3.5 text-zinc-500" />
                <span>Private bot</span>
              </>
            )}
            {visibility === 'organization' && (
              <>
                <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                <span>Shared with organization</span>
              </>
            )}
            {visibility === 'public' && (
              <>
                <Globe className="h-3.5 w-3.5 text-zinc-500" />
                <span>Publicly accessible</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isCreating}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isCreating}
              className="gap-2 font-semibold min-w-[140px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Bot...</span>
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4" />
                  <span>Create Bot</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
