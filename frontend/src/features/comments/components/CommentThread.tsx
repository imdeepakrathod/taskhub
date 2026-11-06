import { useRef, useState } from 'react'
import type { Member } from '../../members/types'
import { useCommentMutations } from '../hooks/useCommentMutations'
import { useComments } from '../hooks/useComments'
import { MarkdownComment } from './MarkdownComment'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`

  return `${Math.floor(seconds / 86400)}d ago`
}

type CommentThreadProps = {
  taskId: string
  currentUserId: string
  members?: Member[]
}

export function CommentThread({ taskId, currentUserId, members = [] }: CommentThreadProps) {
  const { data: comments = [], isLoading } = useComments(taskId)
  const { addComment, isAdding, removeComment } = useCommentMutations(taskId)
  const [newComment, setNewComment] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ── Mentions State ──────────────────────────────────────
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredMembers =
    mentionQuery !== null
      ? members.filter((m) => m.user.name.toLowerCase().includes(mentionQuery.toLowerCase()))
      : []

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    const cursor = e.target.selectionStart
    setNewComment(val)

    // Check if the user just typed '@' or is typing a mention
    const textBeforeCursor = val.slice(0, cursor)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' '
      // Make sure '@' is preceded by a space or is at start of line
      if (charBeforeAt === ' ' || charBeforeAt === '\n') {
        const query = textBeforeCursor.slice(atIndex + 1)
        // If no spaces after '@' or just letters, treat as active mention search
        if (!query.includes('\n')) {
          setMentionQuery(query)
          setMentionIndex(atIndex)
          setSelectedIndex(0)
          return
        }
      }
    }

    setMentionQuery(null)
  }

  const insertMention = (member: Member) => {
    if (mentionIndex === -1) return
    const before = newComment.slice(0, mentionIndex)
    const after = newComment.slice(mentionIndex + (mentionQuery?.length ?? 0) + 1)
    const updated = `${before}@${member.user.name} ${after}`
    setNewComment(updated)
    setMentionQuery(null)

    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus()
      const newCursor = before.length + member.user.name.length + 2
      inputRef.current?.setSelectionRange(newCursor, newCursor)
    }, 10)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Mentions dropdown navigation
    if (mentionQuery !== null && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredMembers.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(filteredMembers[selectedIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setMentionQuery(null)
        return
      }
    }

    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void handleSubmit(e)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newComment.trim()

    if (!trimmed) return

    try {
      await addComment(trimmed)
      setNewComment('')
      setMentionQuery(null)
    } catch {
      // Handled by React Query
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          Comments
          {comments.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">({comments.length})</span>
          )}
        </h3>
        <span className="text-[10px] text-gray-400">Markdown & @mentions supported</span>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {isLoading && <p className="text-xs text-gray-400">Loading comments...</p>}

        {!isLoading && comments.length === 0 && (
          <p className="text-xs text-gray-400 italic">No comments yet. Start the conversation!</p>
        )}

        {comments.map((comment) => {
          const isAuthor = comment.author.id === currentUserId

          return (
            <div key={comment.id} className="group flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 mt-0.5">
                {getInitials(comment.author.name)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-800">{comment.author.name}</span>
                  <span className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</span>

                  {isAuthor && (
                    <button
                      onClick={() => void removeComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 hover:text-red-500 transition ml-auto cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="mt-1">
                  <MarkdownComment content={comment.content} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Comment Input with Mention Dropdown */}
      <form onSubmit={handleSubmit} className="relative border-t border-gray-100 pt-3">
        {/* Mentions Autocomplete Popover */}
        {mentionQuery !== null && filteredMembers.length > 0 && (
          <div className="absolute bottom-full mb-2 left-0 w-64 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl z-50 py-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
              Mention Member
            </div>
            {filteredMembers.map((member, index) => (
              <div
                key={member.user.id}
                onMouseDown={(e) => {
                  e.preventDefault()
                  insertMention(member)
                }}
                className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs transition ${
                  index === selectedIndex ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-600">
                  {getInitials(member.user.name)}
                </div>
                <div className="truncate">
                  <span className="font-medium text-gray-900">{member.user.name}</span>
                  <span className="text-gray-400 text-[10px] ml-1.5">@{member.user.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={inputRef}
          value={newComment}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Write a comment with Markdown or @mention someone..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-gray-400">
            Tip: Type <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">@</code> to
            mention, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">**bold**</code>
            , <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">`code`</code>
          </span>
          <button
            type="submit"
            disabled={isAdding || !newComment.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition cursor-pointer"
          >
            {isAdding ? 'Sending...' : 'Comment'}
          </button>
        </div>
      </form>
    </div>
  )
}
