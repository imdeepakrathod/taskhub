import { useTheme } from '../../context/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition shadow-2xs cursor-pointer"
    >
      <span className="text-base">{theme === 'light' ? '🌙' : '☀️'}</span>
    </button>
  )
}
