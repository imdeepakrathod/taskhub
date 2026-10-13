type LabelBadgeProps = {
  name: string
  color: string
  onRemove?: () => void
}

export function LabelBadge({ name, color, onRemove }: LabelBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 hover:opacity-70 text-xs leading-none"
        >
          ✕
        </button>
      )}
    </span>
  )
}
