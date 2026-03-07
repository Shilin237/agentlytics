import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, FolderOpen } from 'lucide-react'
import KpiCard from '../components/KpiCard'
import EditorDot from '../components/EditorDot'
import SectionTitle from '../components/SectionTitle'
import EditorBreakdown from '../components/EditorBreakdown'
import ModelBreakdown from '../components/ModelBreakdown'
import ChatSidebar from '../components/ChatSidebar'
import LiveFeed from '../components/LiveFeed'
import { formatNumber, formatDate } from '../lib/constants'
import { fetchRelayUserActivity, fetchRelaySession } from '../lib/api'

export default function RelayUserDetail() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState(null)
  const [selectedChat, setSelectedChat] = useState(null)

  useEffect(() => {
    if (username) {
      fetchRelayUserActivity(username, { limit: 200 }).then(setSessions)
    }
  }, [username])

  const fetchFn = useCallback(
    (id) => fetchRelaySession(id, username),
    [username]
  )

  if (!sessions) return <div className="text-sm py-12 text-center" style={{ color: 'var(--c-text2)' }}>loading...</div>

  // Aggregate stats
  const totalSessions = sessions.length
  const totalMessages = sessions.reduce((s, c) => s + (c.totalMessages || 0), 0)
  const totalInputTokens = sessions.reduce((s, c) => s + (c.totalInputTokens || 0), 0)
  const totalOutputTokens = sessions.reduce((s, c) => s + (c.totalOutputTokens || 0), 0)

  // Editor breakdown
  const editorMap = {}
  for (const s of sessions) {
    if (s.source) editorMap[s.source] = (editorMap[s.source] || 0) + 1
  }
  const editors = Object.entries(editorMap).sort((a, b) => b[1] - a[1])

  // Project breakdown
  const projectMap = {}
  for (const s of sessions) {
    if (s.folder) {
      if (!projectMap[s.folder]) projectMap[s.folder] = { count: 0, lastActive: 0 }
      projectMap[s.folder].count++
      if (s.lastUpdatedAt > projectMap[s.folder].lastActive) projectMap[s.folder].lastActive = s.lastUpdatedAt
    }
  }
  const projects = Object.entries(projectMap).sort((a, b) => b[1].count - a[1].count)

  // Model breakdown
  const modelMap = {}
  for (const s of sessions) {
    if (s.models) {
      for (const m of s.models) modelMap[m] = (modelMap[m] || 0) + 1
    }
  }
  const models = Object.entries(modelMap).sort((a, b) => b[1] - a[1]).slice(0, 10)

  const handleFeedClick = (chatId, feedUsername) => {
    setSelectedChat(chatId)
  }

  return (
    <div className="fade-in flex gap-4">
    {/* ── Main content ── */}
    <div className="flex-1 min-w-0 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 transition hover:bg-[var(--c-card)]"
          style={{ border: '1px solid var(--c-border)', color: 'var(--c-text2)' }}
        >
          <ArrowLeft size={14} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center text-[13px] font-bold" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[13px] font-bold" style={{ color: 'var(--c-white)' }}>{username}</div>
            <div className="text-[9px]" style={{ color: 'var(--c-text3)' }}>Team Member</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        <KpiCard label="Sessions" value={totalSessions} />
        <KpiCard label="Messages" value={formatNumber(totalMessages)} />
        <KpiCard label="Editors" value={editors.length} />
        <KpiCard label="Projects" value={projects.length} />
        <KpiCard label="Input Tokens" value={formatNumber(totalInputTokens)} />
        <KpiCard label="Output Tokens" value={formatNumber(totalOutputTokens)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editors */}
        <div className="card p-3">
          <SectionTitle>Editors</SectionTitle>
          <EditorBreakdown editors={editors} total={totalSessions} />
        </div>

        {/* Models */}
        <div className="card p-3">
          <SectionTitle>Models Used</SectionTitle>
          <ModelBreakdown models={models} />
        </div>
      </div>

      {/* Projects */}
      {projects.length > 0 && (
        <div className="card p-3">
          <SectionTitle>Projects</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {projects.map(([folder, info]) => (
              <div key={folder} className="card px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <FolderOpen size={10} style={{ color: '#818cf8' }} />
                  <span className="text-[10px] font-medium truncate" style={{ color: 'var(--c-white)' }}>{folder.split('/').pop()}</span>
                </div>
                <div className="text-[9px]" style={{ color: 'var(--c-text3)' }}>{folder}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px]" style={{ color: 'var(--c-text2)' }}>{info.count} sessions</span>
                  <span className="text-[9px]" style={{ color: 'var(--c-text3)' }}>{formatDate(info.lastActive)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions list */}
      <div className="card p-3">
        <SectionTitle>Recent Sessions</SectionTitle>
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin space-y-1">
          {sessions.map(s => (
            <div
              key={s.id}
              className="card px-3 py-2 cursor-pointer hover:border-[var(--c-card-hover)] transition"
              onClick={() => setSelectedChat(s.id)}
            >
              <div className="flex items-center gap-2">
                <EditorDot source={s.source} size={6} />
                <span className="text-[10px] font-medium truncate flex-1" style={{ color: 'var(--c-white)' }}>
                  {s.name || 'Untitled'}
                </span>
                {s.mode && (
                  <span className="text-[8px] px-1.5 py-0.5" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>{s.mode}</span>
                )}
                <span className="text-[9px]" style={{ color: 'var(--c-text3)' }}>{formatDate(s.lastUpdatedAt)}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                {s.totalMessages > 0 && (
                  <span className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--c-text3)' }}>
                    <MessageSquare size={8} /> {s.totalMessages}
                  </span>
                )}
                {s.folder && (
                  <span className="flex items-center gap-1 text-[9px] truncate" style={{ color: 'var(--c-text3)' }}>
                    <FolderOpen size={8} /> {s.folder.split('/').pop()}
                  </span>
                )}
                {s.models && s.models.length > 0 && (
                  <span className="text-[8px] px-1" style={{ color: '#818cf8' }}>{[...new Set(s.models)][0]}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>

      {/* ── Live Feed (right column) ── */}
      <div
        className="hidden xl:block w-[280px] shrink-0 card sticky top-[42px] self-start"
        style={{ height: 'calc(100vh - 58px)', overflow: 'hidden' }}
      >
        <LiveFeed onSessionClick={handleFeedClick} />
      </div>

      {/* Session sidebar — same component as default UI */}
      <ChatSidebar
        chatId={selectedChat}
        onClose={() => setSelectedChat(null)}
        fetchFn={fetchFn}
        username={username}
        extraHeader={
          <span className="text-[10px] font-medium px-1.5 py-0.5 shrink-0" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
            {username}
          </span>
        }
      />
    </div>
  )
}
