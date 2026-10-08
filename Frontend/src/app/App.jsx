import './App.css'
import { Editor } from '@monaco-editor/react'
import { LogOut, Menu, X, Phone, Mail, MessageSquare, ArrowUpRight } from "lucide-react";
import { useRef, useMemo, useState, useEffect } from 'react'
import { MonacoBinding } from 'y-monaco'
import * as Y from 'yjs'
import { createRealtimeProvider, updateAwarenessUser } from './realtime'

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

/* ────────────────────────────────────────────────
   Marketeam Hero Section Data & Custom Hooks
──────────────────────────────────────────────── */
function useCountUp(endValue = 20, duration = 2000, delay = 1200) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let animationFrameId
    let startTimestamp = null
    const timerId = setTimeout(() => {
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        const currentVal = Math.floor(easedProgress * endValue)
        setCount(currentVal)

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step)
        } else {
          setCount(endValue)
        }
      }
      animationFrameId = requestAnimationFrame(step)
    }, delay)

    return () => {
      clearTimeout(timerId)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [endValue, duration, delay])

  return count
}

function TypewriterHeading({
  text = "Real-Time Collaborative Code Editor for Dev Teams, Code on One Shared Codebase Live",
  darkCharCount = 53,
  typingSpeed = 35,
  startDelay = 400,
}) {
  const [displayedCount, setDisplayedCount] = useState(0)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    let intervalId
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setDisplayedCount((prev) => {
          if (prev < text.length) {
            return prev + 1
          } else {
            clearInterval(intervalId)
            setIsDone(true)
            return prev
          }
        })
      }, typingSpeed)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [text, typingSpeed, startDelay])

  const darkPart = text.slice(0, Math.min(displayedCount, darkCharCount))
  const lightPart = displayedCount > darkCharCount ? text.slice(darkCharCount, displayedCount) : ""

  return (
    <h1 className="marketeam-hero-heading">
      <span className="heading-dark-text">{darkPart}</span>
      <span className="heading-light-text">{lightPart}</span>
      <span className={`typewriter-cursor ${isDone ? "is-complete" : ""}`} />
    </h1>
  )
}

const ORBIT_AVATARS = [
  // Orbit 1 (diameter 353px, radius 176.5px, angle 270deg)
  {
    orbit: 1,
    angle: 270,
    radius: 176.5,
    size: 58,
    isSquare: true,
    borderRadius: '20px',
    glow: 'rgba(160, 104, 255, 0.85)',
    delay: '0.6s',
    src: 'https://zeesuroyalist.weebly.com/uploads/1/3/2/0/132055210/08c46336-6469-4f04-a253-b65a25dd62b6_orig.jpeg',
  },
  // Orbit 2 (diameter 501px, radius 250.5px)
  {
    orbit: 2,
    angle: 60,
    radius: 250.5,
    size: 58,
    isSquare: false,
    borderRadius: '50%',
    glow: 'rgba(250, 204, 21, 0.85)',
    delay: '0.8s',
    src: 'https://res.cloudinary.com/qtxwjzre/image/upload/v1784094320/card2_ma97sy.jpg',
  },
  {
    orbit: 2,
    angle: 180,
    radius: 250.5,
    size: 78,
    isSquare: false,
    borderRadius: '50%',
    glow: 'rgba(244, 114, 182, 0.85)',
    delay: '1.0s',
    src: 'https://res.cloudinary.com/qtxwjzre/image/upload/v1784094319/1778755271207_fncykm.jpg',
  },
  {
    orbit: 2,
    angle: 300,
    radius: 250.5,
    size: 58,
    isSquare: true,
    borderRadius: '20px',
    glow: 'rgba(56, 189, 248, 0.85)',
    delay: '1.2s',
    src: 'https://res.cloudinary.com/qtxwjzre/image/upload/v1784094321/card3_thiwgl.jpg',
  },
  // Orbit 3 (diameter 649px, radius 324.5px)
  {
    orbit: 3,
    angle: 130,
    radius: 324.5,
    size: 88,
    isSquare: false,
    borderRadius: '50%',
    glow: 'rgba(236, 72, 153, 0.85)',
    delay: '1.5s',
    src: 'https://res.cloudinary.com/qtxwjzre/image/upload/v1784094320/card44_nkenif.jpg',
  },
  // Orbit 4 (diameter 797px, radius 398.5px)
  {
    orbit: 4,
    angle: 30,
    radius: 398.5,
    size: 58,
    isSquare: false,
    borderRadius: '50%',
    glow: 'rgba(160, 104, 255, 0.85)',
    delay: '1.7s',
    src: 'https://zeesuroyalist.weebly.com/uploads/1/3/2/0/132055210/08c46336-6469-4f04-a253-b65a25dd62b6_orig.jpeg',
  },
  {
    orbit: 4,
    angle: 95,
    radius: 398.5,
    size: 88,
    isSquare: true,
    borderRadius: '24px',
    glow: 'rgba(251, 146, 60, 0.85)',
    delay: '1.9s',
    src: 'https://res.cloudinary.com/qtxwjzre/image/upload/v1784094320/card2_ma97sy.jpg',
  },
  {
    orbit: 4,
    angle: 220,
    radius: 398.5,
    size: 88,
    isSquare: true,
    borderRadius: '24px',
    glow: 'rgba(244, 63, 94, 0.85)',
    delay: '2.1s',
    src: 'https://res.cloudinary.com/qtxwjzre/image/upload/v1784094319/1778755271207_fncykm.jpg',
  },
  {
    orbit: 4,
    angle: 320,
    radius: 398.5,
    size: 58,
    isSquare: false,
    borderRadius: '50%',
    glow: 'rgba(160, 104, 255, 0.85)',
    delay: '2.3s',
    src: 'https://res.cloudinary.com/qtxwjzre/image/upload/v1784094321/card3_thiwgl.jpg',
  },
]

