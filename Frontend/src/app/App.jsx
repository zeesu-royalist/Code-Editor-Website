import './App.css'
import { Editor } from '@monaco-editor/react'
import { useRef, useMemo, useState, useEffect } from 'react'
import { MonacoBinding } from 'y-monaco'
import * as Y from 'yjs'
import { createRealtimeProvider } from './realtime'

/* ────────────────────────────────────────────────
   Small inline icon set (kept dependency-free)
──────────────────────────────────────────────── */
const Icon = {
  Files: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M13 3v5h5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  Search: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M20 20L15.2 15.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Git: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="7" cy="6" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="12" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 8v8M7 8c0 3 3 3.5 8 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  Debug: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M8 6l9 6-9 6V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  Extensions: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M14 4h-4v3H7a2 2 0 0 0-2 2v3h3v4H5v3a2 2 0 0 0 2 2h3v-3h4v3h3a2 2 0 0 0 2-2v-3h-3v-4h3V9a2 2 0 0 0-2-2h-3V4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  People: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="17.5" cy="8.5" r="2.3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M15.5 14.3c2.6.3 4.5 2.2 4.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Settings: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Chevron: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Folder: (p) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M1.5 3.5h4l1.2 1.5h7.3a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1h-11.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" fill="#dcb67a" stroke="#dcb67a" strokeWidth="0.5" />
    </svg>
  ),
  File: ({ color = '#519aba', ...p }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M3.5 1.5h5.6L12.5 5v9.5a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" stroke={color} strokeWidth="1.1" />
      <path d="M9 1.5V5h3.5" stroke={color} strokeWidth="1.1" />
    </svg>
  ),
  Close: (p) => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Terminal: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M2 3h12v10H2V3Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 6l2.5 2.5L4 11M8 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Branch: (p) => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" {...p}>
      <circle cx="4.5" cy="4" r="1.6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="4.5" cy="12" r="1.6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11.5" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 5.6v4.8M4.5 5.6c0 2 3 2.3 5.6 2.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  Error: (p) => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" {...p}>
      <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v4M8 11v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Bell: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M4 12V7a4 4 0 0 1 8 0v5l1.2 1.6H2.8L4 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6.5 14a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
}

/* ────────────────────────────────────────────────
   Mock explorer file tree (visual chrome only —
   the live document is always the bound Yjs file)
──────────────────────────────────────────────── */
const FILE_ICON_COLORS = { js: '#e8c15c', jsx: '#5ec9f8', css: '#519aba', json: '#cbcb41', md: '#9ea3ab' }

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

const LANDING_CITIES = [
  { id: 'la', name: 'Los Angeles', country: 'United States', utc: 'UTC-8', time24: '00:15', time12: '12:15 AM', status: 'Night', isDay: false },
  { id: 'ny', name: 'New York', country: 'United States', utc: 'UTC+2', time24: '03:15', time12: '03:15 AM', status: 'Night', isDay: false },
  { id: 'london', name: 'London', country: 'United Kingdom', utc: 'UTC-5', time24: '08:15', time12: '08:15 AM', status: 'Day', isDay: true },
  { id: 'paris', name: 'Paris', country: 'France', utc: 'UTC+0', time24: '09:15', time12: '09:15 AM', status: 'Day', isDay: true },
]

const AVATAR_COLORS = ["#4fc3d9", "#e2a05f", "#89d185", "#c586c0", "#3794ff", "#f14c4c", "#cca700", "#5ec9f8"]

function readStoredEditorContent() {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) || ''
  } catch (error) {
    console.warn('[Storage] Unable to read the local editor snapshot.', error)
    return ''
  }
}

function writeStoredEditorContent(content) {
  if (typeof window === 'undefined' || !content) {
    return
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, content)
  } catch (error) {
    console.warn('[Storage] Unable to save the local editor snapshot.', error)
  }
}

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
  return name.split(" ").filter(Boolean).map(p => p[0]).join("").toUpperCase().slice(0, 2)
}

