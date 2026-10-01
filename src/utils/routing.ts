/**
 * URL Slug Routing Helper for Bot Pages
 * Enables deep linking, separate page URLs (/bot/:slug), and preserving page state on refresh.
 */

export function getBotSlugFromUrl(): string | null {
  if (typeof window === 'undefined') return null

  const path = window.location.pathname

  // 1. Primary route pattern: /bot/:slug (e.g. /bot/vivek-bot)
  const botPrefixMatch = path.match(/^\/bot\/([^/?#]+)/i)
  if (botPrefixMatch) {
    return decodeURIComponent(botPrefixMatch[1].trim())
  }

  // 2. Direct slug pattern: /:slug (e.g. /vivek-bot)
  const cleanPath = path.replace(/^\/+|\/+$/g, '')
  const reservedPaths = new Set(['', 'login', 'agents', 'home', 'api', 'dashboard'])
  if (cleanPath && !reservedPaths.has(cleanPath.toLowerCase()) && !cleanPath.includes('/')) {
    return decodeURIComponent(cleanPath.trim())
  }

  // 3. Fallback to hash if present: #/bot/:slug
  const hash = window.location.hash.replace(/^#\/?/, '')
  const hashMatch = hash.match(/^(?:bot\/)?([^/?#]+)/i)
  if (hashMatch && !reservedPaths.has(hashMatch[1].toLowerCase())) {
    return decodeURIComponent(hashMatch[1].trim())
  }

  return null
}

export function getConversationIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null

  // 1. Check query parameters ?c=xxx or ?conversation=xxx or ?conversation_id=xxx
  const searchParams = new URLSearchParams(window.location.search)
  const queryParam =
    searchParams.get('c') ||
    searchParams.get('conversation') ||
    searchParams.get('conversation_id')
  if (queryParam) {
    return queryParam.trim()
  }

  // 2. Check path pattern /bot/:slug/:conversation_id
  const subPathMatch = window.location.pathname.match(/^\/bot\/[^/?#]+\/([^/?#]+)/i)
  if (subPathMatch) {
    return decodeURIComponent(subPathMatch[1].trim())
  }

  return null
}

export function getSavedConversationId(botId: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(`tatatel_active_conv_${botId}`)
}

export function saveActiveConversationId(botId: string, conversationId: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`tatatel_active_conv_${botId}`, conversationId)
}

export function removeSavedConversationId(botId: string) {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`tatatel_active_conv_${botId}`)
}

export function navigateToBot(
  bot: { id: string; name: string; slug?: string },
  conversationId?: string | null
) {
  if (typeof window === 'undefined') return

  const slug =
    bot.slug ||
    bot.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    bot.id

  const activeId = conversationId || getSavedConversationId(bot.id)
  const search = activeId ? `?c=${encodeURIComponent(activeId)}` : ''
  const targetPath = `/bot/${slug}${search}`

  if (window.location.pathname + window.location.search !== targetPath) {
    window.history.pushState({ botId: bot.id, slug, conversationId: activeId }, '', targetPath)
  }

  if (activeId) {
    saveActiveConversationId(bot.id, activeId)
  }

  document.title = `${bot.name} — TataTel AI`
}

export function updateActiveConversationUrl(
  bot: { id: string; name: string; slug?: string },
  conversationId: string
) {
  if (typeof window === 'undefined') return

  const slug =
    bot.slug ||
    bot.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') ||
    bot.id

  const targetPath = `/bot/${slug}?c=${encodeURIComponent(conversationId)}`

  if (window.location.pathname + window.location.search !== targetPath) {
    window.history.replaceState({ botId: bot.id, slug, conversationId }, '', targetPath)
  }

  saveActiveConversationId(bot.id, conversationId)
}

export function navigateToHome() {
  if (typeof window === 'undefined') return

  if (window.location.pathname !== '/' || window.location.search !== '') {
    window.history.pushState(null, '', '/')
  }

  document.title = 'TataTel AI — Enterprise Agent Hub'
}
