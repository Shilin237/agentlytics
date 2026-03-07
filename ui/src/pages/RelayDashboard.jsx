import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Cpu, ArrowRight, Search, Merge } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import KpiCard from '../components/KpiCard'
import EditorDot from '../components/EditorDot'
import SectionTitle from '../components/SectionTitle'
import ChatSidebar from '../components/ChatSidebar'
import LiveFeed from '../components/LiveFeed'
import { editorColor, editorLabel, formatNumber, formatDate } from '../lib/constants'
import { fetchRelayTeamStats, fetchRelaySearch, fetchRelaySession, mergeRelayUsers } from '../lib/api'
import { useTheme } from '../lib/theme'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const MONO = 'JetBrains Mono, monospace'

export default function RelayDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [selectedChat, setSelectedChat] = useState(null)
  const [selectedUsername, setSelectedUsername] = useState(null)
  const [mergeFrom, setMergeFrom] = useState('')
  const [mergeTo, setMergeTo] = useState('')
  const [merging, setMerging] = useState(false)
  const [mergeResult, setMergeResult] = useState(null)
  const { dark } = useTheme()

  const txtColor = dark ? '#888' : '#555'
  const legendColor = dark ? '#888' : '#555'
  const gridColor = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
  const txtDim = dark ? '#555' : '#999'

  useEffect(() => {
    fetchRelayTeamStats().then(setStats)
    const iv = setInterval(() => fetchRelayTeamStats().then(setStats), 15000)
    return () => clearInterval(iv)
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return
    setSearching(true)
    try {
      const results = await fetchRelaySearch(search.trim(), { limit: 30 })
      setSearchResults(results)
    } catch { setSearchResults([]) }
    setSearching(false)
  }

  if (!stats) return <div className="text-sm py-12 text-center" style={{ color: 'var(--c-text2)' }}>loading relay data...</div>

  const editorData = stats.editors || []
  const userList = stats.users || []

  const editorChartData = {
    labels: editorData.map(e => editorLabel(e.source)),
    datasets: [{
      data: editorData.map(e => e.count),
      backgroundColor: editorData.map(e => editorColor(e.source)),
      borderWidth: 0,
    }],
  }

  const userSessionData = {
    labels: userList.map(u => u.username),
    datasets: [{
      label: 'Sessions',
      data: userList.map(u => u.sessions),
      backgroundColor: userList.map((_, i) => {
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e879f9', '#f472b6', '#fb7185']
        return colors[i % colors.length]
      }),
      borderWidth: 0,
    }],
  }

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: legendColor, font: { size: 10, family: MONO }, padding: 12, usePointStyle: true, pointStyle: 'circle' } },
      tooltip: { bodyFont: { family: MONO, size: 11 }, titleFont: { family: MONO, size: 11 } },
    },
  }

  const barOpts = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { bodyFont: { family: MONO, size: 10 }, titleFont: { family: MONO, size: 10 } },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: txtDim, font: { size: 8, family: MONO } }, beginAtZero: true },
      y: { grid: { display: false }, ticks: { color: txtColor, font: { size: 9, family: MONO } } },
    },
  }

  const handleFeedClick = (chatId, username) => {
    setSelectedChat(chatId)
    setSelectedUsername(username)
  }

  return (
    <div className="fade-in flex gap-4">
      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <KpiCard label="Team Members" value={stats.totalUsers} />
          <KpiCard label="Total Sessions" value={formatNumber(stats.totalSessions)} />
          <KpiCard label="Active Users" value={stats.activeUsers} />
          <KpiCard label="Projects" value={stats.totalProjects} />
          <KpiCard label="Messages" value={formatNumber(stats.totalMessages)} />
          <KpiCard label="Input Tokens" value={formatNumber(stats.totalInputTokens)} />
          <KpiCard label="Output Tokens" value={formatNumber(stats.totalOutputTokens)} />
        </div>

        {/* Search */}
        <div className="card p-3">
          <SectionTitle>Search across team</SectionTitle>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-text3)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search messages, files, topics across all users..."
                className="w-full pl-7 pr-3 py-1.5 text-[11px] bg-transparent border outline-none"
                style={{ borderColor: 'var(--c-border)', color: 'var(--c-white)' }}
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-3 py-1.5 text-[10px] font-medium transition"
              style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', color: 'var(--c-white)' }}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>
          {searchResults && (
            <div className="mt-3 max-h-[300px] overflow-y-auto scrollbar-thin space-y-1">
              {searchResults.length === 0 ? (
                <div className="text-[11px] py-2" style={{ color: 'var(--c-text3)' }}>No results found</div>
              ) : (
                searchResults.map((r, i) => (
                  <div
                    key={i}
                    className="card px-3 py-2 cursor-pointer hover:border-[var(--c-card-hover)] transition"
                    onClick={() => { setSelectedChat(r.chatId); setSelectedUsername(r.username) }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.5" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>{r.username}</span>
                      <EditorDot source={r.source} showLabel size={6} />
                      <span className="text-[10px]" style={{ color: 'var(--c-text3)' }}>{r.chatName}</span>
                      <span className="text-[9px] ml-auto" style={{ color: 'var(--c-text3)' }}>{r.role}</span>
                    </div>
                    <div className="text-[10px] line-clamp-2" style={{ color: 'var(--c-text)' }}>{r.content}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editor breakdown */}
          {editorData.length > 0 && (
            <div className="card p-3">
              <SectionTitle>Team Editor Usage</SectionTitle>
              <div className="h-[200px]">
                <Doughnut data={editorChartData} options={chartOpts} />
              </div>
            </div>
          )}

          {/* Sessions per user */}
          {userList.length > 0 && (
            <div className="card p-3">
              <SectionTitle>Sessions per User</SectionTitle>
              <div style={{ height: Math.max(120, userList.length * 32) }}>
                <Bar data={userSessionData} options={barOpts} />
              </div>
            </div>
          )}
        </div>

        {/* Top Models */}
        {stats.topModels && stats.topModels.length > 0 && (
          <div className="card p-3">
            <SectionTitle>Top Models (Team)</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {stats.topModels.map(m => (
                <span key={m.name} className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px]" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>
                  <Cpu size={10} style={{ color: '#818cf8' }} />
                  {m.name}
                  <span style={{ color: 'var(--c-text3)' }}>×{m.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* User cards */}
        <SectionTitle>Team Members</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {userList.map(u => (
            <div
              key={u.username}
              className="card p-3 cursor-pointer hover:border-[var(--c-card-hover)] transition"
              onClick={() => navigate(`/relay/user/${u.username}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center text-[11px] font-bold" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[11px] font-medium" style={{ color: 'var(--c-white)' }}>{u.username}</div>
                    <div className="text-[9px]" style={{ color: 'var(--c-text3)' }}>
                      {u.lastActive ? `Active ${formatDate(u.lastActive)}` : 'No activity'}
                    </div>
                  </div>
                </div>
                <ArrowRight size={12} style={{ color: 'var(--c-text3)' }} />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--c-white)' }}>{u.sessions}</div>
                  <div className="text-[9px]" style={{ color: 'var(--c-text3)' }}>sessions</div>
                </div>
                <div>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--c-white)' }}>{formatNumber(u.totalMessages)}</div>
                  <div className="text-[9px]" style={{ color: 'var(--c-text3)' }}>messages</div>
                </div>
                <div>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--c-white)' }}>{u.projects}</div>
                  <div className="text-[9px]" style={{ color: 'var(--c-text3)' }}>projects</div>
                </div>
              </div>

              {/* Editor dots */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(u.editors).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
                  <span key={src} className="inline-flex items-center gap-1 text-[9px]" style={{ color: 'var(--c-text2)' }}>
                    <EditorDot source={src} size={6} />
                    {editorLabel(src)} <span style={{ color: 'var(--c-text3)' }}>{count}</span>
                  </span>
                ))}
              </div>

              {/* Top models */}
              {u.topModels && u.topModels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {u.topModels.slice(0, 3).map(m => (
                    <span key={m.name} className="text-[8px] px-1.5 py-0.5" style={{ background: 'rgba(99,102,241,0.08)', color: '#818cf8' }}>
                      {m.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Merge users */}
        {userList.length >= 2 && (
          <div className="card p-3">
            <SectionTitle><Merge size={12} className="inline mr-1" />Merge Users</SectionTitle>
            <div className="flex items-end gap-2 flex-wrap">
              <div>
                <div className="text-[9px] mb-1" style={{ color: 'var(--c-text3)' }}>Merge from</div>
                <select
                  value={mergeFrom}
                  onChange={e => setMergeFrom(e.target.value)}
                  className="text-[11px] px-2 py-1.5 outline-none"
                  style={{ background: 'var(--c-bg3)', color: 'var(--c-text)', border: '1px solid var(--c-border)' }}
                >
                  <option value="">Select user...</option>
                  {userList.filter(u => u.username !== mergeTo).map(u => (
                    <option key={u.username} value={u.username}>{u.username} ({u.sessions} sessions)</option>
                  ))}
                </select>
              </div>
              <div className="text-[11px] pb-1.5" style={{ color: 'var(--c-text3)' }}>→</div>
              <div>
                <div className="text-[9px] mb-1" style={{ color: 'var(--c-text3)' }}>Merge into</div>
                <select
                  value={mergeTo}
                  onChange={e => setMergeTo(e.target.value)}
                  className="text-[11px] px-2 py-1.5 outline-none"
                  style={{ background: 'var(--c-bg3)', color: 'var(--c-text)', border: '1px solid var(--c-border)' }}
                >
                  <option value="">Select user...</option>
                  {userList.filter(u => u.username !== mergeFrom).map(u => (
                    <option key={u.username} value={u.username}>{u.username} ({u.sessions} sessions)</option>
                  ))}
                </select>
              </div>
              <button
                disabled={!mergeFrom || !mergeTo || merging}
                onClick={async () => {
                  if (!confirm(`Merge all data from "${mergeFrom}" into "${mergeTo}"? This cannot be undone.`)) return
                  setMerging(true)
                  setMergeResult(null)
                  try {
                    const r = await mergeRelayUsers(mergeFrom, mergeTo)
                    setMergeResult(r)
                    setMergeFrom('')
                    setMergeTo('')
                    fetchRelayTeamStats().then(setStats)
                  } catch (err) {
                    setMergeResult({ error: err.message })
                  }
                  setMerging(false)
                }}
                className="text-[10px] px-3 py-1.5 font-medium transition"
                style={{
                  background: mergeFrom && mergeTo ? 'rgba(239,68,68,0.15)' : 'var(--c-bg3)',
                  color: mergeFrom && mergeTo ? '#ef4444' : 'var(--c-text3)',
                  border: '1px solid var(--c-border)',
                  cursor: !mergeFrom || !mergeTo || merging ? 'not-allowed' : 'pointer',
                  opacity: !mergeFrom || !mergeTo || merging ? 0.5 : 1,
                }}
              >
                {merging ? 'Merging...' : 'Merge'}
              </button>
            </div>
            {mergeResult && (
              <div className="mt-2 text-[10px]" style={{ color: mergeResult.error ? '#ef4444' : '#22c55e' }}>
                {mergeResult.error
                  ? `Error: ${mergeResult.error}`
                  : `Merged ${mergeResult.moved?.chats || 0} chats, ${mergeResult.moved?.messages || 0} messages from "${mergeResult.merged?.from}" → "${mergeResult.merged?.to}". ${mergeResult.duplicatesSkipped || 0} duplicates skipped.`}
              </div>
            )}
          </div>
        )}

        {userList.length === 0 && (
          <div className="card p-8 text-center">
            <Users size={32} className="mx-auto mb-3" style={{ color: 'var(--c-text3)' }} />
            <div className="text-[12px] font-medium mb-1" style={{ color: 'var(--c-white)' }}>No team members yet</div>
            <div className="text-[10px]" style={{ color: 'var(--c-text3)' }}>
              Share the join command with your team to start collecting data
            </div>
          </div>
        )}
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
        onClose={() => { setSelectedChat(null); setSelectedUsername(null) }}
        fetchFn={selectedUsername ? (id) => fetchRelaySession(id, selectedUsername) : undefined}
        username={selectedUsername}
        extraHeader={
          selectedUsername ? (
            <span className="text-[10px] font-medium px-1.5 py-0.5 shrink-0" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              {selectedUsername}
            </span>
          ) : null
        }
      />
    </div>
  )
}
