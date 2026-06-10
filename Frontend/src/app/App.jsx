import './App.css'
import { Editor } from "@monaco-editor/react"
import { useRef, useMemo, useState, useEffect } from 'react'  
import { MonacoBinding } from "y-monaco"
import { SocketIOProvider } from "y-socket.io"
import * as Y from "yjs"

function App() {
  const eidtorRef = useRef(null)
  const providerRef = useRef(null) 
  const bindingRef = useRef(null)
  const handleBeforeUnloadRef = useRef(null)

  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })
  const [users, setUsers] = useState([])

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy()
      providerRef.current?.disconnect()
      if (handleBeforeUnloadRef.current) {
        window.removeEventListener("beforeunload", handleBeforeUnloadRef.current)
      }
      ydoc.destroy()
    }
  }, [ydoc])

  const handleMount = (editor) => {
    eidtorRef.current = editor

    bindingRef.current?.destroy()
    providerRef.current?.disconnect()
    if (handleBeforeUnloadRef.current) {
      window.removeEventListener("beforeunload", handleBeforeUnloadRef.current)
    }

    const provider = new SocketIOProvider("/", "monaco", ydoc, {
      autoConnect: true,
    })
    providerRef.current = provider

    provider.awareness.setLocalStateField("user", { username })

    const states = Array.from(provider.awareness.getStates().values())
    setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))

    provider.awareness.on("change", () => {
      const states = Array.from(provider.awareness.getStates().values())
      setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))
    })

    function handleBeforeUnload() {
      provider.awareness.setLocalStateField("user", null)
    }
    handleBeforeUnloadRef.current = handleBeforeUnload
    window.addEventListener("beforeunload", handleBeforeUnload)

    const monacoBinding = new MonacoBinding(
      yText,
      eidtorRef.current.getModel(),
      new Set([eidtorRef.current]),
      provider.awareness
    )
    bindingRef.current = monacoBinding
  }

  const handleJoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({}, "", "?username=" + e.target.username.value)
  }

  const AVATAR_COLORS = [
    "#4E9FD1", "#7B6CF6", "#E06C75", "#56B6C2",
    "#98C379", "#E5C07B", "#D19A66", "#C678DD"
  ]

  const getAvatarColor = (name) => {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
  }

  const getInitials = (name) => {
    return name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)
  }

  if (!username) {
    return (
      <main className="join-screen">
        <div className="join-card">
          <div className="join-header">
            <div className="join-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M21 3L12 12M21 3H15M21 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 8L4 12L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 8L14 12L11 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="join-app-name">CodeSync</span>
          </div>

          <div className="join-divider" />

          <h1 className="join-title">Join Session</h1>
          <p className="join-subtitle">Enter your display name to begin collaborating</p>

          <form onSubmit={handleJoin} className="join-form">
            <div className="input-group">
              <label className="input-label" htmlFor="username">Display Name</label>
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
            <button type="submit" className="join-btn">
              Enter Workspace
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="workspace">
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-logo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 8L4 12L7 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 8L14 12L11 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="topbar-name">CodeSync</span>
          <div className="topbar-sep" />
          <span className="topbar-session">Session: <span className="session-id">monaco</span></span>
        </div>
        <div className="topbar-right">
          <div className="topbar-status">
            <span className="status-dot" />
            <span className="status-text">Live</span>
          </div>
          <div className="topbar-user">
            <span className="topbar-user-avatar" style={{ background: getAvatarColor(username) }}>
              {getInitials(username)}
            </span>
            <span className="topbar-username">{username}</span>
          </div>
        </div>
      </header>

      <div className="workspace-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section-header">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M2 13C2 10.79 4.69 9 8 9C11.31 9 14 10.79 14 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span>COLLABORATORS</span>
            <span className="user-count">{users.length}</span>
          </div>

          <ul className="user-list">
            {users.length === 0 ? (
              <li className="user-empty">No active users</li>
            ) : (
              users.map((user, index) => (
                <li key={index} className="user-item">
                  <span
                    className="user-avatar"
                    style={{ background: getAvatarColor(user.username) }}
                  >
                    {getInitials(user.username)}
                  </span>
                  <div className="user-info">
                    <span className="user-name">{user.username}</span>
                    {user.username === username && (
                      <span className="user-you-tag">you</span>
                    )}
                  </div>
                  <span className="user-online-dot" />
                </li>
              ))
            )}
          </ul>

          <div className="sidebar-footer">
            <div className="sidebar-footer-row">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M8 5V8.5L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>Auto-syncing</span>
            </div>
          </div>
        </aside>

        {/* Editor Area */}
        <section className="editor-area">
          <div className="editor-tab-bar">
            <div className="editor-tab active-tab">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3 2H13C13.55 2 14 2.45 14 3V13C14 13.55 13.55 14 13 14H3C2.45 14 2 13.55 2 13V3C2 2.45 2.45 2 3 2Z" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 6H11M5 9H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>main.js</span>
            </div>
          </div>

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

          <div className="statusbar">
            <div className="statusbar-left">
              <span className="statusbar-item">JavaScript</span>
              <span className="statusbar-sep">·</span>
              <span className="statusbar-item">UTF-8</span>
              <span className="statusbar-sep">·</span>
              <span className="statusbar-item">LF</span>
            </div>
            <div className="statusbar-right">
              <span className="statusbar-item">Spaces: 2</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App