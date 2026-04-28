'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, FolderOpen, Settings, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { href: '/projects', icon: FolderOpen, label: '프로젝트' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <aside className="w-16 h-screen bg-card border-r border-border flex flex-col items-center py-4 gap-2 fixed left-0 top-0 z-50">
      <Link href="/dashboard" className="mb-4">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xs font-bold">
          P
        </div>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                title={label}
              >
                <Icon size={18} />
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        title="테마 전환"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </aside>
  )
}
