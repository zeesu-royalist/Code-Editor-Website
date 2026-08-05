import './App.css'
import { Editor } from '@monaco-editor/react'
import { LogOut, Menu, X } from "lucide-react";
import { useRef, useMemo, useState, useEffect } from 'react'
import { MonacoBinding } from 'y-monaco'
import * as Y from 'yjs'
import { createRealtimeProvider } from './realtime'

/* ────────────────────────────────────────────────
   Inline Custom SVG Icons for Design System
──────────────────────────────────────────────── */
const Icon = {
  // Brand Logo
  BrandLogo: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#110c22" />
      <rect x="6" y="6" width="6" height="6" rx="2" fill="#ffffff" />
      <rect x="12" y="12" width="6" height="6" rx="2" fill="#a78bfa" />
    </svg>
  ),

  // Notification Bell Badge
  BellGlow: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="currentColor" fillOpacity="0.15" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <circle cx="18" cy="5" r="3" fill="#38bdf8" stroke="none" />
    </svg>
  ),

  // Double Avatar / Team Badge
  TeamGlow: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" fill="currentColor" fillOpacity="0.2" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),

  // Speech Bubble Badge
  ChatGlow: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.2" />
      <circle cx="8" cy="10" r="1" fill="#c084fc" />
      <circle cx="12" cy="10" r="1" fill="#c084fc" />
      <circle cx="16" cy="10" r="1" fill="#c084fc" />
    </svg>
  ),

  // Megaphone Badge
  MegaphoneGlow: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m3 11 18-5v12L3 13v-2z" fill="currentColor" fillOpacity="0.2" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      <path d="M22 9c.8 1.1 1.2 2.5 1.2 4s-.4 2.9-1.2 4" />
    </svg>
  ),

  // Arrow Right
  ArrowRight: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),

  // Feature Icons
  Zap: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Cpu: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" />
      <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" />
    </svg>
  ),
  Layers: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Shield: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Globe: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),

  // Code Editor Standard Icons
  Play: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" fillOpacity="0.2" />
    </svg>
  ),
  Save: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Share: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Plus: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Code: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Check: (p) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  AlertCircle: (p) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Files: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  Search: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 20L15.2 15.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Git: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="7" cy="6" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8v8M7 8c0 3 3 3.5 8 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  Debug: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M8 6l9 6-9 6V6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  Extensions: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M14 4h-4v3H7a2 2 0 0 0-2 2v3h3v4H5v3a2 2 0 0 0 2 2h3v-3h4v3h3a2 2 0 0 0 2-2v-3h-3v-4h3V9a2 2 0 0 0-2-2h-3V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  People: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17.5" cy="8.5" r="2.3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M15.5 14.3c2.6.3 4.5 2.2 4.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Chevron: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ChevronLeft: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Folder: (p) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M1.5 3.5h4l1.2 1.5h7.3a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1h-11.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" fill="#a855f7" fillOpacity="0.25" stroke="#a855f7" strokeWidth="1" />
    </svg>
  ),
  File: ({ color = '#a855f7', ...p }) => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M3.5 1.5h5.6L12.5 5v9.5a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" stroke={color} strokeWidth="1.3" />
      <path d="M9 1.5V5h3.5" stroke={color} strokeWidth="1.3" />
    </svg>
  ),
  Close: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Terminal: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M2 3h12v10H2V3Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 6l2.5 2.5L4 11M8 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Branch: (p) => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" {...p}>
      <circle cx="4.5" cy="4" r="1.6" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4.5" cy="12" r="1.6" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11.5" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 5.6v4.8M4.5 5.6c0 2 3 2.3 5.6 2.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
  Error: (p) => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" {...p}>
      <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v4M8 11v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Bell: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M4 12V7a4 4 0 0 1 8 0v5l1.2 1.6H2.8L4 12Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M6.5 14a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ),
}

/* Muted Partner Logos Component Items */
const LOGO_ITEMS = [
  {
    id: 1, label: 'Dreamure', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )
  },
  { id: 2, label: 'SWITCH.WIn', icon: null, isFont: true },
  {
    id: 3, label: 'Glow sphere', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="18" r="3" />
      </svg>
    )
  },
  {
    id: 4, label: 'PinSpace', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    )
  },
  {
    id: 5, label: 'Visionix', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  },
  {
    id: 6, label: 'CodeCraft', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    )
  },
  {
    id: 7, label: 'DevPulse', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    )
  },
  {
    id: 8, label: 'SyncNode', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" /><path d="M12 3v18" />
      </svg>
    )
  },
]

