import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const INPUT = { width: '100%', padding: '11px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', color: '#111827' }

export default function Messages() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef(null)
    const navigate = useNavigate()
    const userId = localStorage.getItem('userId')

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchMessages()
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchMessages = () => {
        api.get('/messages').then(r => {
            setMessages(r.data.reverse())
            setLoading(false)
        }).catch(() => navigate('/login'))
    }

    const handleSend = async () => {
        const content = text.trim()
        if (!content) return
        setSending(true)
        try {
            await api.post('/messages', { content })
            setText('')
            fetchMessages()
        } catch { alert('Erreur lors de l\'envoi.') }
        finally { setSending(false) }
    }

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            <div style={{ background: '#134e4a', width: '100%' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
                    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0' }}>
                        <a href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#ccfbf1', letterSpacing: '2px', textDecoration: 'none' }}>LIAS</a>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <a href="/dashboard" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>← Dashboard</a>
                            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); navigate('/') }}
                                style={{ background: 'transparent', border: '1px solid #99f6e4', color: '#99f6e4', padding: '7px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                Déconnexion
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            <div style={{ flex: 1, maxWidth: '900px', width: '100%', margin: '0 auto', padding: '40px', display: 'flex', flexDirection: 'column' }}>

                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Communication interne</h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Espace de discussion entre membres du laboratoire</p>
                </div>

                {/* Chat area */}
                <div style={{ flex: 1, background: 'white', borderRadius: '16px', border: '0.5px solid #99f6e4', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '480px' }}>

                    {/* Messages list */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', color: '#0d9488', padding: '40px' }}>Chargement...</div>
                        ) : messages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                                <div style={{ fontWeight: 600, color: '#374151' }}>Aucun message pour l'instant</div>
                                <div style={{ fontSize: '13px', marginTop: '6px' }}>Soyez le premier à écrire !</div>
                            </div>
                        ) : messages.map(msg => {
                            const isMe = String(msg.senderId) === String(userId)
                            const time = msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''
                            return (
                                <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                    <div style={{ maxWidth: '70%' }}>
                                        {!isMe && (
                                            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', paddingLeft: '4px' }}>
                                                Membre #{msg.senderId}
                                            </div>
                                        )}
                                        <div style={{
                                            background: isMe ? '#0d9488' : '#f0fdfa',
                                            color: isMe ? 'white' : '#134e4a',
                                            border: isMe ? 'none' : '0.5px solid #99f6e4',
                                            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                            padding: '10px 14px',
                                            fontSize: '14px',
                                            lineHeight: 1.5
                                        }}>
                                            {msg.content}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', textAlign: isMe ? 'right' : 'left', paddingRight: isMe ? '4px' : 0, paddingLeft: isMe ? 0 : '4px' }}>
                                            {time}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{ borderTop: '1px solid #f0fdfa', padding: '16px 24px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <textarea
                            rows={1}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Écrire un message... (Entrée pour envoyer)"
                            style={{ ...INPUT, resize: 'none', flex: 1 }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !text.trim()}
                            style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', padding: '11px 20px', fontSize: '14px', cursor: sending || !text.trim() ? 'not-allowed' : 'pointer', opacity: sending || !text.trim() ? 0.6 : 1, fontWeight: 700, flexShrink: 0 }}>
                            Envoyer
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ background: '#134e4a', padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>
        </div>
    )
}
