import { marked } from 'marked'

// Configure marked for security and clean single-line breaks
marked.setOptions({
  breaks: true,
  gfm: true,
})

type MarkdownCommentProps = {
  content: string
}

export function MarkdownComment({ content }: MarkdownCommentProps) {
  // Matches "@First Last" or "@Username" with up to two words
  const formattedContent = content.replace(
    /@([A-Za-z0-9_]+(?:\s[A-Za-z0-9_]+)?)(?=[.,!?]|\s|$)/g,
    `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">@$1</span>`,
  )

  const html = marked.parse(formattedContent) as string

  return (
    <div
      className="prose prose-sm max-w-none text-xs sm:text-sm text-gray-800 leading-relaxed break-words [&>p]:mb-1.5 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-indigo-600 [&>code]:font-mono [&>code]:text-xs"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