/* Recursive file tree row */
function TreeNode({ node, depth, expanded, toggle, selectedId, onSelectFile }) {
  const isFolder = node.type === 'folder'
  const isOpen = expanded.has(node.id)

  if (isFolder) {
    return (
      <div className="tree-node">
        <div
          className="tree-row"
          style={{ paddingLeft: 8 + depth * 14 }}
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
      style={{ paddingLeft: 8 + depth * 14 + 16 }}
      onClick={() => onSelectFile(node)}
    >
      <span className="tree-icon"><Icon.File color={FILE_ICON_COLORS[node.lang] || '#8a8a8a'} /></span>
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

  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get('username') || ''
  })
  const [users, setUsers] = useState([])
  const [connectionError, setConnectionError] = useState('')

  // ── Landing Page UI Presentation State ──
  const [timeFormat, setTimeFormat] = useState('24h')
  const [activeCityId, setActiveCityId] = useState('london')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [openFaq, setOpenFaq] = useState(null)
  const [playgroundTab, setPlaygroundTab] = useState('cursors')
  const [isYearly, setIsYearly] = useState(false)

  useEffect(() => {
    if (username) return
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [username])

  const formattedHeroTime = useMemo(() => {
    let hours = currentTime.getHours()
    const minutes = String(currentTime.getMinutes()).padStart(2, '0')
    const seconds = String(currentTime.getSeconds()).padStart(2, '0')
    if (timeFormat === '12h') {
      hours = hours % 12 || 12
    }
    const hoursStr = String(hours).padStart(2, '0')
    return `${hoursStr}:${minutes}:${seconds}`
  }, [currentTime, timeFormat])

  const activeCity = useMemo(() => {
    return LANDING_CITIES.find(c => c.id === activeCityId) || LANDING_CITIES[2]
  }, [activeCityId])

  // ── VS Code shell chrome state ──
  const [activityView, setActivityView] = useState('explorer')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [panelTab, setPanelTab] = useState('terminal')
  const [expanded, setExpanded] = useState(() => new Set(['src']))
  const [openTabs, setOpenTabs] = useState([{ id: 'main.js', name: 'main.js', lang: 'js' }])
  const [activeTabId, setActiveTabId] = useState('main.js')

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText(ROOM_ID), [ydoc])

  // Persist the collaborative document snapshot in the browser cache with a small debounce.
  // This keeps refreshes resilient without changing the realtime socket contract.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const persistYDocToStorage = () => {
      const content = yText.toString()

      if (!content) {
        return
      }

      writeStoredEditorContent(content)
    }

    const handleYDocUpdate = () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = window.setTimeout(persistYDocToStorage, 400)
    }

    ydoc.on('update', handleYDocUpdate)

    return () => {
      ydoc.off('update', handleYDocUpdate)

      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [ydoc, yText])

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy()
      providerRef.current?.destroy()

      if (handleBeforeUnloadRef.current) {
        window.removeEventListener('beforeunload', handleBeforeUnloadRef.current)
      }

      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }

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

    // Restore the room-scoped browser snapshot only once, before the Yjs binding starts.
    // This prevents a refresh from wiping the document while keeping the collaborative sync flow intact.
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
        'Realtime collaboration is unavailable because VITE_SOCKET_URL is not configured. Add the Render backend URL to your frontend environment.'
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

  const handleJoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({}, "", "?username=" + e.target.username.value)
  }

  const toggleFolder = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSelectFile = (node) => {
    setOpenTabs((prev) => (prev.some(t => t.id === node.id) ? prev : [...prev, node]))
    setActiveTabId(node.id)
  }

  const closeTab = (id, e) => {
    e.stopPropagation()
    setOpenTabs((prev) => {
      const next = prev.filter(t => t.id !== id)
      if (activeTabId === id && next.length) setActiveTabId(next[next.length - 1].id)
      return next.length ? next : prev.slice(0, 1) // keep at least main.js visible
    })
  }

  const activeTab = openTabs.find(t => t.id === activeTabId) || openTabs[0]

  const ACTIVITY_ITEMS = [
    { id: 'explorer', label: 'Explorer', icon: Icon.Files },
    { id: 'search', label: 'Search', icon: Icon.Search },
    { id: 'git', label: 'Source Control', icon: Icon.Git },
    { id: 'debug', label: 'Run and Debug', icon: Icon.Debug },
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

  if (!username) {
    const scrollToSection = (id) => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }

    return (
      <main className="ts-landing-bg">
        <div className="ts-landing-card">
          {/* Top Navbar */}
          <header className="ts-navbar">
            <div className="ts-nav-left">
              <div className="ts-nav-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <span className="ts-brand-name">TimeSpot</span>
            </div>

            <nav className="ts-nav-links">
              <button type="button" onClick={() => scrollToSection('features')} className="ts-nav-link">Features</button>
              <button type="button" onClick={() => scrollToSection('bento')} className="ts-nav-link">Bento</button>
              <button type="button" onClick={() => scrollToSection('playground')} className="ts-nav-link">Playground</button>
              <button type="button" onClick={() => scrollToSection('pricing')} className="ts-nav-link">Pricing</button>
              <button type="button" onClick={() => scrollToSection('faq')} className="ts-nav-link">FAQ</button>
            </nav>

            <div className="ts-nav-center">
              <div className="ts-search-bar">
                <svg className="ts-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M20 20L16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input type="text" placeholder="Search features, docs..." className="ts-search-input" />
              </div>
            </div>

            <div className="ts-nav-right">
              <button type="button" className="ts-btn-ghost" onClick={() => {
                const input = document.getElementById('username')
                if (input) input.focus()
              }}>Log In</button>
              <button type="button" className="ts-btn-pill" onClick={() => {
                const input = document.getElementById('username')
                if (input) input.focus()
              }}>Get Started</button>
            </div>
          </header>

          {/* Hero Section */}
          <section className="ts-hero-section">
            {/* Badge */}
            <div className="ts-hero-badge">
              <span className="ts-hero-badge-dot" />
              <span>TimeSpot CodeSync v2.5 Released</span>
              <span className="ts-hero-badge-arrow">→</span>
            </div>

            {/* Oversized typography centerpiece */}
            <div className="ts-hero-clock-container">
              <h1 className="ts-hero-clock-display">{formattedHeroTime}</h1>
            </div>

            {/* Name Entry Form integrated as the hero focal point */}
            <form onSubmit={handleJoin} className="ts-hero-form">
              <div className="ts-hero-input-wrapper">
                <svg className="ts-hero-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M4 20C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter display name to join workspace..."
                  className="ts-hero-input"
                  autoComplete="off"
                  autoFocus
                />
                <button type="submit" className="ts-hero-submit-btn">
                  <span>Open Editor</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Secondary Info Row */}
            <div className="ts-hero-meta-row">
              <div className="ts-meta-left">
                <span className="ts-meta-label">Current</span>
              </div>
              <div className="ts-meta-center">
                <div className="ts-meta-sun-info">
                  Sun ☀️ : 07:12 - 17:17 (10h 06m)
                </div>
                <div className="ts-meta-date">
                  Monday, Mar 24 2025
                </div>
              </div>
              <div className="ts-meta-right">
                <div className="ts-segmented-switch">
                  <button
                    type="button"
                    className={`ts-segment-btn ${timeFormat === '12h' ? 'active' : ''}`}
                    onClick={() => setTimeFormat('12h')}
                  >
                    12h
                  </button>
                  <button
                    type="button"
                    className={`ts-segment-btn ${timeFormat === '24h' ? 'active' : ''}`}
                    onClick={() => setTimeFormat('24h')}
                  >
                    24h
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="ts-card-divider" />

          {/* Content Section Below Hero */}
          <section className="ts-content-section" id="features">
            <div className="ts-content-header">
              <div className="ts-location-block">
                <h2 className="ts-location-title">{activeCity.name},</h2>
                <h2 className="ts-location-title">{activeCity.country}</h2>
              </div>
              <div className="ts-tagline-block">
                <p className="ts-tagline-text">
                  Life moves fast. Stay on time<br />
                  and enjoy every moment!
                </p>
              </div>
              <div className="ts-action-block">
                <button type="button" className="ts-add-action-btn">
                  <span>Add Another City</span>
                  <span className="ts-plus-circle">+</span>
                </button>
              </div>
            </div>

            {/* Grid of Cards */}
            <div className="ts-cards-grid">
              {LANDING_CITIES.map((city) => {
                const isActive = city.id === activeCityId
                return (
                  <div
                    key={city.id}
                    className={`ts-city-card ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveCityId(city.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveCityId(city.id) }}
                  >
                    <div className="ts-card-header">
                      <span className="ts-card-city-name">{city.name}</span>
                      <span className="ts-card-utc">{city.utc}</span>
                    </div>
                    <div className="ts-card-body">
                      <div className="ts-card-digits">
                        {timeFormat === '12h' ? city.time12 : city.time24}
                      </div>
                    </div>
                    <div className="ts-card-footer">
                      <div className="ts-card-status">
                        {city.isDay ? (
                          <>
                            <span className="ts-status-sun">☀️</span> Day
                          </>
                        ) : (
                          <>
                            <span className="ts-status-moon">🌙</span> Night
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Section Divider */}
          <div className="ts-card-divider" />

          {/* Metrics & Social Proof Banner */}
          <section className="ts-metrics-section">
            <div className="ts-metrics-grid">
              <div className="ts-metric-box">
                <span className="ts-metric-number">10M+</span>
                <span className="ts-metric-label">Lines Synced Daily</span>
              </div>
              <div className="ts-metric-box">
                <span className="ts-metric-number">&lt; 15ms</span>
                <span className="ts-metric-label">Global Realtime Latency</span>
              </div>
              <div className="ts-metric-box">
                <span className="ts-metric-number">99.99%</span>
                <span className="ts-metric-label">Socket Relay Uptime</span>
              </div>
              <div className="ts-metric-box">
                <span className="ts-metric-number">50k+</span>
                <span className="ts-metric-label">Active Pair Sessions</span>
              </div>
            </div>
          </section>

          {/* Section Divider */}
          <div className="ts-card-divider" />

          {/* Bento Grid Section */}
          <section className="ts-bento-section" id="bento">
            <div className="ts-section-heading-wrap">
              <span className="ts-section-eyebrow">ENGINEERED FOR TEAMS</span>
              <h2 className="ts-section-title">Built for Frictionless Pair Programming</h2>
              <p className="ts-section-desc">Experience real-time code editing with zero setup, instant CRDT synchronization, and local resilience.</p>
            </div>

            <div className="ts-bento-grid">
              {/* Bento Card 1 - Large Featured Black Card */}
              <div className="ts-bento-card ts-bento-card-large ts-bento-black">
                <div className="ts-bento-content">
                  <div className="ts-bento-badge">REAL-TIME SYNC</div>
                  <h3 className="ts-bento-title">Sub-millisecond Multi-Cursor Collaboration</h3>
                  <p className="ts-bento-text">Type together with zero conflict. See your teammate's selections, cursors, and edits instantly as if you're on the same machine.</p>
                </div>
                <div className="ts-bento-visual ts-bento-code-visual">
                  <div className="ts-code-preview-window">
                    <div className="ts-code-header">
                      <span className="ts-code-dot red" />
                      <span className="ts-code-dot yellow" />
                      <span className="ts-code-dot green" />
                      <span className="ts-code-filename">realtime-sync.ts</span>
                    </div>
                    <div className="ts-code-body">
                      <div><span className="kw">import</span> &#123; Y, MonacoBinding &#125; <span className="kw">from</span> <span className="str">'y-monaco'</span></div>
                      <div><span className="kw">const</span> doc = <span className="kw">new</span> Y.Doc()</div>
                      <div><span className="kw">const</span> text = doc.getText(<span className="str">'workspace'</span>)</div>
                      <div className="ts-code-line-active">
                        <span>text.insert(0, <span className="str">'// Code together in real time'</span>)</span>
                        <span className="ts-live-cursor-tag" style={{ background: '#4fc3d9' }}>Arjun</span>
                      </div>
                      <div><span>monaco.bind(text, editor.getModel())</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Card 2 */}
              <div className="ts-bento-card">
                <div className="ts-bento-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="ts-bento-card-title">Yjs CRDT Engine</h3>
                <p className="ts-bento-card-text">State-of-the-art Conflict-free Replicated Data Type engine guarantees clean merges without keystroke loss.</p>
              </div>

              {/* Bento Card 3 */}
              <div className="ts-bento-card">
                <div className="ts-bento-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="ts-bento-card-title">Monaco Editor Engine</h3>
                <p className="ts-bento-card-text">Powered by the exact editor core inside VS Code with syntax highlighting, indentation, and keybindings.</p>
              </div>

              {/* Bento Card 4 */}
              <div className="ts-bento-card ts-bento-card-wide">
                <div className="ts-bento-content">
                  <div className="ts-bento-badge">ZERO CONFIG</div>
                  <h3 className="ts-bento-card-title">Instant Shareable Room Links</h3>
                  <p className="ts-bento-card-text">No account creation required. Send a single link to your teammate or candidate and start coding immediately in your browser.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section Divider */}
          <div className="ts-card-divider" />

          {/* Interactive Playground Feature Section */}
          <section className="ts-playground-section" id="playground">
            <div className="ts-section-heading-wrap">
              <span className="ts-section-eyebrow">INTERACTIVE PREVIEW</span>
              <h2 className="ts-section-title">Explore the CodeSync Capabilities</h2>
              <p className="ts-section-desc">Test how our real-time synchronization, local caching, and Monaco engine interact under the hood.</p>
            </div>

            <div className="ts-playground-box">
              <div className="ts-playground-tabs">
                <button
                  type="button"
                  className={`ts-playground-tab ${playgroundTab === 'cursors' ? 'active' : ''}`}
                  onClick={() => setPlaygroundTab('cursors')}
                >
                  ⚡ Live Cursors
                </button>
                <button
                  type="button"
                  className={`ts-playground-tab ${playgroundTab === 'crdt' ? 'active' : ''}`}
                  onClick={() => setPlaygroundTab('crdt')}
                >
                  🔄 CRDT Sync
                </button>
                <button
                  type="button"
                  className={`ts-playground-tab ${playgroundTab === 'storage' ? 'active' : ''}`}
                  onClick={() => setPlaygroundTab('storage')}
                >
                  💾 Local Persistence
                </button>
                <button
                  type="button"
                  className={`ts-playground-tab ${playgroundTab === 'explorer' ? 'active' : ''}`}
                  onClick={() => setPlaygroundTab('explorer')}
                >
                  📁 File Tree
                </button>
              </div>

              <div className="ts-playground-view">
                {playgroundTab === 'cursors' && (
                  <div className="ts-playground-code-screen">
                    <div className="ts-pg-line"><code><span className="kw">function</span> <span className="fn">pairProgrammingSession</span>(users) &#123;</code></div>
                    <div className="ts-pg-line ts-pg-highlight">
                      <code>  <span className="kw">return</span> users.map(user =&gt; user.activeCursor)</code>
                      <span className="ts-pg-avatar-tag" style={{ background: '#e2a05f' }}>Sarah (Editing line 2)</span>
                    </div>
                    <div className="ts-pg-line"><code>&#125;</code></div>
                  </div>
                )}
                {playgroundTab === 'crdt' && (
                  <div className="ts-playground-code-screen">
                    <div className="ts-pg-line"><code><span className="cmt">// Yjs Document Updates broadcast via WebSockets</span></code></div>
                    <div className="ts-pg-line"><code>ydoc.on(<span className="str">'update'</span>, update =&gt; socket.emit(<span className="str">'sync-update'</span>, update))</code></div>
                    <div className="ts-pg-line ts-pg-success"><code>✓ 0 Keystrokes Lost — State Vector Verified</code></div>
                  </div>
                )}
                {playgroundTab === 'storage' && (
                  <div className="ts-playground-code-screen">
                    <div className="ts-pg-line"><code><span className="cmt">// Automatic Local Storage Resilience</span></code></div>
                    <div className="ts-pg-line"><code>window.localStorage.setItem(<span className="str">'editor-room-snapshot'</span>, content)</code></div>
                    <div className="ts-pg-line ts-pg-success"><code>✓ Snapshot Restored on Browser Refresh</code></div>
                  </div>
                )}
                {playgroundTab === 'explorer' && (
                  <div className="ts-playground-code-screen">
                    <div className="ts-pg-line"><code>📁 src/</code></div>
                    <div className="ts-pg-line"><code>  ├── 📄 App.jsx <span className="cmt">(Active Tab)</span></code></div>
                    <div className="ts-pg-line"><code>  ├── 📄 App.css</code></div>
                    <div className="ts-pg-line"><code>  └── 📄 main.jsx</code></div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section Divider */}
          <div className="ts-card-divider" />

          {/* Testimonials Section */}
          <section className="ts-testimonials-section">
            <div className="ts-section-heading-wrap">
              <span className="ts-section-eyebrow">DEVELOPER LOVE</span>
              <h2 className="ts-section-title">Trusted by Engineers Worldwide</h2>
            </div>

            <div className="ts-testimonials-grid">
              <div className="ts-testimonial-card">
                <div className="ts-stars">★★★★★</div>
                <p className="ts-testimonial-text">"Pair programming has never felt this fluid. It feels just as fast as my local VS Code editor without any socket lag."</p>
                <div className="ts-author-wrap">
                  <div className="ts-author-avatar" style={{ background: '#3794ff' }}>SL</div>
                  <div>
                    <div className="ts-author-name">Sarah Lin</div>
                    <div className="ts-author-title">Staff Engineer @ Vercel</div>
                  </div>
                </div>
              </div>

              <div className="ts-testimonial-card ts-testimonial-black">
                <div className="ts-stars">★★★★★</div>
                <p className="ts-testimonial-text">"We shifted all our technical remote interviews to TimeSpot CodeSync. Candidates love the familiar Monaco interface."</p>
                <div className="ts-author-wrap">
                  <div className="ts-author-avatar" style={{ background: '#89d185' }}>MV</div>
                  <div>
                    <div className="ts-author-name" style={{ color: '#fff' }}>Marcus Vance</div>
                    <div className="ts-author-title" style={{ color: '#aaa' }}>Principal Lead @ Stripe</div>
                  </div>
                </div>
              </div>

              <div className="ts-testimonial-card">
                <div className="ts-stars">★★★★★</div>
                <p className="ts-testimonial-text">"The Yjs integration is bulletproof. Refreshing the browser without losing a single keystroke feels like pure magic."</p>
                <div className="ts-author-wrap">
                  <div className="ts-author-avatar" style={{ background: '#c586c0' }}>AR</div>
                  <div>
                    <div className="ts-author-name">Alex Rivera</div>
                    <div className="ts-author-title">Senior Dev @ GitHub</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section Divider */}
          <div className="ts-card-divider" />

          {/* Pricing Section */}
          <section className="ts-pricing-section" id="pricing">
            <div className="ts-section-heading-wrap">
              <span className="ts-section-eyebrow">TRANSPARENT PRICING</span>
              <h2 className="ts-section-title">Simple Plans for Every Developer</h2>
              <div className="ts-pricing-toggle-row">
                <span className={!isYearly ? 'active' : ''}>Monthly</span>
                <div className="ts-segmented-switch" onClick={() => setIsYearly(!isYearly)} style={{ cursor: 'pointer' }}>
                  <button type="button" className={`ts-segment-btn ${!isYearly ? 'active' : ''}`}>M</button>
                  <button type="button" className={`ts-segment-btn ${isYearly ? 'active' : ''}`}>Y</button>
                </div>
                <span className={isYearly ? 'active' : ''}>Yearly <span className="ts-save-badge">Save 20%</span></span>
              </div>
            </div>

            <div className="ts-pricing-grid">
              {/* Plan 1 */}
              <div className="ts-pricing-card">
                <h3 className="ts-plan-name">Starter / Hobby</h3>
                <div className="ts-plan-price">$0 <span>/ forever</span></div>
                <p className="ts-plan-desc">Perfect for quick pair programming sessions and open-source contributions.</p>
                <ul className="ts-plan-features">
                  <li>✓ Real-time multi-user pairing</li>
                  <li>✓ Monaco VS Code engine</li>
                  <li>✓ Yjs CRDT synchronization</li>
                  <li>✓ Browser snapshot persistence</li>
                </ul>
                <button type="button" className="ts-plan-btn" onClick={() => {
                  const input = document.getElementById('username')
                  if (input) input.focus()
                }}>Start Free</button>
              </div>

              {/* Plan 2 - Highlighted Solid Black */}
              <div className="ts-pricing-card ts-pricing-card-active">
                <div className="ts-plan-badge">MOST POPULAR</div>
                <h3 className="ts-plan-name" style={{ color: '#fff' }}>Pro Pair</h3>
                <div className="ts-plan-price" style={{ color: '#fff' }}>{isYearly ? '$10' : '$12'} <span style={{ color: '#aaa' }}>/ month</span></div>
                <p className="ts-plan-desc" style={{ color: '#ccc' }}>For remote teams needing unlimited dedicated rooms and custom domains.</p>
                <ul className="ts-plan-features" style={{ color: '#eee' }}>
                  <li>✓ Everything in Starter</li>
                  <li>✓ Unlimited persistent rooms</li>
                  <li>✓ Priority WebSocket relay servers</li>
                  <li>✓ Custom room branding</li>
                  <li>✓ Integrated voice & video stream</li>
                </ul>
                <button type="button" className="ts-plan-btn ts-plan-btn-active" onClick={() => {
                  const input = document.getElementById('username')
                  if (input) input.focus()
                }}>Get Pro Access</button>
              </div>

              {/* Plan 3 */}
              <div className="ts-pricing-card">
                <h3 className="ts-plan-name">Enterprise</h3>
                <div className="ts-plan-price">$29 <span>/ month</span></div>
                <p className="ts-plan-desc">For engineering organizations requiring dedicated self-hosted sync servers.</p>
                <ul className="ts-plan-features">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Dedicated self-hosted relay</li>
                  <li>✓ SAML / SSO Authentication</li>
                  <li>✓ Audit logs & encryption</li>
                </ul>
                <button type="button" className="ts-plan-btn" onClick={() => {
                  const input = document.getElementById('username')
                  if (input) input.focus()
                }}>Contact Sales</button>
              </div>
            </div>
          </section>

          {/* Section Divider */}
          <div className="ts-card-divider" />

          {/* FAQ Accordion Section */}
          <section className="ts-faq-section" id="faq">
            <div className="ts-section-heading-wrap">
              <span className="ts-section-eyebrow">FREQUENTLY ASKED QUESTIONS</span>
              <h2 className="ts-section-title">Everything You Need to Know</h2>
            </div>

            <div className="ts-faq-list">
              {[
                {
                  q: "What is TimeSpot CodeSync?",
                  a: "TimeSpot CodeSync is a ultra-fast collaborative code editor powered by Monaco Editor and Yjs CRDTs, allowing multiple developers to pair program in real time without keystroke conflicts."
                },
                {
                  q: "Do I need to install anything or create an account?",
                  a: "No! Just enter your display name in the hero input form at the top of this page, and you will immediately enter the live workspace."
                },
                {
                  q: "How does offline persistence work?",
                  a: "Your edits are continuously saved into browser storage using debounced snapshots. Even if you accidentally refresh or lose internet connection, your code is preserved."
                },
                {
                  q: "How many developers can collaborate in one room?",
                  a: "Our socket relay architecture handles 50+ simultaneous active users per room with sub-15ms global latency."
                }
              ].map((faq, idx) => (
                <div key={idx} className={`ts-faq-item ${openFaq === idx ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="ts-faq-question"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span>{faq.q}</span>
                    <span className="ts-faq-icon">{openFaq === idx ? '−' : '+'}</span>
                  </button>
                  {openFaq === idx && (
                    <div className="ts-faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section Divider */}
          <div className="ts-card-divider" />

          {/* Footer Call-To-Action Card */}
          <section className="ts-cta-banner">
            <div className="ts-cta-card">
              <h2 className="ts-cta-title">Ready to Experience Frictionless Pair Coding?</h2>
              <p className="ts-cta-desc">Type your display name in the hero form above to enter your room immediately.</p>
              <button
                type="button"
                className="ts-btn-pill"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  setTimeout(() => {
                    const input = document.getElementById('username')
                    if (input) input.focus()
                  }, 400)
                }}
              >
                Jump to Editor Form ↑
              </button>
            </div>
          </section>

          {/* Full Page Footer */}
          <footer className="ts-footer">
            <div className="ts-footer-top">
              <div className="ts-footer-brand">
                <div className="ts-nav-logo">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="ts-brand-name">TimeSpot</span>
              </div>
              <div className="ts-footer-links">
                <div className="ts-footer-col">
                  <h4>Product</h4>
                  <a href="#features">Features</a>
                  <a href="#bento">Bento Grid</a>
                  <a href="#playground">Playground</a>
                  <a href="#pricing">Pricing</a>
                </div>
                <div className="ts-footer-col">
                  <h4>Technology</h4>
                  <span>Monaco Engine</span>
                  <span>Yjs CRDT Sync</span>
                  <span>Render Socket Backend</span>
                  <span>Local Storage Cache</span>
                </div>
                <div className="ts-footer-col">
                  <h4>Company</h4>
                  <span>About Zeesu Royalist</span>
                  <span>Privacy Policy</span>
                  <span>Terms of Service</span>
                  <span>Security</span>
                </div>
              </div>
            </div>
            <div className="ts-footer-bottom">
              <p>© 2026 TimeSpot CodeSync. All rights reserved.</p>
              <p className="ts-footer-credit">Built with precision for real-time developers worldwide.</p>
            </div>
          </footer>
        </div>
      </main>
    )
  }

  return (
    <main className="ts-landing-bg ts-workspace-bg">
      <div className="ts-landing-card ts-workspace-card">
        {/* Title Bar */}
        <header className="titlebar">
          <div className="titlebar-left">
            <div className="titlebar-dots">
              <span className="titlebar-dot dot-red" />
              <span className="titlebar-dot dot-yellow" />
              <span className="titlebar-dot dot-green" />
            </div>
            <div className="titlebar-brand">
              <div className="titlebar-logo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <span className="titlebar-brand-name">TimeSpot CodeSync</span>
            </div>
            <span className="titlebar-room-badge">session/monaco</span>
          </div>
          <div className="titlebar-right">
            <div className="titlebar-user-pill">
              <span className="titlebar-user-avatar" style={{ background: getAvatarColor(username) }}>
                {getInitials(username)}
              </span>
              <span className="titlebar-username">{username}</span>
            </div>
          </div>
        </header>

        <div className="workspace-body">
          {/* Activity Bar */}
          <nav className="activitybar">
            <div className="activitybar-icons">
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
            <div className="activitybar-spacer" />
            <div className="activitybar-icons">
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
              <button className="activity-item" title="Settings">
                <Icon.Settings />
              </button>
            </div>
          </nav>

          {/* Sidebar */}
          <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
            {activityView === 'explorer' && (
              <>
                <div className="sidebar-title">Explorer</div>
                <div className="sidebar-scroll">
                  <div className="explorer-project">
                    <span className="tree-chevron expanded"><Icon.Chevron /></span>
                    CODESYNC
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
              </>
            )}

            {activityView === 'search' && (
              <>
                <div className="sidebar-title">Search</div>
                <div className="panel-view-inner">
                  <div className="search-box">
                    <Icon.Search width="14" height="14" />
                    <input placeholder="Search across files" />
                  </div>
                  <p className="search-hint">Type to search across every open file in the workspace.</p>
                </div>
              </>
            )}

            {activityView === 'git' && (
              <>
                <div className="sidebar-title">Source Control</div>
                <div className="panel-view-inner">
                  <div className="scm-commit-box">Message (Cmd+Enter to commit)</div>
                  <div className="scm-section-label">Changes</div>
                  <div className="scm-file-row"><Icon.File color="#519aba" width="14" height="14" />App.jsx<span className="scm-status-m">M</span></div>
                  <div className="scm-file-row"><Icon.File color="#519aba" width="14" height="14" />App.css<span className="scm-status-m">M</span></div>
                </div>
              </>
            )}

            {activityView === 'debug' && (
              <>
                <div className="sidebar-title">Run and Debug</div>
                <div className="panel-view-inner">
                  <p className="search-hint">No configuration yet. Add a launch.json to start debugging main.js.</p>
                </div>
              </>
            )}

            {activityView === 'extensions' && (
              <>
                <div className="sidebar-title">Extensions</div>
                <div className="panel-view-inner">
                  {[
                    { name: 'Live Share', desc: 'Real-time collaborative editing and debugging', color: '#4fc3d9', installs: '18M installs' },
                    { name: 'Prettier', desc: 'Code formatter using prettier', color: '#89d185', installs: '42M installs' },
                    { name: 'ESLint', desc: 'Integrates ESLint into VS Code', color: '#c586c0', installs: '31M installs' },
                  ].map((ext) => (
                    <div className="ext-item" key={ext.name}>
                      <div className="ext-icon" style={{ background: ext.color }}>{ext.name[0]}</div>
                      <div>
                        <div className="ext-name">{ext.name}</div>
                        <div className="ext-desc">{ext.desc}</div>
                        <div className="ext-installs">{ext.installs}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activityView === 'liveshare' && (
              <>
                <div className="sidebar-title">Live Share</div>
                <div className="liveshare-session">
                  <div className="liveshare-session-title">
                    <Icon.People width="14" height="14" />
                    Session active
                  </div>
                  <div className="liveshare-session-sub">session/monaco · shared with {users.length} {users.length === 1 ? 'person' : 'people'}</div>
                </div>
                <div className="collab-section-label">Participants — {users.length}</div>
                <ul className="user-list">
                  {users.length === 0 ? (
                    <li className="user-empty">No one else is here yet</li>
                  ) : (
                    users.map((user, index) => (
                      <li key={index} className="user-item">
                        <span className="user-avatar" style={{ background: getAvatarColor(user.username) }}>
                          {getInitials(user.username)}
                        </span>
                        <div className="user-info">
                          <span className="user-name">{user.username}</span>
                          {user.username === username && <span className="user-you-tag">you</span>}
                        </div>
                        <span className="user-online-dot" />
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}
          </aside>

          {/* Editor + Panel column */}
          <section className="editor-area">
            <div className="editor-tab-bar">
              {openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`editor-tab ${activeTabId === tab.id ? 'active-tab' : ''}`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  <span className="tab-lang-dot" style={{ background: FILE_ICON_COLORS[tab.lang] || '#8a8a8a' }} />
                  <span>{tab.name}</span>
                  <span className="tab-close" onClick={(e) => closeTab(tab.id, e)}>
                    <Icon.Close />
                  </span>
                </div>
              ))}
            </div>

            <div className="editor-breadcrumb">
              <span>src</span>
              <span className="crumb-sep">›</span>
              <span className="crumb-current">{activeTab?.name || 'main.js'}</span>
            </div>

            {connectionError ? (
              <div
                role="status"
                style={{
                  padding: '10px 12px',
                  background: '#3b1f1f',
                  color: '#ffd8d8',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                  fontSize: 12,
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              >
                {connectionError}
              </div>
            ) : null}

            <div className="editor-container">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                defaultValue="// write your code here..."
                theme="vs-dark"
                onMount={handleMount}
                options={{
                  fontSize: 13.5,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  lineHeight: 22,
                  padding: { top: 16, bottom: 16 },
                  minimap: { enabled: true, scale: 1 },
                  scrollBeyondLastLine: false,
                  renderLineHighlight: "gutter",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true },
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  stickyScroll: { enabled: true },
                  tabSize: 2,
                }}
              />
            </div>

            {/* Bottom Panel: Terminal / Problems / Output */}
            <div className={`bottom-panel ${panelCollapsed ? 'panel-collapsed' : ''}`}>
              <div className="panel-tab-bar">
                {['terminal', 'problems', 'output', 'debug console'].map((tab) => (
                  <button
                    key={tab}
                    className={`panel-tab ${panelTab === tab ? 'active' : ''}`}
                    onClick={() => setPanelTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
                <div className="panel-tab-spacer" />
                <button className="panel-close-btn" onClick={() => setPanelCollapsed(true)} title="Close panel">
                  <Icon.Close width="13" height="13" />
                </button>
              </div>

              <div className="panel-body">
                {panelTab === 'terminal' && (
                  <>
                    <div className="terminal-line">
                      <span className="terminal-prompt">➜</span> <span className="terminal-path">codesync</span> git:(main) npm run dev
                    </div>
                    <div className="terminal-line">VITE ready in 341 ms</div>
                    <div className="terminal-line">Build by <a href='https://www.google.com/search?q=zeesu+royalist'>Zeesu Royalist</a></div>
                    <div className="terminal-line">➜ Local: http://localhost:5173/</div>
                    <div className="terminal-line">➜ Network: use --host to expose --zeesu_royalist</div>
                    <div className="terminal-line"><span className="terminal-cursor" /></div>
                  </>
                )}
                {panelTab === 'problems' && (
                  <div className="panel-empty-state">No problems have been detected in the workspace.</div>
                )}
                {panelTab === 'output' && (
                  <div className="panel-empty-state">No output yet.</div>
                )}
                {panelTab === 'debug console' && (
                  <div className="panel-empty-state">Start a debug session to see output here.</div>
                )}
              </div>
            </div>

            {/* Status Bar */}
            <div className="statusbar">
              <div className="statusbar-left">
                <span className="statusbar-item"><Icon.Branch />main</span>
                <span className="statusbar-item"><Icon.Error width="12" height="12" />0 &nbsp; ⚠ 0</span>
                <span
                  className="statusbar-item"
                  onClick={() => setPanelCollapsed((v) => !v)}
                  title={panelCollapsed ? 'Show panel' : 'Hide panel'}
                >
                  <Icon.Terminal /> Terminal
                </span>
              </div>
              <div className="statusbar-right">
                <div className="statusbar-collab">
                  <div className="statusbar-avatar-stack">
                    {users.slice(0, 4).map((u, i) => (
                      <span key={i} className="statusbar-avatar" style={{ background: getAvatarColor(u.username) }}>
                        {getInitials(u.username)}
                      </span>
                    ))}
                  </div>
                  <span>{users.length} online</span>
                </div>
                <span className="statusbar-item">{activeTab?.lang?.toUpperCase() || 'JS'}</span>
                <span className="statusbar-item">UTF-8</span>
                <span className="statusbar-item">LF</span>
                <span className="statusbar-item">Ln 1, Col 1</span>
                <span className="statusbar-item"><Icon.Bell /></span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default App