const TICKER_LOGOS = [
  'https://polo-pecan-73837341.figma.site/_assets/v11/1e7b0e6fcc016cd28aec5c68990118b8c54c35a5.svg',
  'https://polo-pecan-73837341.figma.site/_assets/v11/3eac03c183db2ae080d910159211c14843398b61.svg',
  'https://polo-pecan-73837341.figma.site/_assets/v11/17705a4c0023a0e5a99154dfb10582adbbf4260b.svg',
  'https://polo-pecan-73837341.figma.site/_assets/v11/0e5f442b09dc5c248e3e60d40a65505fb1887228.svg',
  'https://polo-pecan-73837341.figma.site/_assets/v11/63f99030ceb459e3c9ab9e429cfa2353491d3816.svg',
]

function MarketeamLogoTicker() {
  const quadLogos = [...TICKER_LOGOS, ...TICKER_LOGOS, ...TICKER_LOGOS, ...TICKER_LOGOS]
  return (
    <div className="marketeam-ticker-strip">
      <div className="ticker-fade-mask">
        <div className="ticker-inner-track">
          {quadLogos.map((src, idx) => (
            <div key={idx} className="ticker-logo-item">
              <img src={src} alt={`Partner Logo ${idx + 1}`} className="ticker-logo-img" />
            </div>
          ))}
        </div>
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
    if (typeof window === 'undefined') return ''
    const urlUser = new URLSearchParams(window.location.search).get('username')
    if (urlUser) return urlUser
    try {
      return localStorage.getItem('zeecode_username') || ''
    } catch {
      return ''
    }
  })
  const [nameInput, setNameInput] = useState(() => {
    if (typeof window === 'undefined') return ''
    try {
      return localStorage.getItem('zeecode_username') || ''
    } catch {
      return ''
    }
  })
  const [nameError, setNameError] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')

  // Editor cursor position tracking (Ln X, Col Y)
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })

  // Realtime & Workspace state
  const [users, setUsers] = useState(() => (username ? [{ username }] : []))
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

  // Keep users array and awareness updated whenever username changes
  useEffect(() => {
    if (!username) {
      setUsers([])
      return
    }

    setUsers((prev) => {
      if (prev.some((u) => u.username === username)) return prev
      return [{ username }, ...prev]
    })

    if (providerRef.current?.awareness) {
      updateAwarenessUser(providerRef.current, username)
    }
  }, [username])

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
      if (username) {
        setUsers([{ username }])
      }
      return
    }

    providerRef.current = provider

    const handleAwarenessChange = () => {
      const states = Array.from(provider.awareness.getStates().values())
      let participants = states
        .filter((state) => state.user && state.user.username)
        .map((state) => state.user)

      if (username && !participants.some((u) => u.username === username)) {
        participants = [{ username }, ...participants]
      }
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

    try {
      localStorage.setItem('zeecode_username', trimmed)
    } catch (err) {
      console.warn('Unable to persist username', err)
    }

    setTimeout(() => {
      setUsername(trimmed)
      setUsers((prev) => {
        if (prev.some((u) => u.username === trimmed)) return prev
        return [{ username: trimmed }, ...prev]
      })
      window.history.pushState({}, "", "?username=" + encodeURIComponent(trimmed))
      setIsTransitioning(false)
      setShowJoinModal(false)
    }, 300)
  }

  const handleLogout = (e) => {
    if (e) e.preventDefault()
    try {
      localStorage.removeItem('zeecode_username')
    } catch (err) {
      console.warn('Unable to clear username', err)
    }
    if (providerRef.current?.awareness) {
      providerRef.current.awareness.setLocalStateField('user', null)
    }
    setUsername('')
    setUsers([])
    window.history.pushState({}, "", window.location.pathname)
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

        {/* Marketeam Top Viewport Hero Section */}
        <div className="marketeam-hero-root">
          {/* Header */}
          <header className="marketeam-header">
            <div className="marketeam-header-left">
              <a href="/" className="marketeam-logo-link" aria-label="ZeesCode Home">
                <Icon.BrandLogo width="26" height="26" />
                <span className="marketeam-brand-name">ZeesCode</span>
              </a>
              <nav className="marketeam-nav-links">
                <a href="#features" className="marketeam-nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#demo" className="marketeam-nav-link" onClick={() => setMobileMenuOpen(false)}>Live Demo</a>
                <a href="#how-it-works" className="marketeam-nav-link" onClick={() => setMobileMenuOpen(false)}>Workflow</a>
                <a href="#pricing" className="marketeam-nav-link" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              </nav>
            </div>

            <div className="marketeam-header-right">
              <button className="marketeam-login-link desktop-only" onClick={openModal}>
                Log In
              </button>
              <div className="btn-border-wrap desktop-only">
                <button className="btn-join-now" onClick={openModal}>
                  Join Now
                </button>
              </div>
              <button
                className="mobile-hamburger-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </button>
            </div>
          </header>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="marketeam-mobile-drawer">
              <a href="#features" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#demo" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Live Demo</a>
              <a href="#how-it-works" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Workflow</a>
              <a href="#pricing" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <div className="mobile-drawer-actions">
                <button className="marketeam-login-link" onClick={openModal}>Log In</button>
                <div className="btn-border-wrap">
                  <button className="btn-join-now" onClick={openModal}>Join Now</button>
                </div>
              </div>
            </div>
          )}

          {/* Main Hero Container */}
          <section className="marketeam-hero-main">
            {/* Hero Left */}
            <div className="marketeam-hero-left">
              <TypewriterHeading
                text="Real-Time Collaborative Code Editor for Dev Teams, Code on One Shared Codebase Live"
                darkCharCount={53}
                typingSpeed={35}
                startDelay={400}
              />

              <div className="hero-cta-group">
                <div className="hero-btn-row">
                  <div className="btn-border-wrap start-btn-wrap">
                    <button className="btn-start-project" onClick={openModal}>
                      <span>Start Live Coding</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>

                  {/* Zeesu Portfolio Cursor Badge */}
                  <a
                    href="http://zeesu-royalist.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="david-cursor-badge"
                    title="Visit Zeesu's Portfolio"
                  >
                    <span className="david-tag-label">Zeesu Royalist</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Hero Right: 4 Concentric Orbit Circles Visualization */}
            <div className="marketeam-hero-right">
              <div className="marketeam-circles-container">
                {/* 4 Concentric Perfectly Round Circles */}
                <div className="orbit-full-circle ring-diam-353"></div>
                <div className="orbit-full-circle ring-diam-501"></div>
                <div className="orbit-full-circle ring-diam-649"></div>
                <div className="orbit-full-circle ring-diam-797"></div>

                {/* Center Circle Stat: Count-up "20k+" Developers */}
                <div className="marketeam-center-stat">
                  <div className="center-stat-number">{useCountUp(20, 2000, 1200)}k+</div>
                  <div className="center-stat-label">Developers</div>
                </div>

                {/* Orbit 1 Avatars Spin Layer (353px, counter-clockwise 30s) */}
                <div className="orbit-spin-layer orbit-spin-layer-1">
                  {ORBIT_AVATARS.filter((a) => a.orbit === 1).map((avatar, idx) => (
                    <div
                      key={`orb1-${idx}`}
                      className="orbit-avatar-anchor"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${avatar.angle}deg) translate(${avatar.radius}px) rotate(-${avatar.angle}deg)`,
                      }}
                    >
                      <div className="orbit-avatar-counter-spin-30">
                        <div
                          className="orbit-avatar-box"
                          style={{
                            width: `${avatar.size}px`,
                            height: `${avatar.size}px`,
                            borderRadius: avatar.borderRadius,
                            boxShadow: `0 0 26px ${avatar.glow}`,
                          }}
                        >
                          <img
                            src={avatar.src}
                            alt="Talent Specialist"
                            className="orbit-avatar-img"
                            style={{
                              borderRadius: avatar.borderRadius,
                              animationDelay: avatar.delay,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Orbit 2 Avatars Spin Layer (501px, clockwise 40s) */}
                <div className="orbit-spin-layer orbit-spin-layer-2">
                  {ORBIT_AVATARS.filter((a) => a.orbit === 2).map((avatar, idx) => (
                    <div
                      key={`orb2-${idx}`}
                      className="orbit-avatar-anchor"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${avatar.angle}deg) translate(${avatar.radius}px) rotate(-${avatar.angle}deg)`,
                      }}
                    >
                      <div className="orbit-avatar-counter-spin-40">
                        <div
                          className="orbit-avatar-box"
                          style={{
                            width: `${avatar.size}px`,
                            height: `${avatar.size}px`,
                            borderRadius: avatar.borderRadius,
                            boxShadow: `0 0 26px ${avatar.glow}`,
                          }}
                        >
                          <img
                            src={avatar.src}
                            alt="Talent Specialist"
                            className="orbit-avatar-img"
                            style={{
                              borderRadius: avatar.borderRadius,
                              animationDelay: avatar.delay,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Orbit 3 Avatars Spin Layer (649px, clockwise 50s) */}
                <div className="orbit-spin-layer orbit-spin-layer-3">
                  {ORBIT_AVATARS.filter((a) => a.orbit === 3).map((avatar, idx) => (
                    <div
                      key={`orb3-${idx}`}
                      className="orbit-avatar-anchor"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${avatar.angle}deg) translate(${avatar.radius}px) rotate(-${avatar.angle}deg)`,
                      }}
                    >
                      <div className="orbit-avatar-counter-spin-50">
                        <div
                          className="orbit-avatar-box"
                          style={{
                            width: `${avatar.size}px`,
                            height: `${avatar.size}px`,
                            borderRadius: avatar.borderRadius,
                            boxShadow: `0 0 26px ${avatar.glow}`,
                          }}
                        >
                          <img
                            src={avatar.src}
                            alt="Talent Specialist"
                            className="orbit-avatar-img"
                            style={{
                              borderRadius: avatar.borderRadius,
                              animationDelay: avatar.delay,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Orbit 4 Avatars Spin Layer (797px, counter-clockwise 60s) */}
                <div className="orbit-spin-layer orbit-spin-layer-4">
                  {ORBIT_AVATARS.filter((a) => a.orbit === 4).map((avatar, idx) => (
                    <div
                      key={`orb4-${idx}`}
                      className="orbit-avatar-anchor"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${avatar.angle}deg) translate(${avatar.radius}px) rotate(-${avatar.angle}deg)`,
                      }}
                    >
                      <div className="orbit-avatar-counter-spin-60">
                        <div
                          className="orbit-avatar-box"
                          style={{
                            width: `${avatar.size}px`,
                            height: `${avatar.size}px`,
                            borderRadius: avatar.borderRadius,
                            boxShadow: `0 0 26px ${avatar.glow}`,
                          }}
                        >
                          <img
                            src={avatar.src}
                            alt="Talent Specialist"
                            className="orbit-avatar-img"
                            style={{
                              borderRadius: avatar.borderRadius,
                              animationDelay: avatar.delay,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Logo Ticker Strip */}
          <footer className="marketeam-ticker-section">
            <MarketeamLogoTicker />
          </footer>
        </div>

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

        {/* Comprehensive Footer Matching Reference Design */}
        <footer className="landing-footer-v2">
          {/* Top Section: Brand Overview + Newsletter Subscription */}
          <div className="footer-header-section">
            <div className="footer-brand-block">
              <div className="footer-logo-row">
                <Icon.BrandLogo width="36" height="36" />
                <span className="footer-brand-title">ZeesCODE</span>
              </div>
              <p className="footer-brand-desc">
                ZeesCode is a modern collaborative real-time code editor focused on building powerful developer experiences through live multi-user editing, seamless workspace synchronization, and instant code execution.
              </p>
            </div>

            <div className="footer-newsletter-block">
              <h3 className="newsletter-title">Subscribe to Our Newsletter</h3>
              <form
                className="newsletter-pill-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newsletterEmail.trim()) {
                    setToast({ visible: true, message: "Thank you for subscribing to ZeesCode newsletter!", type: "success" });
                    setTimeout(() => setToast({ visible: false, message: "", type: "info" }), 4000);
                    setNewsletterEmail("");
                  }
                }}
              >
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit" className="newsletter-submit-btn">
                  <span>Subscribe</span>
                  <ArrowUpRight size={16} />
                </button>
              </form>
              <p className="newsletter-disclaimer">No spam. Just great content.</p>
            </div>
          </div>

          {/* 6-Column Navigation & Contact Grid */}
          <div className="footer-columns-grid">
            <div className="footer-column">
              <h4 className="footer-col-heading">Main Pages</h4>
              <ul className="footer-link-list">
                <li><a href="#features" onClick={() => openModal()}>About</a></li>
                <li><a href="#demo" onClick={() => openModal()}>Work</a></li>
                <li><a href="#features">Services</a></li>
                <li><a href="#how-it-works" onClick={() => openModal()}>Blog</a></li>
                <li><a href="mailto:help@zeesco.de">Contact</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-col-heading">CMS Pages</h4>
              <ul className="footer-link-list">
                <li><a href="#demo" onClick={() => openModal()}>Work Details</a></li>
                <li><a href="#demo" onClick={() => openModal()}>Blog Details</a></li>
                <li><a href="#demo" onClick={() => openModal()}>Live Session</a></li>
                <li><a href="#demo" onClick={() => openModal()}>Templates</a></li>
              </ul>
            </div>

            <div className="footer-column footer-utility-col">
              <h4 className="footer-col-heading">Utility Pages</h4>
              <ul className="footer-link-list">
                <li><a href="#demo" onClick={() => openModal()}>404</a></li>
                <li><a href="#pricing" onClick={() => openModal()}>Coming Soon</a></li>
                <li><a href="#features" onClick={() => openModal()}>Documentation</a></li>
                <li><a href="#status" onClick={() => openModal()}>System Status</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-col-heading">Legal</h4>
              <ul className="footer-link-list">
                <li><a href="#privacy" onClick={() => openModal()}>Privacy Policy</a></li>
                <li><a href="#terms" onClick={() => openModal()}>Terms & Conditions</a></li>
                <li><a href="#security" onClick={() => openModal()}>Security Protocol</a></li>
                <li><a href="#cookies" onClick={() => openModal()}>Cookie Settings</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-col-heading">Social Links</h4>
              <ul className="footer-link-list">
                <li><a href="https://github.com/zeesuroyalist" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter / X</a></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              </ul>
            </div>

            <div className="footer-column footer-contact-col">
              <h4 className="footer-col-heading">Have a question?</h4>
              <div className="footer-contact-items">
                <div className="footer-contact-item">
                  <div className="contact-item-icon">
                    <Phone size={15} />
                  </div>
                  <div className="contact-item-text">
                    <span className="contact-main-info">+91 (0) 800-ZEESCODE</span>
                    <span className="contact-sub-info">Monday to Friday, 9am to 5pm</span>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <div className="contact-item-icon">
                    <MessageSquare size={15} />
                  </div>
                  <div className="contact-item-text">
                    <a href="mailto:help@zeesco.de" className="contact-main-info">help@zeesco.de</a>
                    <span className="contact-sub-info">We aim to reply in 24 hours</span>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <div className="contact-item-icon">
                    <Mail size={15} />
                  </div>
                  <div className="contact-item-text">
                    <a href="mailto:press@zeesco.de" className="contact-main-info">press@zeesco.de</a>
                    <span className="contact-sub-info">Press and media inquiries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Giant Watermark Brand Text at Bottom ("ZEESCODE") */}
          <div className="footer-giant-watermark-wrap">
            <h1 className="footer-giant-watermark-text">Zeesu.Royalist</h1>
          </div>

          {/* Bottom Bar: Copyright & System Status */}
          <div className="footer-bottom-bar">
            <div className="footer-bottom-badge">
              <span className="footer-mini-badge">Z</span>
              <span>© {new Date().getFullYear()} ZeesCode • Designed & Built by Zeesu Royalist. All rights reserved.</span>
            </div>
            <div className="footer-status">
              <span>Zeesu Royalist</span>
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
            <button
              onClick={handleLogout}
              className="activity-item"
              title="Logout"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LogOut className="w-4 h-4 text-purple-300 hover:text-white transition-colors" />
            </button>
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