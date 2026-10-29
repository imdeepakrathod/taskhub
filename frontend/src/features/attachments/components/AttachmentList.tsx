import { useRef, useState } from 'react'

import { useAttachmentMutations } from '../hooks/useAttachmentMutations'
import { useAttachments } from '../hooks/useAttachments'
import type { Attachment } from '../types'
import { formatFileSize, getFileCategory } from '../utils/fileUtils'

type AttachmentListProps = {
  taskId: string
  currentUserId: string
  isOwnerOrAdmin?: boolean
}

export function AttachmentList({
  taskId,
  currentUserId,
  isOwnerOrAdmin = false,
}: AttachmentListProps) {
  const { data: attachments = [], isLoading } = useAttachments(taskId)
  const { upload, isUploading, remove } = useAttachmentMutations(taskId)

  const [isDragging, setIsDragging] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setErrorMessage(null)

    const file = files[0]
    // 10MB size limit check
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit.')
      return
    }

    try {
      await upload(file)
    } catch {
      setErrorMessage('Failed to upload file. Please try again.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
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
    void handleFiles(e.dataTransfer.files)
  }

  const handleDelete = async (attachment: Attachment) => {
    if (window.confirm(`Delete "${attachment.fileName}"?`)) {
      try {
        await remove(attachment.id)
      } catch {
        alert('Failed to delete attachment')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Attachments ({attachments.length})
        </h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 cursor-pointer"
        >
          {isUploading ? 'Uploading...' : '+ Upload File'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/60'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
        }`}
      >
        <div className="text-gray-400 mb-1 text-xl">📎</div>
        <p className="text-xs text-gray-600 font-medium">
          Drag and drop files here, or <span className="text-indigo-600">browse</span>
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">Images, PDFs, docs up to 10MB</p>
      </div>

      {errorMessage && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
          {errorMessage}
        </p>
      )}

      {/* Attachments Grid / List */}
      {isLoading ? (
        <p className="text-xs text-gray-400">Loading attachments...</p>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No attachments yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((att) => {
            const category = getFileCategory(att.mimeType)
            const canDelete = isOwnerOrAdmin || att.uploader.id === currentUserId

            return (
              <div
                key={att.id}
                className="group relative flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5 shadow-2xs hover:shadow-sm transition"
              >
                {/* Thumbnail Preview or Icon */}
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100 border border-gray-200">
                  {category === 'image' ? (
                    <img
                      src={att.fileUrl}
                      alt={att.fileName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-lg">
                      {category === 'pdf'
                        ? '📄'
                        : category === 'doc'
                          ? '📝'
                          : category === 'sheet'
                            ? '📊'
                            : category === 'zip'
                              ? '📦'
                              : '📁'}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={att.fileName}
                    className="block text-xs font-semibold text-gray-900 truncate hover:text-indigo-600"
                  >
                    {att.fileName}
                  </a>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                    <span>{formatFileSize(att.fileSize)}</span>
                    <span>•</span>
                    <span className="truncate">{att.uploader.name}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    download={att.fileName}
                    rel="noopener noreferrer"
                    title="Download file"
                    className="rounded p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-100"
                  >
                    ⬇
                  </a>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(att)}
                      title="Delete attachment"
                      className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
