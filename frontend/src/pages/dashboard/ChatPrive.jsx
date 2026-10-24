import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

export default function ChatPrive() {
    const { userId } = useParams()
    const navigate = useNavigate()
    const [messages, setMessages] = useState([])
    const [otherMember, setOtherMember] = useState(null)
    const [myMember, setMyMember] = useState(null)
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(true)
    const [openMenuId, setOpenMenuId] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [editText, setEditText] = useState('')
    const bottomRef = useRef(null)
    const shouldScrollRef = useRef(false)

    useEffect(() => {
        api.get('/members/me').then(r => setMyMember(r.data)).catch(() => {})
        api.get('/members').then(r => {
            const m = r.data.find(m => String(m.userId) === String(userId))
            setOtherMember(m || null)
        }).catch(() => {})
        shouldScrollRef.current = true
        fetchMessages()
        const interval = setInterval(fetchMessages, 8000)
        return () => clearInterval(interval)
    }, [userId])

    useEffect(() => {
        if (shouldScrollRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            shouldScrollRef.current = false
        }
    }, [messages])

    const fetchMessages = async () => {
        try {
            const r = await api.get(`/messages/private/${userId}`)
            setMessages(r.data)
        } catch {}
        finally { setLoading(false) }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!text.trim()) return
        try {
            await api.post('/messages', { content: text, receiverId: parseInt(userId), globalMessage: false })
            setText('')
            shouldScrollRef.current = true
            fetchMessages()
        } catch { alert("Erreur lors de l'envoi.") }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
    }

    const handleDelete = async (id) => {
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

    const handleCopy = (content) => {
        navigator.clipboard.writeText(content).catch(() => {})
    }

    const handleResend = (msg) => {
        setText(msg.content)
    }

    const myUserId = myMember?.userId
    const otherName = otherMember ? `${otherMember.firstName} ${otherMember.lastName}` : `Utilisateur #${userId}`
    const otherInitials = otherMember ? (otherMember.firstName?.[0] || '') + (otherMember.lastName?.[0] || '') : '?'

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
    }

    return (
        <DashboardLayout>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Retour
                    </button>
                    <div className="avatar avatar-sm" style={{ background: '#6366f1' }}>{otherInitials}</div>
                    <div>
                        <h1 className="page-title" style={{ margin: 0 }}>{otherName}</h1>
                        {otherMember?.establishment && <p className="page-subtitle" style={{ margin: 0 }}>{otherMember.establishment}</p>}
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '580px' }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'var(--success)' }} />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                        Conversation privée avec {otherName}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {messages.length} message{messages.length > 1 ? 's' : ''}
                    </span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {loading ? <div className="loading">Chargement...</div>
                    : messages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', marginTop: '80px' }}>
                            Aucun message. Démarrez la conversation !
                        </div>
                    ) : messages.map(msg => {
                        const mine = msg.senderId === myUserId
                        const isOpen = openMenuId === msg.id
                        return (
                            <div key={msg.id}
                                style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexDirection: mine ? 'row-reverse' : 'row' }}>
                                <div className="avatar avatar-sm" style={{ flexShrink: 0, background: mine ? '#0f766e' : '#6366f1', fontSize: '11px' }}>
                                    {mine ? (myMember?.firstName?.[0] || '') + (myMember?.lastName?.[0] || '') : otherInitials}
                                </div>
                                <div style={{ maxWidth: '62%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexDirection: mine ? 'row-reverse' : 'row' }}>
                                        {editingId === msg.id ? (
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
                                                <textarea autoFocus className="form-input" value={editText}
                                                    onChange={e => setEditText(e.target.value)}
                                                    onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleEditSave(msg)} if(e.key==='Escape')setEditingId(null) }}
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
                                                            <button title="Supprimer" onClick={() => { handleDelete(msg.id); setOpenMenuId(null) }} style={{ ...actionBtn, color: '#ef4444' }}>
                                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                                            </button>
                                                        </>}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {editingId !== msg.id && (
                                        <div style={{ fontSize:'11px',color:'var(--text-muted)',marginTop:'4px',textAlign:mine?'right':'left',paddingLeft:mine?0:'4px',paddingRight:mine?'4px':0 }}>
                                            {mine && <span style={{ marginRight:'6px',opacity:0.7 }}>Vous ·</span>}
                                            {fmtTime(msg.sentAt)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    <div ref={bottomRef} />
                </div>

                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <textarea className="form-input" placeholder={`Message à ${otherName}...`}
                            value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown}
                            rows={1} style={{ flex:1, resize:'none', minHeight:'40px', maxHeight:'120px' }} />
                        <button type="submit" className="btn btn-primary" disabled={!text.trim()} style={{ padding:'10px 16px',flexShrink:0 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                    </form>
                    <p style={{ fontSize:'11px',color:'var(--text-muted)',marginTop:'5px' }}>Entrée pour envoyer · Shift+Entrée pour saut de ligne</p>
                </div>
            </div>
        </DashboardLayout>
    )
}
