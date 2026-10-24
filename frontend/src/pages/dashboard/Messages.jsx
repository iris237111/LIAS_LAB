import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const TABS = [
    { id: 'global', label: 'Canal général' },
    { id: 'team',   label: 'Mon équipe'    },
    { id: 'event',  label: 'Événements'   },
]

export default function Messages() {
    const [tab, setTab]           = useState('global')
    const [messages, setMessages] = useState([])
    const [members, setMembers]   = useState([])
    const [events, setEvents]     = useState([])
    const [myMember, setMyMember] = useState(null)
    const [selectedEvent, setSelectedEvent] = useState('')
    const [text, setText]         = useState('')
    const [loading, setLoading]   = useState(true)
    const [openMenuId, setOpenMenuId] = useState(null)
    const [profilePopup, setProfilePopup] = useState(null)
    const navigate = useNavigate()
    const [editingId, setEditingId] = useState(null)
    const [editText, setEditText]   = useState('')
    const bottomRef = useRef(null)
    const tabRef = useRef('global')
    const eventRef = useRef('')
    const shouldScrollRef = useRef(false)
    const myUserId = myMember?.userId

    useEffect(() => {
        Promise.all([
            api.get('/members').then(r => setMembers(r.data)),
            api.get('/members/me').then(r => setMyMember(r.data)),
            api.get('/public/events').then(r => setEvents(r.data)).catch(() => {}),
        ])
        shouldScrollRef.current = true
        fetchMessages('global', '')
        const interval = setInterval(() => fetchMessages(tabRef.current, eventRef.current), 8000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        tabRef.current = tab
        eventRef.current = selectedEvent
        setMessages([])
        shouldScrollRef.current = true
        fetchMessages(tab, selectedEvent)
    }, [tab, selectedEvent])

    useEffect(() => {
        if (shouldScrollRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            shouldScrollRef.current = false
        }
    }, [messages])

    const fetchMessages = async (currentTab = tab, currentEvent = selectedEvent) => {
        setLoading(true)
        try {
            if (currentTab === 'event') {
                if (!currentEvent) { setMessages([]); return }
                const r = await api.get(`/messages?eventId=${currentEvent}`)
                setMessages(r.data)
            } else {
                const r = await api.get('/messages')
                const all = [...r.data].reverse()
                if (currentTab === 'global') {
                    setMessages(all.filter(m => m.globalMessage && !m.teamId && !m.eventId))
                } else if (currentTab === 'team') {
                    const myTeamId = myMember?.currentTeamId
                    setMessages(myTeamId ? all.filter(m => m.teamId === myTeamId) : [])
                }
            }
        } catch {}
        finally { setLoading(false) }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!text.trim()) return
        let body = { content: text }
        if (tab === 'global')      body.globalMessage = true
        else if (tab === 'team')   body.teamId = myMember?.currentTeamId
        else if (tab === 'event')  body.eventId = parseInt(selectedEvent)
        try {
            await api.post('/messages', body)
            setText('')
            shouldScrollRef.current = true
            fetchMessages(tab, selectedEvent)
        } catch { alert("Erreur lors de l'envoi.") }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
    }

    const handleDelete = async (id) => {
        setOpenMenuId(null)
        try {
            await api.delete(`/messages/${id}`)
            setMessages(prev => prev.filter(m => m.id !== id))
        } catch { alert('Erreur lors de la suppression.') }
    }

    const handleEditSave = async (msg) => {
        if (!editText.trim()) return
        try {
            await api.put(`/messages/${msg.id}`, { content: editText })
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, content: editText } : m))
            setEditingId(null)
        } catch { alert('Erreur lors de la modification.') }
    }

    const handleResend = (msg) => {
        setOpenMenuId(null)
        setText(msg.content)
    }

    const handleCopy = (content) => {
        setOpenMenuId(null)
        navigator.clipboard.writeText(content).catch(() => {})
    }


    const getMemberName = (senderId) => {
        const m = members.find(m => m.userId === senderId)
        return m ? `${m.firstName} ${m.lastName}` : `#${senderId}`
    }

    const getInitials = (senderId) => {
        const m = members.find(m => m.userId === senderId)
        return m ? (m.firstName?.[0] || '') + (m.lastName?.[0] || '') : '?'
    }

    const fmtTime = (d) => {
        if (!d) return ''
        const date = new Date(d)
        const isToday = date.toDateString() === new Date().toDateString()
        return isToday
            ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    }

    const actionBtn = {
        width: '26px', height: '26px', border: 'none', background: 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '5px', color: 'var(--text-muted)', padding: 0,
        transition: 'background 0.1s',
    }

    const canSend = tab === 'global'
        || (tab === 'team' && myMember?.currentTeamId)
        || (tab === 'event' && selectedEvent)

    const myTeamName = members.length && myMember?.currentTeamId
        ? (members.find(m => m.currentTeamId === myMember.currentTeamId)?.team?.name || `Équipe #${myMember.currentTeamId}`)
        : null

    const selectedEventName = events.find(e => String(e.id) === String(selectedEvent))?.title || selectedEvent

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Messagerie</h1>
                    <p className="page-subtitle">Communication interne du laboratoire LIAS</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--surface-2)', padding: '4px', borderRadius: '10px', width: 'fit-content', border: '1px solid var(--border)' }}>
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                            padding: '8px 18px',
                            borderRadius: '7px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '13.5px',
                            fontWeight: tab === t.id ? 700 : 500,
                            background: tab === t.id ? 'var(--primary)' : 'transparent',
                            color: tab === t.id ? '#fff' : 'var(--text-muted)',
                            transition: 'all 0.15s',
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Sélecteur d'événement */}
            {tab === 'event' && (
                <div style={{ marginBottom: '16px', maxWidth: '380px' }}>
                    <select
                        className="form-input"
                        value={selectedEvent}
                        onChange={e => setSelectedEvent(e.target.value)}
                    >
                        <option value="">— Choisir un événement —</option>
                        {events.map(ev => (
                            <option key={ev.id} value={ev.id}>{ev.title || ev.name}</option>
                        ))}
                    </select>
                    {events.length === 0 && (
                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Aucun événement disponible.
                        </p>
                    )}
                </div>
            )}

            {/* Info équipe */}
            {tab === 'team' && !myMember?.currentTeamId && (
                <div className="alert" style={{ marginBottom: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#b45309', borderRadius: '8px', padding: '12px 16px', fontSize: '13.5px' }}>
                    Vous n'êtes assigné à aucune équipe. Contactez un administrateur.
                </div>
            )}

            <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '560px' }}>
                {/* En-tête */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--success)' }} />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                        {tab === 'global' && 'Canal général LIAS'}
                        {tab === 'team' && (myMember?.currentTeamId ? `Équipe — ${myTeamName || `#${myMember.currentTeamId}`}` : 'Mon équipe')}
                        {tab === 'event' && (selectedEvent ? `Événement — ${selectedEventName}` : 'Sélectionnez un événement')}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {messages.length} message{messages.length > 1 ? 's' : ''}
                    </span>
                </div>

                {/* Zone messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {loading ? (
                        <div className="loading">Chargement...</div>
                    ) : messages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', marginTop: '80px' }}>
                            {tab === 'event' && !selectedEvent
                                ? 'Sélectionnez un événement pour voir sa discussion.'
                                : 'Aucun message. Soyez le premier à écrire !'}
                        </div>
                    ) : (
                        messages.map(msg => {
                            const mine = msg.senderId === myUserId
                            const isOpen = openMenuId === msg.id
                            return (
                                <div
                                    key={msg.id}
                                    style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexDirection: mine ? 'row-reverse' : 'row' }}
                                >
                                    {/* Avatar */}
                                    <div
                                        className="avatar avatar-sm"
                                        style={{ flexShrink: 0, background: mine ? '#0f766e' : '#6366f1', fontSize: '11px', cursor: mine ? 'default' : 'pointer' }}
                                        onClick={() => { if (!mine) { const m = members.find(m => m.userId === msg.senderId); if (m) setProfilePopup(m) } }}
                                        title={mine ? '' : `Voir le profil de ${getMemberName(msg.senderId)}`}
                                    >
                                        {getInitials(msg.senderId)}
                                    </div>

                                    {/* Bulle + actions */}
                                    <div style={{ maxWidth: '62%' }}>
                                        {!mine && (
                                            <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', paddingLeft: '4px' }}>
                                                {getMemberName(msg.senderId)}
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexDirection: mine ? 'row-reverse' : 'row' }}>
                                            {/* Bulle ou éditeur */}
                                            {editingId === msg.id ? (
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
                                                    <textarea autoFocus className="form-input" value={editText}
                                                        onChange={e => setEditText(e.target.value)}
                                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(msg) } if (e.key === 'Escape') setEditingId(null) }}
                                                        rows={2} style={{ minWidth: '220px', resize: 'none', fontSize: '13.5px' }} />
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <button onClick={() => handleEditSave(msg)} className="btn btn-primary btn-sm">OK</button>
                                                        <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm">Ann.</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{
                                                    padding: '10px 15px',
                                                    borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                    background: mine ? 'linear-gradient(135deg, #0f766e, #0d9488)' : 'var(--surface-2)',
                                                    color: mine ? '#fff' : 'var(--text-primary)',
                                                    fontSize: '14px', lineHeight: 1.6,
                                                    border: mine ? 'none' : '1px solid var(--border)',
                                                    boxShadow: mine ? '0 2px 8px rgba(15,118,110,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
                                                    wordBreak: 'break-word',
                                                }}>{msg.content}</div>
                                            )}

                                            {/* 3 points + barre d'actions inline */}
                                            {editingId !== msg.id && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, flexDirection: mine ? 'row-reverse' : 'row' }}>
                                                    <button
                                                        onClick={() => setOpenMenuId(isOpen ? null : msg.id)}
                                                        style={{ width:'26px', height:'26px', borderRadius:'50%', border:'none', background: isOpen ? 'var(--border)' : 'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                                                    </button>
                                                    {isOpen && (
                                                        <div style={{ display: 'flex', gap: '2px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                                            <button title="Copier" onClick={() => { handleCopy(msg.content); setOpenMenuId(null) }} style={actionBtn}>
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                                            </button>
                                                            {mine && <>
                                                                <button title="Modifier" onClick={() => { setEditingId(msg.id); setEditText(msg.content); setOpenMenuId(null) }} style={actionBtn}>
                                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                                </button>
                                                                <button title="Renvoyer" onClick={() => { handleResend(msg); setOpenMenuId(null) }} style={actionBtn}>
                                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
                                                                </button>
                                                                <button title="Supprimer" onClick={() => { handleDelete(msg.id); }} style={{ ...actionBtn, color: '#ef4444' }}>
                                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                                                </button>
                                                            </>}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {editingId !== msg.id && (
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: mine ? 'right' : 'left', paddingLeft: mine ? 0 : '4px', paddingRight: mine ? '4px' : 0 }}>
                                                {mine && <span style={{ marginRight: '6px', opacity: 0.7 }}>Vous ·</span>}
                                                {fmtTime(msg.sentAt)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Zone envoi */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <textarea
                            className="form-input"
                            placeholder={canSend ? 'Écrire un message... (Entrée pour envoyer)' : 'Sélectionnez un événement pour écrire'}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={!canSend}
                            rows={1}
                            style={{ flex: 1, resize: 'none', minHeight: '40px', maxHeight: '120px' }}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!text.trim() || !canSend}
                            style={{ padding: '10px 16px', flexShrink: 0 }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </form>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                        Entrée pour envoyer · Shift+Entrée pour saut de ligne
                    </p>
                </div>
            </div>

            {/* Popup profil membre */}
            {profilePopup && (
                <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300,padding:'24px' }}
                    onClick={() => setProfilePopup(null)}>
                    <div className="card" style={{ width:'100%',maxWidth:'380px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px' }}>
                            <h3 style={{ fontWeight:700,fontSize:'16px',color:'var(--text-primary)' }}>Profil membre</h3>
                            <button onClick={() => setProfilePopup(null)} className="btn btn-ghost btn-sm">✕</button>
                        </div>
                        <div style={{ display:'flex',gap:'16px',alignItems:'center',marginBottom:'20px' }}>
                            <div className="avatar" style={{ width:'56px',height:'56px',fontSize:'20px',background:'#6366f1',flexShrink:0 }}>
                                {(profilePopup.firstName?.[0]||'').toUpperCase()}{(profilePopup.lastName?.[0]||'').toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight:700,fontSize:'16px',color:'var(--text-primary)' }}>{profilePopup.firstName} {profilePopup.lastName}</div>
                                {profilePopup.establishment && <div style={{ fontSize:'13px',color:'var(--text-muted)',marginTop:'2px' }}>{profilePopup.establishment}</div>}
                                {profilePopup.type && <span className="badge badge-teal" style={{ marginTop:'6px',display:'inline-block' }}>{profilePopup.type}</span>}
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width:'100%',justifyContent:'center' }}
                            onClick={() => { setProfilePopup(null); navigate(`/dashboard/chat-prive/${profilePopup.userId}`) }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Envoyer un message privé
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
