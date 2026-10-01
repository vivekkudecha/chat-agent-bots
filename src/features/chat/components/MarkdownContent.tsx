import React, { useState } from 'react'
import { marked, type Tokens } from 'marked'
import { Check, Copy } from 'lucide-react'

interface MarkdownContentProps {
  content: string
  isUser?: boolean
}

/**
 * Interactive Code Block with copy-to-clipboard functionality
 */
const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const langDisplay = language ? language.toLowerCase() : 'text'

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-zinc-700/80 bg-zinc-950 text-zinc-100 shadow-sm font-mono text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400 select-none">
        <span className="font-semibold uppercase tracking-wider text-zinc-300">
          {langDisplay}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-3 overflow-x-auto leading-relaxed text-zinc-100 font-mono text-[11px] sm:text-xs">
        <code>{code}</code>
      </pre>
    </div>
  )
}

/**
 * Recursive inline text token renderer
 */
const renderInlineTokens = (
  tokens?: Tokens.Generic[] | null,
  fallbackText?: string,
  isUser?: boolean
): React.ReactNode => {
  if (!tokens || tokens.length === 0) {
    return fallbackText || null
  }

  return tokens.map((token, idx) => {
    switch (token.type) {
      case 'strong':
        return (
          <strong key={idx} className="font-semibold text-zinc-950">
            {renderInlineTokens(token.tokens, token.text, isUser)}
          </strong>
        )

      case 'em':
        return (
          <em key={idx} className="italic">
            {renderInlineTokens(token.tokens, token.text, isUser)}
          </em>
        )

      case 'codespan':
        return (
          <code
            key={idx}
            className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-medium ${
              isUser
                ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
            }`}
          >
            {token.text}
          </code>
        )

      case 'link':
        return (
          <a
            key={idx}
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 underline underline-offset-2 hover:text-zinc-600 font-medium transition-colors"
          >
            {renderInlineTokens(token.tokens, token.text, isUser)}
          </a>
        )

      case 'br':
        return <br key={idx} />

      case 'text':
      default:
        if (token.tokens && token.tokens.length > 0) {
          return (
            <React.Fragment key={idx}>
              {renderInlineTokens(token.tokens, token.text, isUser)}
            </React.Fragment>
          )
        }
        return <React.Fragment key={idx}>{token.text}</React.Fragment>
    }
  })
}

/**
 * Block level token renderer
 */
const renderBlockToken = (
  token: Tokens.Generic,
  key: string | number,
  isUser?: boolean
): React.ReactNode => {
  switch (token.type) {
    case 'heading': {
      const headingToken = token as Tokens.Heading
      const HeadingTag = `h${Math.min(headingToken.depth, 6)}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      const headingSizes: Record<number, string> = {
        1: 'text-base sm:text-lg font-bold mt-4 mb-2',
        2: 'text-sm sm:text-base font-bold mt-3 mb-1.5',
        3: 'text-xs sm:text-sm font-bold mt-2.5 mb-1',
        4: 'text-xs font-semibold mt-2 mb-1',
        5: 'text-xs font-semibold mt-1.5 mb-1',
        6: 'text-xs font-medium mt-1 mb-0.5 text-zinc-600',
      }
      return (
        <HeadingTag
          key={key}
          className={`${headingSizes[headingToken.depth] || 'font-bold'} text-zinc-950 tracking-tight`}
        >
          {renderInlineTokens(headingToken.tokens, headingToken.text, isUser)}
        </HeadingTag>
      )
    }

    case 'paragraph': {
      const pToken = token as Tokens.Paragraph
      return (
        <p key={key} className="my-1.5 leading-relaxed text-zinc-900">
          {renderInlineTokens(pToken.tokens, pToken.text, isUser)}
        </p>
      )
    }

    case 'list': {
      const listToken = token as Tokens.List
      const ListTag = listToken.ordered ? 'ol' : 'ul'
      return (
        <ListTag
          key={key}
          className={`my-2 space-y-1.5 ${
            listToken.ordered ? 'list-decimal' : 'list-disc'
          } pl-5 text-zinc-900 leading-relaxed`}
          start={listToken.start || undefined}
        >
          {listToken.items.map((item, itemIdx) => (
            <li key={itemIdx} className="pl-0.5">
              {item.tokens && item.tokens.length > 0
                ? item.tokens.map((subToken, subIdx) =>
                    subToken.type === 'text'
                      ? renderInlineTokens((subToken as Tokens.Text).tokens, subToken.text, isUser)
                      : renderBlockToken(subToken, `${itemIdx}-${subIdx}`, isUser)
                  )
                : renderInlineTokens(item.tokens, item.text, isUser)}
            </li>
          ))}
        </ListTag>
      )
    }

    case 'code': {
      const codeToken = token as Tokens.Code
      return <CodeBlock key={key} code={codeToken.text} language={codeToken.lang} />
    }

    case 'blockquote': {
      const bqToken = token as Tokens.Blockquote
      return (
        <blockquote
          key={key}
          className="my-3 pl-3.5 py-0.5 border-l-2 border-zinc-400 bg-zinc-50/50 text-zinc-700 italic text-xs sm:text-sm rounded-r"
        >
          {bqToken.tokens
            ? bqToken.tokens.map((t, idx) => renderBlockToken(t, idx, isUser))
            : bqToken.text}
        </blockquote>
      )
    }

    case 'table': {
      const tableToken = token as Tokens.Table
      return (
        <div key={key} className="my-3 overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 font-semibold text-zinc-900">
                {tableToken.header.map((cell, cIdx) => (
                  <th key={cIdx} className="px-3 py-2">
                    {renderInlineTokens(cell.tokens, cell.text, isUser)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {tableToken.rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-zinc-50/70 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-zinc-800">
                      {renderInlineTokens(cell.tokens, cell.text, isUser)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case 'hr':
      return <hr key={key} className="my-3 border-zinc-200" />

    case 'space':
      return null

    default:
      if (token.text) {
        return (
          <div key={key} className="my-1">
            {token.text}
          </div>
        )
      }
      return null
  }
}

/**
 * Markdown Content Parser Component
 * Parses markdown text into formatted, interactive React elements with code copy,
 * clean bullet points, tables, and typography.
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, isUser = false }) => {
  if (isUser) {
    // For user prompts, preserve simple whitespace layout
    return <div className="whitespace-pre-wrap break-words">{content}</div>
  }

  // Parse markdown AST tokens using marked lexer
  let tokens: TokensListSafe
  try {
    tokens = marked.lexer(content)
  } catch {
    return <div className="whitespace-pre-wrap break-words">{content}</div>
  }

  return (
    <div className="chat-markdown-body space-y-1 text-xs sm:text-sm break-words leading-relaxed">
      {tokens.map((token, idx) => renderBlockToken(token, idx, isUser))}
    </div>
  )
}

type TokensListSafe = ReturnType<typeof marked.lexer>