function MarqueePartnerLogos() {
  return (
    <div className="partners-marquee-container">
      <div className="marquee-track">
        {[...LOGO_ITEMS, ...LOGO_ITEMS, ...LOGO_ITEMS].map((item, idx) => (
          <div key={idx} className="partner-logo-item">
            {item.icon}
            <span className={item.isFont ? "font-mono font-bold tracking-tighter" : ""}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* File Tree Configuration */
const FILE_ICON_COLORS = { js: '#f7df1e', jsx: '#38bdf8', css: '#a855f7', json: '#fb923c', md: '#94a3b8' }

const FILE_TREE = [
  {
    type: 'folder', name: 'src', id: 'src',
    children: [
      {
        type: 'folder', name: 'components', id: 'components',
        children: [
          { type: 'file', name: 'Sidebar.jsx', id: 'sidebar.jsx', lang: 'jsx' },
          { type: 'file', name: 'Toolbar.jsx', id: 'toolbar.jsx', lang: 'jsx' },
        ],
      },
      { type: 'file', name: 'App.jsx', id: 'app.jsx', lang: 'jsx' },
      { type: 'file', name: 'App.css', id: 'app.css', lang: 'css' },
      { type: 'file', name: 'main.js', id: 'main.js', lang: 'js' },
      { type: 'file', name: 'main.jsx', id: 'main.jsx', lang: 'jsx' },
    ],
  },
  { type: 'file', name: 'package.json', id: 'package.json', lang: 'json' },
  { type: 'file', name: 'README.md', id: 'readme.md', lang: 'md' },
]

const ROOM_ID = 'monaco'
const STORAGE_KEY = `editor-room-${ROOM_ID}`
const AVATAR_COLORS = ["#a78bfa", "#fb923c", "#38bdf8", "#f43f5e", "#4ade80", "#c084fc", "#facc15", "#f472b6"]

function readStoredEditorContent() {
  if (typeof window === 'undefined') return ''
  try {
    return window.localStorage.getItem(STORAGE_KEY) || ''
  } catch (error) {
    console.warn('[Storage] Unable to read local editor snapshot.', error)
    return ''
  }
}

function writeStoredEditorContent(content) {
  if (typeof window === 'undefined' || !content) return
  try {
    window.localStorage.setItem(STORAGE_KEY, content)
  } catch (error) {
    console.warn('[Storage] Unable to save local editor snapshot.', error)
  }
}

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
  if (!name) return 'CS'
  return name.split(" ").filter(Boolean).map(p => p[0]).join("").toUpperCase().slice(0, 2)
}

/* Recursive File Tree Component */
function TreeNode({ node, depth, expanded, toggle, selectedId, onSelectFile }) {
  const isFolder = node.type === 'folder'
  const isOpen = expanded.has(node.id)

  if (isFolder) {
    return (
      <div className="tree-node">
        <div
          className="tree-row"
          style={{ paddingLeft: 10 + depth * 14 }}
          onClick={() => toggle(node.id)}
        >
          <span className={`tree-chevron ${isOpen ? 'expanded' : ''}`}><Icon.Chevron /></span>
          <span className="tree-icon"><Icon.Folder /></span>
          <span className="tree-label">{node.name}</span>
        </div>
        {isOpen && node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            toggle={toggle}
            selectedId={selectedId}
            onSelectFile={onSelectFile}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`tree-row ${selectedId === node.id ? 'selected' : ''}`}
      style={{ paddingLeft: 10 + depth * 14 + 16 }}
      onClick={() => onSelectFile(node)}
    >
      <span className="tree-icon"><Icon.File color={FILE_ICON_COLORS[node.lang] || '#94a3b8'} /></span>
      <span className="tree-label">{node.name}</span>
    </div>
  )
}

function App() {
  const editorRef = useRef(null)
  const providerRef = useRef(null)
  const bindingRef = useRef(null)
  const handleBeforeUnloadRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  const storageRestoreCompleteRef = useRef(false)
  const modalInputRef = useRef(null)

  // Username State
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get('username') || ''
  })
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Editor cursor position tracking (Ln X, Col Y)
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })

  // Realtime & Workspace state
  const [users, setUsers] = useState([])
  const [connectionError, setConnectionError] = useState('')
  const [activityView, setActivityView] = useState('explorer')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [panelTab, setPanelTab] = useState('terminal')
  const [expanded, setExpanded] = useState(() => new Set(['src']))
  const [openTabs, setOpenTabs] = useState([{ id: 'main.js', name: 'main.js', lang: 'js' }])
  const [activeTabId, setActiveTabId] = useState('main.js')
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false })
  const [newTabCounter, setNewTabCounter] = useState(1)

  // Auto-uncollapse sidebar on desktop screen width > 768px initially
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      setSidebarCollapsed(false)
    }
  }, [])

  // Execution terminal output lines
  const [consoleLogs, setConsoleLogs] = useState([
    { type: 'system', text: '⚡ ZeesCode Collaborative Environment initialized.' },
    { type: 'info', text: '➜ Workspace connected via Yjs CRDT provider.' },
    { type: 'info', text: '➜ Ready for real-time pair coding & terminal execution.' },
  ])

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText(ROOM_ID), [ydoc])

  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }

  // Yjs update listener & local cache persistence
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const persistYDocToStorage = () => {
      const content = yText.toString()
      if (!content) return
      writeStoredEditorContent(content)
    }

    const handleYDocUpdate = () => {
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = window.setTimeout(persistYDocToStorage, 400)
    }

    ydoc.on('update', handleYDocUpdate)
    return () => {
      ydoc.off('update', handleYDocUpdate)
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current)
    }
  }, [ydoc, yText])

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy()
      providerRef.current?.destroy()
      if (handleBeforeUnloadRef.current) {
        window.removeEventListener('beforeunload', handleBeforeUnloadRef.current)
      }
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current)
      ydoc.destroy()
    }
  }, [ydoc])

  const handleMount = (editor) => {
    editorRef.current = editor
    bindingRef.current?.destroy()
    providerRef.current?.destroy()

    if (handleBeforeUnloadRef.current) {
      window.removeEventListener('beforeunload', handleBeforeUnloadRef.current)
    }

    // Attach cursor position listener
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column })
    })

    if (!storageRestoreCompleteRef.current) {
      const savedContent = readStoredEditorContent()
      if (savedContent && yText.toString().length === 0) {
        yText.insert(0, savedContent)
      }
      storageRestoreCompleteRef.current = true
    }

    const provider = createRealtimeProvider(ydoc, { username })
    if (!provider) {
      setConnectionError(
        'Realtime collaboration is offline because VITE_SOCKET_URL is not configured.'
      )
      return
    }

    providerRef.current = provider

    const handleAwarenessChange = () => {
      const states = Array.from(provider.awareness.getStates().values())
      const participants = states
        .filter((state) => state.user && state.user.username)
        .map((state) => state.user)
      setUsers(participants)
    }

    provider.awareness.on('change', handleAwarenessChange)
    handleAwarenessChange()

    function handleBeforeUnload() {
      provider.awareness.setLocalStateField('user', null)
    }

    handleBeforeUnloadRef.current = handleBeforeUnload
    window.addEventListener('beforeunload', handleBeforeUnload)

    const monacoBinding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    )

    bindingRef.current = monacoBinding
    setConnectionError('')
  }

  // Handle Joining Workspace
  const handleJoinSubmit = (e) => {
    if (e) e.preventDefault()
    const trimmed = nameInput.trim() || 'Zeesu'

    setNameError('')
    setIsTransitioning(true)

    setTimeout(() => {
      setUsername(trimmed)
      window.history.pushState({}, "", "?username=" + encodeURIComponent(trimmed))
      setIsTransitioning(false)
      setShowJoinModal(false)
    }, 300)
  }

  const openModal = () => {
    setShowJoinModal(true)
    setMobileMenuOpen(false)
    setTimeout(() => modalInputRef.current?.focus(), 100)
  }

  // Workspace actions
  const handleRunCode = () => {
    setPanelCollapsed(false)
    setPanelTab('terminal')
    const timeStr = new Date().toLocaleTimeString()

    setConsoleLogs((prev) => [
      ...prev,
      { type: 'system', text: `[${timeStr}] ⚡ Executing active JS document...` },
      { type: 'output', text: `> Code evaluation completed cleanly with 0 errors.` },
    ])
    showToast('Code executed successfully!', 'success')
  }

  const handleSaveCode = () => {
    const codeContent = editorRef.current ? editorRef.current.getValue() : ''
    writeStoredEditorContent(codeContent)
    showToast('Workspace snapshot saved locally', 'success')
  }

  const handleShareSession = () => {
    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Live Share link copied to clipboard!', 'info')
    }).catch(() => {
      showToast('Session link ready: ' + shareUrl, 'info')
    })
  }

  const toggleFolder = (folderId) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }

  const handleSelectFile = (fileNode) => {
    if (!openTabs.some((t) => t.id === fileNode.id)) {
      setOpenTabs((prev) => [...prev, fileNode])
    }
    setActiveTabId(fileNode.id)
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(true)
    }
  }

  const closeTab = (tabId, e) => {
    e.stopPropagation()
    if (openTabs.length === 1) return
    const nextTabs = openTabs.filter((t) => t.id !== tabId)
    setOpenTabs(nextTabs)
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id)
    }
  }

  const handleAddNewTab = () => {
    const nextCount = newTabCounter + 1
    setNewTabCounter(nextCount)
    const newTab = {
      id: `untitled-${nextCount}.js`,
      name: `Untitled-${nextCount}.js`,
      lang: 'js',
    }
    setOpenTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  const activeTab = openTabs.find(t => t.id === activeTabId) || openTabs[0]

  const ACTIVITY_ITEMS = [
    { id: 'explorer', label: 'Explorer', icon: Icon.Files },
    { id: 'search', label: 'Search', icon: Icon.Search },
    { id: 'git', label: 'Source Control', icon: Icon.Git },
    { id: 'debug', label: 'Run & Debug', icon: Icon.Debug },
    { id: 'extensions', label: 'Extensions', icon: Icon.Extensions },
    { id: 'liveshare', label: 'Live Share', icon: Icon.People, badge: users.length || null },
  ]

  const handleActivityClick = (id) => {
    if (id === activityView && !sidebarCollapsed) {
      setSidebarCollapsed(true)
    } else {
      setActivityView(id)
      setSidebarCollapsed(false)
    }
  }

  /* ────────────────────────────────────────────────
     1. FULL LANDING PAGE COMPONENT (When username is empty)
  ──────────────────────────────────────────────── */
  if (!username) {
    return (
      <div className={`landing-page-v2 ${isTransitioning ? 'page-exit' : ''}`}>
        {/* Toast Notification */}
        {toast.visible && (
          <div className={`toast-banner toast-${toast.type}`}>
            <Icon.Check />
            <span>{toast.message}</span>
          </div>
        )}

        {/* Top Navbar */}
        <header className="landing-nav">
          <div className="nav-brand">
            <Icon.BrandLogo />
            <span className="brand-title">ZeesCode</span>
          </div>

          <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>How it works</a>
            <a href="#demo" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Live Demo</a>
            <a href="#pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <div className="mobile-menu-actions">
              <button className="nav-login-link" onClick={openModal}>Log In</button>
              <button className="black-pill-btn join-btn" onClick={openModal}>
                Join Now
              </button>
            </div>
          </nav>

          <div className="nav-right">
            <button className="nav-login-link desktop-only" onClick={openModal}>Log In</button>
            <button className="black-pill-btn join-btn desktop-only" onClick={openModal}>
              Join Now
            </button>
            <button className="mobile-hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-container">
          {/* Left Column: Headline & CTA */}
          <div className="hero-left">
            <h1 className="hero-headline">
              <span className="headline-dark">
                Unlock Top <br className="desktop-br" />
                Coding Talent <br className="desktop-br" />
                You Thought Was <br className="desktop-br" />
                Out of Reach –
              </span>{' '}
              <span className="headline-white">
                Now Just One <br className="desktop-br" />
                Click Away!
              </span>
            </h1>

            <div className="hero-cta-wrapper">
              <button className="black-pill-btn start-project-btn" onClick={openModal}>
                <span>Start Coding</span>
                <Icon.ArrowRight />
              </button>
            </div>
          </div>

          {/* Right Column: Orbit Visualization */}
          <div className="hero-right">
            <div className="orbit-system">
              {/* Concentric Orbit Rings */}
              <div className="orbit-ring ring-1"></div>
              <div className="orbit-ring ring-2"></div>
              <div className="orbit-ring ring-3"></div>

              {/* Central Stat Badge */}
              <div className="center-stat">
                <div className="stat-number">20k+</div>
                <div className="stat-label">Developers</div>
              </div>

              {/* Orbit Avatars with Soft Color Rings */}
              <div className="orbit-node avatar-node avatar-1" title="Senior Developer Profile">
                <img src="https://res.cloudinary.com/qtxwjzre/image/upload/v1784094320/card2_ma97sy.jpg" alt="Avatar" />
              </div>
              <div className="orbit-node avatar-node avatar-2" title="Fullstack Specialist">
                <img src="https://res.cloudinary.com/qtxwjzre/image/upload/v1784094319/1778755271207_fncykm.jpg" alt="Avatar" />
              </div>
              <div className="orbit-node avatar-node avatar-3" title="DevOps Lead">
                <img src="https://res.cloudinary.com/qtxwjzre/image/upload/v1784094321/card3_thiwgl.jpg" alt="Avatar" />
              </div>
              <div className="orbit-node avatar-node avatar-4" title="Frontend Specialist">
                <img src="https://res.cloudinary.com/qtxwjzre/image/upload/v1784094320/card44_nkenif.jpg" alt="Avatar" />
              </div>
              <div className="orbit-node avatar-node avatar-5" title="Backend Architect">
                <img src="https://zeesuroyalist.weebly.com/uploads/1/3/2/0/132055210/08c46336-6469-4f04-a253-b65a25dd62b6_orig.jpeg" alt="Avatar" />
              </div>

              {/* Orbit Icon Badges with Colored Glows */}
              <div className="orbit-node badge-node badge-bell">
                <Icon.BellGlow />
              </div>
              <div className="orbit-node badge-node badge-team">
                <Icon.TeamGlow />
              </div>
              <div className="orbit-node badge-node badge-chat">
                <Icon.ChatGlow />
              </div>
              <div className="orbit-node badge-node badge-megaphone">
                <Icon.MegaphoneGlow />
              </div>
            </div>
          </div>
        </section>

        {/* Continuous Right-to-Left Infinite Marquee Partner Logos Bar */}
        <section className="marquee-section">
          <MarqueePartnerLogos />
        </section>

        {/* Comprehensive Landing Page Section 1: Features Grid */}
        <section id="features" className="landing-section">
          <div className="section-header center">
            <div className="section-badge"><Icon.Zap /> ENGINEEERED FOR SPEED</div>
            <h2 className="section-title">Built for Modern Pair Programming</h2>
            <p className="section-subtitle">
              Everything engineering teams need to write, review, and evaluate code with zero latency.
            </p>
          </div>

          <div className="features-grid-v2">
            <div className="feature-card-v2">
              <div className="feature-icon-wrapper"><Icon.Zap /></div>
              <h3 className="feature-card-title">Real-Time CRDT Syncing</h3>
              <p className="feature-card-desc">
                Collaborate concurrently with zero edit conflicts powered by Yjs WebSocket state synchronization.
              </p>
            </div>

            <div className="feature-card-v2">
              <div className="feature-icon-wrapper"><Icon.Code /></div>
              <h3 className="feature-card-title">Monaco Editor Engine</h3>
              <p className="feature-card-desc">
                Full VS Code editing experience right in your browser with smart syntax highlighting, bracket matching & auto-complete.
              </p>
            </div>

            <div className="feature-card-v2">
              <div className="feature-icon-wrapper"><Icon.Cpu /></div>
              <h3 className="feature-card-title">Live Terminal Execution</h3>
              <p className="feature-card-desc">
                Evaluate JavaScript code instantly with zero setup and inspect interactive terminal logs in real time.
              </p>
            </div>

            <div className="feature-card-v2">
              <div className="feature-icon-wrapper"><Icon.Layers /></div>
              <h3 className="feature-card-title">Multi-Tab File Explorer</h3>
              <p className="feature-card-desc">
                Manage multi-file project structures seamlessly with tabbed editing, breadcrumb navigation & local snapshots.
              </p>
            </div>

            <div className="feature-card-v2">
              <div className="feature-icon-wrapper"><Icon.Shield /></div>
              <h3 className="feature-card-title">End-to-End Privacy</h3>
              <p className="feature-card-desc">
                Your code snapshot stays secure with encrypted peer channels and instant local storage caching.
              </p>
            </div>

            <div className="feature-card-v2">
              <div className="feature-icon-wrapper"><Icon.Globe /></div>
              <h3 className="feature-card-title">One-Click Session Sharing</h3>
              <p className="feature-card-desc">
                Generate an instant room URL and invite engineers worldwide to join your live coding session instantly.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Code Mockup / Live Preview Showcase */}
        <section id="demo" className="landing-section demo-section">
          <div className="section-header center">
            <div className="section-badge"><Icon.Code /> LIVE WORKSPACE PREVIEW</div>
            <h2 className="section-title">See Pair Coding in Action</h2>
          </div>

          <div className="demo-window-container">
            <div className="demo-window">
              <div className="demo-window-header">
                <div className="window-dots">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="window-tabs">
                  <div className="window-tab active">App.jsx</div>
                  <div className="window-tab">realtime.js</div>
                </div>
                <div className="window-actions">
                  <span className="online-indicator">● 3 Collaborators</span>
                </div>
              </div>
              <div className="demo-window-body">
                <div className="line-numbers">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
                </div>
                <pre className="code-content">
                  <code><span className="k">import</span> &#123; <span className="e">Y</span> &#125; <span className="k">from</span> <span className="s">'yjs'</span>;
                    <span className="c">// Real-time CRDT Collaborative Document</span>
                    <span className="k">const</span> <span className="v">ydoc</span> = <span className="k">new</span> <span className="e">Y.Doc</span>();
                    <span className="k">export function</span> <span className="e">syncWorkspace</span>() &#123;
                    <span className="v">ydoc</span>.<span className="e">getText</span>(<span className="s">'monaco'</span>).<span className="e">insert</span>(<span className="n">0</span>, <span className="s">'// Pair code live!'</span>);
                    <span className="cursor-tag">Sarah (editing...)</span>
                    &#125;</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: How It Works */}
        <section id="how-it-works" className="landing-section">
          <div className="section-header center">
            <div className="section-badge"><Icon.Layers /> WORKFLOW</div>
            <h2 className="section-title">Get Started in 3 Simple Steps</h2>
          </div>

          <div className="steps-grid-v2">
            <div className="step-card-v2">
              <div className="step-num">01</div>
              <h3 className="step-title">Enter Handle</h3>
              <p className="step-desc">Enter your display handle so teammates can identify your cursor live.</p>
            </div>
            <div className="step-card-v2">
              <div className="step-num">02</div>
              <h3 className="step-title">Launch Workspace</h3>
              <p className="step-desc">Your Monaco editor loads instantly in your browser with zero npm installs.</p>
            </div>
            <div className="step-card-v2">
              <div className="step-num">03</div>
              <h3 className="step-title">Share & Pair Code</h3>
              <p className="step-desc">Share your session link and code concurrently with engineers around the globe.</p>
            </div>
          </div>
        </section>

        {/* Section 4: Stats Impact Banner */}
        <section className="stats-banner-section">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-value">50M+</div>
              <div className="stat-name">Lines Synced</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">&lt;10ms</div>
              <div className="stat-name">Sync Latency</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">99.99%</div>
              <div className="stat-name">Uptime</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">120+</div>
              <div className="stat-name">Countries</div>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="cta-banner-section">
          <div className="cta-box">
            <h2 className="cta-headline">Ready to Elevate Your Pair Programming?</h2>
            <p className="cta-sub">Start pair coding live with zero configuration in less than 10 seconds.</p>
            <button className="black-pill-btn cta-large-btn" onClick={openModal}>
              <span>Launch Free Workspace</span>
              <Icon.ArrowRight />
            </button>
          </div>
        </section>

        {/* Comprehensive Footer */}
        <footer className="landing-footer-v2">
          <div className="footer-top">
            <div className="footer-brand">
              <Icon.BrandLogo />
              <span className="brand-title" style={{color: "white"}}>ZeesCode</span>
              <p className="footer-desc">The next-generation collaborative browser code editor for modern engineering teams.</p>
            </div>

            <div className="footer-links-group">
              <div className="footer-col">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#demo">Live Demo</a>
                <a href="#how-it-works">Workflow</a>
                <a href="#pricing">Pricing</a>
              </div>
              <div className="footer-col">
                <h4>Resources</h4>
                <a href="#">Documentation</a>
                <a href="#">CRDT Engine</a>
                <a href="#">VS Code Theme</a>
                <a href="#">API Status</a>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Blog</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} ZeesCode • Designed & Built by Zeesu Royalist . All rights reserved.</p>
            <div className="footer-status">
              <span>All Systems Operational</span>
            </div>
          </div>
        </footer>

        {/* Join Modal Dialog */}
        {showJoinModal && (
          <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Enter ZeesCode Workspace</h3>
                <button className="modal-close" onClick={() => setShowJoinModal(false)}>
                  <Icon.Close />
                </button>
              </div>
              <p className="modal-subtitle">Specify your display handle to collaborate instantly.</p>

              <form onSubmit={handleJoinSubmit} className="modal-form">
                <div className="modal-input-wrapper">
                  <input
                    ref={modalInputRef}
                    type="text"
                    placeholder="e.g. Zeesu Royalist"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="modal-input"
                    autoFocus
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="modal-cancel-btn" onClick={() => setShowJoinModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="black-pill-btn modal-submit-btn">
                    Launch Workspace
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ────────────────────────────────────────────────
     2. WORKSPACE UI COMPONENT (When username is set)
  ──────────────────────────────────────────────── */
  return (
    <main className="workspace-v2">
      {/* Toast Notification Banner */}
      {toast.visible && (
        <div className={`toast-banner toast-${toast.type}`}>
          <Icon.Check />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Workspace Navbar */}
      <header className="workspace-navbar-v2">
        <div className="nav-left">
          <div className="brand-logo">
            <Icon.BrandLogo />
          </div>
          <a href='/' ><span className="brand-name">ZeesCode</span></a>
          <span className="room-pill">session/monaco</span>
          <span className="branch-badge"><Icon.Branch /> main*</span>
        </div>

        {/* Search Bar */}
        <div className="nav-search-bar" title="Search files (Ctrl+P)">
          <Icon.Search />
          <span className="nav-search-text">Search files...</span>
          <span className="nav-search-shortcut">Ctrl+P</span>
        </div>

        <div className="nav-right">
          <div className="nav-center">
            <button className="black-pill-btn workspace-btn primary" onClick={handleRunCode} title="Run Code">
              <Icon.Play />
              <span>Run</span>
            </button>
            <button className="black-pill-btn workspace-btn" onClick={handleSaveCode} title="Save Snapshot">
              <Icon.Save />
              <span>Save</span>
            </button>
            <button className="black-pill-btn workspace-btn" onClick={handleShareSession} title="Copy Live Link">
              <Icon.Share />
              <span>Share</span>
            </button>
          </div>

          <div className="user-profile-badge">
            <span className="user-avatar-glow" style={{ borderColor: getAvatarColor(username) }}>
              <span className="user-avatar-inner" style={{ background: getAvatarColor(username) }}>
                {getInitials(username)}
              </span>
            </span>
            <span className="user-display-name">{username}</span>
            <span className="status-indicator-dot" />
          </div>
        </div>
      </header>

      <div className="workspace-body">
        {/* Mobile Backdrop for Floating Sidebar Overlay */}
        {!sidebarCollapsed && (
          <div className="mobile-sidebar-backdrop" onClick={() => setSidebarCollapsed(true)} />
        )}

        {/* Left Activity Bar */}
        <nav className="activitybar">
          <div className="activitybar-top">
            {ACTIVITY_ITEMS.slice(0, 5).map((item) => {
              const ItemIcon = item.icon
              return (
                <button
                  key={item.id}
                  className={`activity-item ${activityView === item.id && !sidebarCollapsed ? 'active' : ''}`}
                  title={item.label}
                  onClick={() => handleActivityClick(item.id)}
                >
                  <ItemIcon />
                </button>
              )
            })}
          </div>

          <div className="activitybar-bottom">
            {(() => {
              const ls = ACTIVITY_ITEMS[5]
              return (
                <button
                  className={`activity-item ${activityView === ls.id && !sidebarCollapsed ? 'active' : ''}`}
                  title={ls.label}
                  onClick={() => handleActivityClick(ls.id)}
                >
                  <ls.icon />
                  {ls.badge ? <span className="activity-badge">{ls.badge}</span> : null}
                </button>
              )
            })()}
            <a href="/" className="activity-item" title="Logout">
              <LogOut className="w-4 h-4 text-purple-300 hover:text-white transition-colors" />
            </a>
          </div>
        </nav>

        {/* Collapsible Left Sidebar Panel */}
        <aside className={`sidebar-v2 ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">
              {activityView.toUpperCase()}
            </span>
            <button className="sidebar-toggle-btn" onClick={() => setSidebarCollapsed(true)} title="Collapse sidebar">
              <Icon.ChevronLeft />
            </button>
          </div>

          {activityView === 'explorer' && (
            <div className="sidebar-content">
              <div className="explorer-project-title">
                <span className="tree-chevron expanded"><Icon.Chevron /></span>
                <span>ZEESCODE WORKSPACE</span>
              </div>
              {FILE_TREE.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  expanded={expanded}
                  toggle={toggleFolder}
                  selectedId={activeTabId}
                  onSelectFile={handleSelectFile}
                />
              ))}
            </div>
          )}

          {activityView === 'search' && (
            <div className="sidebar-content">
              <div className="search-box">
                <Icon.Search />
                <input
                  type="text"
                  placeholder="Search workspace files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchQuery ? (
                <div className="search-results">
                  <div className="scm-section-header">MATCHING FILES</div>
                  <div className="scm-file-row">
                    <Icon.File color="#38bdf8" />
                    <span>App.jsx</span>
                  </div>
                  <div className="scm-file-row">
                    <Icon.File color="#a855f7" />
                    <span>App.css</span>
                  </div>
                </div>
              ) : (
                <div className="panel-empty-card">
                  <Icon.Search className="empty-icon" />
                  <p className="panel-empty-text">Type a keyword to search across files in your workspace.</p>
                </div>
              )}
            </div>
          )}

          {activityView === 'git' && (
            <div className="sidebar-content">
              <div className="scm-commit-input">Commit message (Cmd+Enter)</div>
              <div className="scm-section-header">STAGED CHANGES</div>
              <div className="scm-file-row">
                <Icon.File color="#a855f7" />
                <span>App.jsx</span>
                <span className="scm-tag modified">M</span>
              </div>
              <div className="scm-file-row">
                <Icon.File color="#a855f7" />
                <span>App.css</span>
                <span className="scm-tag modified">M</span>
              </div>
            </div>
          )}

          {activityView === 'debug' && (
            <div className="sidebar-content">
              <div className="debug-config-card">
                <div className="debug-header">
                  <Icon.Debug />
                  <span>Launch Node.js Process</span>
                </div>
                <div className="debug-sub">Target: src/main.js</div>
              </div>
              <div className="panel-empty-card">
                <Icon.AlertCircle className="empty-icon" />
                <p className="panel-empty-text">No active debug configurations found for this room.</p>
              </div>
            </div>
          )}

          {activityView === 'extensions' && (
            <div className="sidebar-content">
              {[
                { name: 'Yjs Realtime Sync', desc: 'CRDT collaborative document engine', color: '#38bdf8' },
                { name: 'Monaco Formatter', desc: 'Prettier auto-formatting on save', color: '#4ade80' },
                { name: 'ESLint Diagnostics', desc: 'JavaScript linter & syntax inspector', color: '#c084fc' },
              ].map((ext) => (
                <div key={ext.name} className="ext-card">
                  <div className="ext-avatar" style={{ background: ext.color }}>{ext.name[0]}</div>
                  <div className="ext-info">
                    <div className="ext-title">{ext.name}</div>
                    <div className="ext-desc">{ext.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activityView === 'liveshare' && (
            <div className="sidebar-content">
              <div className="session-active-card">
                <div className="session-active-header">
                  <Icon.People />
                  <span>Session Active</span>
                </div>
                <div className="session-active-sub">session/monaco • {users.length} connected</div>
              </div>
              <div className="participants-title">COLLABORATORS ({users.length})</div>
              <div className="user-list">
                {users.length === 0 ? (
                  <div className="user-empty-card">
                    <Icon.People className="empty-icon" />
                    <p className="user-empty-text">No other collaborators active right now.</p>
                    <button className="black-pill-btn share-invite-btn" onClick={handleShareSession}>
                      <Icon.Share />
                      <span>Copy Invite Link</span>
                    </button>
                  </div>
                ) : (
                  users.map((u, idx) => (
                    <div key={idx} className="user-row">
                      <span className="user-avatar-glow-sm" style={{ borderColor: getAvatarColor(u.username) }}>
                        <span className="user-avatar-inner" style={{ background: getAvatarColor(u.username) }}>
                          {getInitials(u.username)}
                        </span>
                      </span>
                      <span className="user-name">{u.username}</span>
                      {u.username === username && <span className="you-tag">you</span>}
                      <span className="online-dot" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main Code Editor Container */}
        <section className="editor-area">
          {/* Top Editor Tab Bar */}
          <div className="editor-tabs-bar">
            <div className="tabs-scroll flex-1">
              {openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`editor-tab ${activeTabId === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  <span className="tab-dot" style={{ background: FILE_ICON_COLORS[tab.lang] || '#a855f7' }} />
                  <span className="tab-name">{tab.name}</span>
                  <button className="tab-close-btn" onClick={(e) => closeTab(tab.id, e)} title="Close tab">
                    <Icon.Close />
                  </button>
                </div>
              ))}
            </div>
            <button className="add-tab-btn" onClick={handleAddNewTab} title="New File Tab">
              <Icon.Plus />
            </button>
          </div>

          {/* Editor Breadcrumbs Navigation */}
          <div className="editor-breadcrumb-bar">
            <span>src</span>
            <span className="crumb-sep">/</span>
            <span>components</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-active">{activeTab?.name || 'main.js'}</span>
          </div>

          {/* Connection Banner */}
          {connectionError ? (
            <div className="connection-error-banner">
              <Icon.AlertCircle />
              <span className="error-text">{connectionError}</span>
              <button className="dismiss-btn" onClick={() => setConnectionError('')} title="Dismiss">
                <Icon.Close />
              </button>
            </div>
          ) : null}

          {/* Monaco Editor Core */}
          <div className="monaco-wrapper">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              defaultValue="// Welcome to ZeesCode Workspace! Start typing here..."
              theme="vs-dark"
              onMount={handleMount}
              options={{
                fontSize: 13.5,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                lineHeight: 22,
                padding: { top: 14, bottom: 14 },
                minimap: { enabled: true, scale: 1 },
                scrollBeyondLastLine: false,
                renderLineHighlight: "gutter",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
                overviewRulerBorder: false,
                stickyScroll: { enabled: true },
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Bottom Resizable / Collapsible Panel */}
          <div className={`bottom-panel ${panelCollapsed ? 'collapsed' : ''}`}>
            <div className="panel-tab-bar">
              {['terminal', 'output', 'preview', 'problems'].map((tab) => (
                <button
                  key={tab}
                  className={`panel-tab ${panelTab === tab ? 'active' : ''}`}
                  onClick={() => setPanelTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
              <div className="panel-spacer" />
              <button
                className="panel-close-btn"
                onClick={() => setPanelCollapsed(true)}
                title="Collapse panel"
              >
                <Icon.Close />
              </button>
            </div>

            <div className="panel-body">
              {panelTab === 'terminal' && (
                <div className="terminal-content">
                  {consoleLogs.map((log, index) => (
                    <div key={index} className={`terminal-line log-${log.type}`}>
                      {log.text}
                    </div>
                  ))}
                  <div className="terminal-prompt-line">
                    <span className="prompt-symbol">➜</span>
                    <span className="prompt-path">ZeesCode git:(main*)</span>
                    <span className="terminal-cursor" />
                  </div>
                </div>
              )}

              {panelTab === 'output' && (
                <div className="terminal-content">
                  <div className="terminal-line log-info">[Console Monitor] Listening to standard output...</div>
                  <div className="terminal-line log-output">&gt; ZeesCode v2.4 initialized. Ready for execution.</div>
                </div>
              )}

              {panelTab === 'preview' && (
                <div className="preview-container">
                  <div className="preview-card">
                    <div className="preview-card-header">Live Output Preview</div>
                    <p className="preview-card-text">Click <strong>Run</strong> in the top toolbar to re-render output evaluation.</p>
                  </div>
                </div>
              )}

              {panelTab === 'problems' && (
                <div className="panel-empty-text">No diagnostics or syntax errors detected in workspace.</div>
              )}
            </div>
          </div>

          {/* Narrow VS Code Style Status Bar */}
          <footer className="statusbar-vscode">
            <div className="statusbar-left">
              <span className="statusbar-item branch-item"><Icon.Branch /> main*</span>
              <span className="statusbar-item error-item"><Icon.Error /> 0 ⊗ 0 △</span>
              <button
                className="statusbar-item clickable terminal-btn"
                onClick={() => setPanelCollapsed((v) => !v)}
              >
                <Icon.Terminal /> terminal
              </button>
            </div>

            <div className="statusbar-right">
              <div className="statusbar-users-stack">
                {users.slice(0, 4).map((u, i) => (
                  <span key={i} className="stack-avatar" style={{ background: getAvatarColor(u.username) }}>
                    {getInitials(u.username)}
                  </span>
                ))}
                <span className="users-count-text">{users.length} online</span>
              </div>
              <span className="statusbar-item">Ln {cursorPos.line}, Col {cursorPos.col}</span>
              <span className="statusbar-item">Spaces: 2</span>
              <span className="statusbar-item">UTF-8</span>
              <span className="statusbar-item">LF</span>
              <span className="statusbar-item lang-tag">&#123;&#125; {activeTab?.lang === 'jsx' ? 'JavaScript JSX' : activeTab?.lang === 'css' ? 'CSS' : activeTab?.lang === 'json' ? 'JSON' : 'JavaScript'}</span>
              <span className="statusbar-item bell-item"><Icon.Bell /></span>
            </div>
          </footer>
        </section>
      </div>
    </main>
  )
}

export default App