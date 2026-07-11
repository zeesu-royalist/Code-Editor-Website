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
      <path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M13 3v5h5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  ),
  Search: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M20 20L15.2 15.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Git: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="7" cy="6" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="17" cy="12" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 8v8M7 8c0 3 3 3.5 8 4" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  Debug: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M8 6l9 6-9 6V6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  ),
  Extensions: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M14 4h-4v3H7a2 2 0 0 0-2 2v3h3v4H5v3a2 2 0 0 0 2 2h3v-3h4v3h3a2 2 0 0 0 2-2v-3h-3v-4h3V9a2 2 0 0 0-2-2h-3V4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  People: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="17.5" cy="8.5" r="2.3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M15.5 14.3c2.6.3 4.5 2.2 4.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Settings: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Chevron: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Folder: (p) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M1.5 3.5h4l1.2 1.5h7.3a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1h-11.5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" fill="#dcb67a" stroke="#dcb67a" strokeWidth="0.5"/>
    </svg>
  ),
  File: ({ color = '#519aba', ...p }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M3.5 1.5h5.6L12.5 5v9.5a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" stroke={color} strokeWidth="1.1"/>
      <path d="M9 1.5V5h3.5" stroke={color} strokeWidth="1.1"/>
    </svg>
  ),
  Close: (p) => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Terminal: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M2 3h12v10H2V3Z" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4 6l2.5 2.5L4 11M8 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Branch: (p) => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" {...p}>
      <circle cx="4.5" cy="4" r="1.6" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="4.5" cy="12" r="1.6" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="11.5" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 5.6v4.8M4.5 5.6c0 2 3 2.3 5.6 2.6" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  Error: (p) => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" {...p}>
      <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 5v4M8 11v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Bell: (p) => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M4 12V7a4 4 0 0 1 8 0v5l1.2 1.6H2.8L4 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M6.5 14a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.2"/>
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

const AVATAR_COLORS = ["#4fc3d9", "#e2a05f", "#89d185", "#c586c0", "#3794ff", "#f14c4c", "#cca700", "#5ec9f8"]

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

  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get('username') || ''
  })
  const [users, setUsers] = useState([])
  const [connectionError, setConnectionError] = useState('')

  // ── VS Code shell chrome state ──
  const [activityView, setActivityView] = useState('explorer')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [panelTab, setPanelTab] = useState('terminal')
  const [expanded, setExpanded] = useState(() => new Set(['src']))
  const [openTabs, setOpenTabs] = useState([{ id: 'main.js', name: 'main.js', lang: 'js' }])
  const [activeTabId, setActiveTabId] = useState('main.js')

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy()
      providerRef.current?.destroy()

      if (handleBeforeUnloadRef.current) {
        window.removeEventListener('beforeunload', handleBeforeUnloadRef.current)
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
    return (
      <main className="join-screen">
        <div className="join-card">
          <div className="join-card-inner">
            <div className="join-header">
              <div className="join-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M21 3L12 12M21 3H15M21 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 8L4 12L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 8L14 12L11 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="join-app-name">CodeSync</span>
              <span className="join-badge">Online</span>
            </div>

            <div className="join-divider" />

            <div className="join-eyebrow">COLLABORATIVE EDITOR</div>
            <h1 className="join-title">Join the workspace</h1>
            <p className="join-subtitle">Enter a display name to open the editor and start pairing with your team in real time.</p>

            <form onSubmit={handleJoin} className="join-form">
              <div className="input-group">
                <label className="input-label" htmlFor="username">Display Name</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="e.g. Arjun Sharma"
                    className="join-input"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="join-btn">
                Open Editor
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </div>

          <div className="join-footer">
            <div className="join-feature"><span className="join-feature-dot" />Real-time sync</div>
            <div className="join-feature"><span className="join-feature-dot" />Multi-user</div>
            <div className="join-feature"><span className="join-feature-dot" />Monaco Editor</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="workspace">
      {/* Title Bar */}
      <div className="titlebar">
        <div className="titlebar-left">
          <div className="titlebar-dots">
            <span className="titlebar-dot dot-red" />
            <span className="titlebar-dot dot-yellow" />
            <span className="titlebar-dot dot-green" />
          </div>
          <span className="titlebar-title">CodeSync — session/monaco</span>
        </div>
        <div className="titlebar-right">
          <div className="titlebar-user">
            <span className="titlebar-user-avatar" style={{ background: getAvatarColor(username) }}>
              {getInitials(username)}
            </span>
            {username}
          </div>
        </div>
      </div>

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
                  <div className="terminal-line">➜ Local: http://localhost:5173/</div>
                  <div className="terminal-line">➜ Network: use --host to expose</div>
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
    </main>
  )
}

export default App