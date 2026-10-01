import type { ChatMessage, ChatSource, TokenUsage } from '@/types'
import type { BackendMessage, ChatApiResult } from '@/services/api'

/**
 * Chat Parser and Metadata Management Utility
 * 
 * - Parses and normalizes incoming chat response content (Markdown, bullet points, clean text).
 * - Normalizes token usage, latency, and grounded sources.
 * - Persists message metadata (sources + usage) in localStorage so full attribution
 *   remains available across page refreshes and session restarts.
 */

const STORAGE_PREFIX = 'tatatel_msg_meta_'

/**
 * Normalizes raw chat text from LLMs:
 * - Converts unicode bullets ('•', '◦', '▪') to markdown bullets ('* ')
 * - Fixes tabbed bullet indents
 * - Cleans up potential think tags or extra carriage returns
 */
export function normalizeChatMessageText(text: string): string {
  if (!text) return ''

  let cleaned = text.replace(/\r\n/g, '\n')

  // Convert unicode bullets at line starts into standard markdown list bullets
  cleaned = cleaned.replace(/^([ \t]*)[•◦▪]\s+/gm, '$1* ')

  // Convert tabbed asterisk/hyphen bullets to double-space indent
  cleaned = cleaned.replace(/^\t+([*\-+])/gm, (match, bullet) => {
    const tabs = match.length - 1
    return '  '.repeat(tabs) + bullet
  })

  return cleaned.trim()
}

/**
 * Normalizes usage metadata from diverse backend / LLM response formats
 */
export function normalizeTokenUsage(
  rawUsage?: Record<string, unknown> | null,
  latencyMs?: number | null,
  model?: string | null
): TokenUsage | undefined {
  if (!rawUsage && !latencyMs && !model) {
    return undefined
  }

  const u = rawUsage || {}
  const inputTokens = (u.input_tokens ?? u.prompt_tokens) as number | undefined
  const outputTokens = (u.output_tokens ?? u.completion_tokens) as number | undefined
  const totalTokens = (u.total_tokens as number | undefined) ?? 
    ((inputTokens !== undefined || outputTokens !== undefined)
      ? (inputTokens || 0) + (outputTokens || 0)
      : undefined)

  return {
    ...u,
    input_tokens: inputTokens,
    prompt_tokens: inputTokens,
    output_tokens: outputTokens,
    completion_tokens: outputTokens,
    total_tokens: totalTokens,
    latency_ms: (latencyMs ?? u.latency_ms) as number | undefined,
    model: (model ?? u.model) as string | undefined,
  }
}

/**
 * Normalizes sources returned from the backend into typed ChatSource objects
 */
export function normalizeChatSources(
  rawSources?: Array<Record<string, unknown>> | null
): ChatSource[] | undefined {
  if (!rawSources || !Array.isArray(rawSources) || rawSources.length === 0) {
    return undefined
  }

  return rawSources.map((s) => ({
    documentId: String(s.document_id || s.documentId || s.id || ''),
    fileName: String(s.file_name || s.fileName || s.name || 'Document'),
    page: typeof s.page === 'number' ? s.page : undefined,
    score: typeof s.score === 'number' ? s.score : undefined,
    knowledgeBaseId: s.knowledge_base_id ? String(s.knowledge_base_id) : undefined,
  }))
}

/**
 * Saves per-message metadata (sources, usage) to localStorage keyed by conversation ID
 */
export function saveMessageMetadata(
  conversationId: string,
  messageId: string,
  meta: { sources?: ChatSource[]; usage?: TokenUsage }
) {
  if (typeof window === 'undefined' || !conversationId || !messageId) return

  try {
    const key = `${STORAGE_PREFIX}${conversationId}`
    const existingStr = localStorage.getItem(key)
    const existing = existingStr ? JSON.parse(existingStr) : {}

    existing[messageId] = {
      ...(existing[messageId] || {}),
      ...(meta.sources ? { sources: meta.sources } : {}),
      ...(meta.usage ? { usage: meta.usage } : {}),
    }

    localStorage.setItem(key, JSON.stringify(existing))
  } catch {
    // Gracefully handle storage quota or private browsing exceptions
  }
}

/**
 * Retrieves per-message metadata from localStorage
 */
export function getMessageMetadata(
  conversationId: string,
  messageId: string
): { sources?: ChatSource[]; usage?: TokenUsage } | null {
  if (typeof window === 'undefined' || !conversationId || !messageId) return null

  try {
    const key = `${STORAGE_PREFIX}${conversationId}`
    const str = localStorage.getItem(key)
    if (!str) return null
    const parsed = JSON.parse(str)
    return parsed[messageId] || null
  } catch {
    return null
  }
}

/**
 * Parses raw API chat response from POST /api/v1/chat into a rich ChatMessage
 */
export function parseApiChatResponse(
  res: ChatApiResult,
  conversationId: string
): ChatMessage {
  const sources = normalizeChatSources(res.sources)
  const usage = normalizeTokenUsage(res.usage, res.latency_ms, res.model)
  const text = normalizeChatMessageText(res.content)

  const messageId = res.message_id || `msg-${Date.now()}`

  // Persist source & usage info so it survives page reloads
  saveMessageMetadata(conversationId, messageId, {
    sources,
    usage,
  })

  return {
    id: messageId,
    sender: 'assistant',
    text,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    sources,
    usage,
  }
}

/**
 * Converts a backend stored message (from GET /api/v1/conversations/:id)
 * into a rich ChatMessage, hydrating cached sources & usage if available.
 */
export function parseStoredBackendMessage(
  m: BackendMessage,
  conversationId: string
): ChatMessage {
  // Check localStorage metadata cache first (has rich sources and usage from real-time response)
  const cachedMeta = getMessageMetadata(conversationId, m.id)

  let usage: TokenUsage | undefined = cachedMeta?.usage
  if (!usage && (m.input_tokens != null || m.output_tokens != null || m.latency_ms != null)) {
    usage = normalizeTokenUsage(
      {
        input_tokens: m.input_tokens,
        output_tokens: m.output_tokens,
        ...(m.metadata || {}),
      },
      m.latency_ms,
      m.model_id
    )
  }

  let sources: ChatSource[] | undefined = cachedMeta?.sources
  if (!sources && m.metadata?.sources && Array.isArray(m.metadata.sources)) {
    sources = normalizeChatSources(m.metadata.sources as Array<Record<string, unknown>>)
  }

  return {
    id: m.id,
    sender: m.role,
    text: normalizeChatMessageText(m.content),
    timestamp: new Date(m.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    sources,
    usage,
  }
}
