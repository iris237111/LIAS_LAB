import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

export default function Notifications() {
    const [notifs, setNotifs] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchNotifs()
    }, [])

    const fetchNotifs = () => {
        api.get('/notifications').then(r => { setNotifs(r.data); setLoading(false) })
            .catch(() => navigate('/login'))
    }

    const markRead = async (id) => {
        await api.patch(`/notifications/${id}/read`).catch(() => {})
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const markAllRead = async () => {
        await api.patch('/notifications/read-all').catch(() => {})
        setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    }

    const unread = notifs.filter(n => !n.read).length

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

            <div style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '0 auto', padding: '40px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>
                            Notifications
                            {unread > 0 && (
                                <span style={{ marginLeft: '10px', background: '#dc2626', color: 'white', fontSize: '13px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' }}>
                                    {unread}
                                </span>
                            )}
                        </h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Vos notifications et alertes</p>
                    </div>
                    {unread > 0 && (
                        <button onClick={markAllRead} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                            Tout marquer comme lu
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : notifs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucune notification</div>
                        <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>Vous êtes à jour !</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifs.map(n => (
                            <div
                                key={n.id}
                                onClick={() => !n.read && markRead(n.id)}
                                style={{
                                    background: n.read ? 'white' : '#f0fdfa',
                                    border: `0.5px solid ${n.read ? '#e5e7eb' : '#99f6e4'}`,
                                    borderRadius: '12px',
                                    padding: '18px 20px',
                                    cursor: n.read ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '14px'
                                }}>
                                <div style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>
                                    {n.read ? '🔔' : '🔔'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: n.read ? 400 : 700, color: '#134e4a', lineHeight: 1.5 }}>
                                        {n.message || n.title || 'Notification'}
                                    </div>
                                    {n.createdAt && (
                                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                            {new Date(n.createdAt).toLocaleString('fr-FR')}
                                        </div>
                                    )}
                                </div>
                                {!n.read && (
                                    <div style={{ width: '8px', height: '8px', background: '#0d9488', borderRadius: '50%', flexShrink: 0, marginTop: '6px' }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ background: '#134e4a', padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>
        </div>
    )
}
