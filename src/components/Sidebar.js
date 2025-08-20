'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PanelRightOpen, PanelRightClose,
  LayoutGrid,
  Users,
  FileUser,
  BookUserIcon,
  Warehouse,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const sidebarItems = [
  { name: 'Dashboard', icon: <LayoutGrid size={20} />, key: 'dashboard' },
  { name: 'Attendance', icon: <Users size={20} />, key: 'attendance' },
  { name: 'Leave Application', icon: <FileUser size={20} />, key: 'leave' },
  /*{ name: 'Staff Directory', icon: <BookUserIcon size={20} />, key: 'directory' },*/
  { name: 'Supplies Inventory', icon: <Warehouse size={20} />, key: 'inventory' },
]

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 64 : 240 }}
      className="overflow-hidden flex flex-col h-screen"
      data-theme="black"
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              className="text-lg font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
            </motion.span>
          )}
        </AnimatePresence>
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="mt-4 space-y-2 flex-1 px-2">
        {sidebarItems.map(({ name, icon, key }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center h-12 px-4 w-full text-left rounded-md transition-colors ${
              activeTab === key ? 'bg-base-200 font-semibold' : 'hover:bg-base-200'
            }`}
          >
            <span className="mr-3">{icon}</span>
            <motion.span
              initial={false}
              animate={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : 'auto',
                overflow: 'hidden',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="text-sm whitespace-nowrap"
            >
              {name}
            </motion.span>
          </button>
        ))}
      </nav>

      {/* Footer - Theme Toggle */}
      <div className="ml-2 px-4 py-4 mt-auto">
        <ThemeToggle />
      </div>
    </motion.aside>
  )
}
