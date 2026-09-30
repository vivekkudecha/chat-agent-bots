import { useState } from 'react'
import { UploadCloud, File, Trash2, Bot } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { closeCreateBotModal, setActiveTab } from '@/features/ui/uiSlice'
import { createCustomBot } from '@/features/bots/botsSlice'
import { startNewChatWithBot } from '@/features/chat/chatSlice'
import type { AttachedFile } from '@/types'

export const CreateBotModal: React.FC = () => {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.ui.isCreateBotModalOpen)

  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [systemInstruction, setSystemInstruction] = useState('')
  const [files, setFiles] = useState<AttachedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleClose = () => {
    setName('')
    setRole('')
    setSystemInstruction('')
    setFiles([])
    setErrors({})
    dispatch(closeCreateBotModal())
  }

  const handleFileUpload = (incomingFiles: FileList | null) => {
    if (!incomingFiles || incomingFiles.length === 0) return

    const newAttachedFiles: AttachedFile[] = Array.from(incomingFiles).map((f) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
    }))

    setFiles((prev) => [...prev, ...newAttachedFiles])
  }

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
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

  const handleSubmit = (e: React.FormEvent) => {
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

    const initials = name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    // 1. Dispatch custom bot creation
    dispatch(
      createCustomBot({
        name: name.trim(),
        role: role.trim() || 'Custom Specialist',
        description: `Custom AI Bot trained on ${files.length} knowledge source(s).`,
        systemInstruction: systemInstruction.trim(),
        avatar: initials || 'CB',
        files,
      })
    )

    // 2. Automatically launch chat with newly created bot
    const botId = `bot-custom-${Date.now()}`
    dispatch(
      startNewChatWithBot({
        botId,
        botName: name.trim(),
        initialMessage: `Hello! I have created you with instructions: "${systemInstruction.trim().slice(0, 80)}..."`,
      })
    )

    // 3. Switch to Chat tab & close modal
    dispatch(setActiveTab('chat'))
    handleClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Custom AI Bot"
      description="Configure custom system instructions and upload knowledge files to tailor an AI bot for your specific enterprise tasks."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bot Name and Role Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Bot Name <span className="text-blue-600">*</span>
            </label>
            <Input
              placeholder="e.g. Telecom Billing Audit Bot"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
              error={errors.name}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Role / Specialty
            </label>
            <Input
              placeholder="e.g. Invoice Analysis & Tariffs"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>

        {/* System Instructions */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              System Instructions & Persona <span className="text-blue-600">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Guides how the bot behaves and responds</span>
          </div>
          <Textarea
            rows={4}
            placeholder="e.g. You are a Senior Telecom Billing Auditor. Always cross-reference invoice items against standard SLA tariffs and highlight discrepancies in a table format."
            value={systemInstruction}
            onChange={(e) => {
              setSystemInstruction(e.target.value)
              if (errors.systemInstruction)
                setErrors((prev) => ({ ...prev, systemInstruction: '' }))
            }}
            error={errors.systemInstruction}
          />
        </div>

        {/* Knowledge Base File Upload */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Knowledge Base Documents
            </label>
            <span className="text-[11px] text-slate-400">PDF, TXT, CSV, JSON, DOCX up to 25MB</span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50'
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.txt,.json,.csv,.doc,.docx,.md"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-2">
              <UploadCloud className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              <span className="text-blue-600 dark:text-blue-400 underline font-semibold">
                Click to browse
              </span>{' '}
              or drag & drop files here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Uploaded files will be indexed as training context for this custom bot
            </p>
          </div>

          {/* Attached Files List */}
          {files.length > 0 ? (
            <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </span>
                    <span className="text-slate-400 shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" className="gap-2">
            <Bot className="h-4 w-4" />
            <span>Create & Start Conversation</span>
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
