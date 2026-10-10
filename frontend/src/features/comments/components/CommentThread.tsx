import { useRef, useState } from 'react'

import { useComments } from '../hooks/useComments'
import { useCommentMutations } from '../hooks/useCommentMutations'

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
}

export function CommentThread({ taskId, currentUserId }: CommentThreadProps) {
  const { data: comments = [], isLoading } = useComments(taskId)
  const { addComment, isAdding, removeComment } = useCommentMutations(taskId)
  const [newComment, setNewComment] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newComment.trim()

    if (!trimmed) return

    try {
      await addComment(trimmed)
      setNewComment('')
    } catch {
      // Error handled by React Query
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      void handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        Comments
        {comments.length > 0 && (
          <span className="ml-2 text-xs font-normal text-gray-400">({comments.length})</span>
        )}
      </h3>

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
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 hover:text-red-500 transition ml-auto"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mt-0.5">
                  {comment.content}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-3">
        <textarea
          ref={inputRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder="Write a comment... (Ctrl+Enter to send)"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isAdding || !newComment.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition"
          >
            {isAdding ? 'Sending...' : 'Comment'}
          </button>
        </div>
      </form>
    </div>
  )
}
