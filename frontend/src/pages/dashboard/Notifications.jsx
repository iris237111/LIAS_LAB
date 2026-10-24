import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const SEEN_KEY = 'lias_seen_notifs'

const getSeenIds = () => {
    try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')) } catch { return new Set() }
}
const markSeen = (ids) => {
    const prev = getSeenIds()
    ids.forEach(id => prev.add(id))
    localStorage.setItem(SEEN_KEY, JSON.stringify([...prev]))
}

const ICONS = {
    message:  { bg: '#dbeafe', color: '#1d4ed8', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    event:    { bg: '#fef3c7', color: '#b45309', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    document: { bg: '#f0fdf4', color: '#16a34a', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    request:  { bg: '#fdf2f8', color: '#be185d', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
    system:   { bg: '#f1f5f9', color: '#475569', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    team:     { bg: '#ede9fe', color: '#7c3aed', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
}

const fmtDate = (d) => {
    if (!d) return ''
    const date = new Date(d)
    const diff = Date.now() - date.getTime()
    if (diff < 60000) return 'À l\'instant'
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Notifications() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [seenIds, setSeenIds] = useState(getSeenIds())
    const [filter, setFilter] = useState('all')
    const navigate = useNavigate()
    const role = localStorage.getItem('role') || ''
    const isAdmin = ['ADMIN', 'DIRECTOR', 'VICE_DIRECTOR'].includes(role)

    useEffect(() => { loadAll() }, [])

    const loadAll = async () => {
        setLoading(true)
        const results = []

        // 1. Notifications système (backend) — y compris messages privés
        try {
            const r = await api.get('/notifications')
            r.data.forEach(n => {
                // type format: "PRIVATE_MESSAGE:senderId" ou "PRIVATE_MESSAGE"
                const isPrivate = n.type?.startsWith('PRIVATE_MESSAGE')
                const isTeam = n.type === 'TEAM_ASSIGNMENT'
                let link = null
                if (isPrivate) {
                    const parts = n.type.split(':')
                    const senderId = parts[1]
                    link = senderId ? `/dashboard/chat-prive/${senderId}` : '/dashboard/messages'
                } else if (isTeam) {
                    link = '/dashboard/profil'
                }
                results.push({
                    id: `sys-${n.id}`,
                    type: isPrivate ? 'message' : 'system',
                    title: isPrivate ? 'Message privé reçu' : isTeam ? 'Assignation à une équipe' : (n.message || 'Notification système'),
                    subtitle: n.message,
                    date: n.createdAt,
                    read: n.read,
                    backendId: n.id,
                    link,
                })
            })
        } catch {}

        // 2. Messages récents des autres (dernières 48h)
        try {
            const r = await api.get('/messages')
            const meRes = await api.get('/members/me').catch(() => ({ data: null }))
            const myUserId = meRes.data?.userId
            const recent = r.data.filter(m => {
                const age = Date.now() - new Date(m.sentAt).getTime()
                // Exclure: mes propres messages, messages privés (receiverId présent), messages d'équipe/événement
                return age < 48 * 3600 * 1000
                    && m.senderId !== myUserId
                    && !m.receiverId        // pas de message privé
                    && m.globalMessage      // seulement canal global
                    && !m.teamId
                    && !m.eventId
            })
            recent.forEach(m => results.push({
                id: `msg-${m.id}`,
                type: 'message',
                title: 'Nouveau message dans le canal général',
                subtitle: `"${m.content?.substring(0, 80)}${m.content?.length > 80 ? '…' : ''}"`,
                date: m.sentAt,
                read: false,
                link: '/dashboard/messages',
            }))
        } catch {}

        // 3. Événements récents (créés dans les 7 derniers jours)
        try {
            const r = await api.get('/events')
            const recent = r.data.filter(ev => {
                const age = Date.now() - new Date(ev.startDate || ev.date || ev.createdAt).getTime()
                return Math.abs(age) < 7 * 86400000
            })
            recent.forEach(ev => results.push({
                id: `evt-${ev.id}`,
                type: 'event',
                title: `Événement : ${ev.title || ev.name}`,
                subtitle: ev.location ? `Lieu : ${ev.location}` : '',
                date: ev.startDate || ev.date || ev.createdAt,
                read: false,
                link: '/evenements',
            }))
        } catch {}

        // 4. Documents récents (derniers 7 jours)
        try {
            const r = await api.get('/documents')
            const recent = r.data.filter(d => {
                const age = Date.now() - new Date(d.createdAt || d.uploadedAt).getTime()
                return age < 7 * 86400000
            })
            recent.forEach(d => results.push({
                id: `doc-${d.id}`,
                type: 'document',
                title: `Nouveau document ajouté`,
                subtitle: d.filename || d.name || '',
                date: d.createdAt || d.uploadedAt,
                read: false,
                link: '/dashboard/documents',
            }))
        } catch {}

        // 5. Demandes d'adhésion en attente (admin/directeur uniquement)
        if (isAdmin) {
            try {
                const r = await api.get('/membership-requests')
                const pending = r.data.filter(req => req.status === 'PENDING')
                pending.forEach(req => results.push({
                    id: `req-${req.id}`,
                    type: 'request',
                    title: `Demande d'adhésion en attente`,
                    subtitle: `De : ${req.applicantName} (${req.email})`,
                    date: req.createdAt || req.submittedAt,
                    read: false,
                    urgent: true,
                link: '/dashboard/adhesions',
                }))
            } catch {}
        }

        // Tri par date décroissante + dédoublonnage
        results.sort((a, b) => new Date(b.date) - new Date(a.date))
        setItems(results)
        setLoading(false)
    }

    const seen = getSeenIds()
    const isRead = (item) => item.read || seen.has(item.id)

    const markAllRead = () => {
        const ids = items.map(i => i.id)
        markSeen(ids)
        setSeenIds(getSeenIds())
        const backendIds = items.filter(i => i.backendId).map(i => i.backendId)
        backendIds.forEach(id => api.patch(`/notifications/${id}/read`).catch(() => {}))
    }

    const resetAll = async () => {
        if (!confirm('Réinitialiser toutes les notifications ? Elles réapparaîtront comme non lues.')) return
        // Vider le localStorage
        localStorage.removeItem(SEEN_KEY)
        // Remettre toutes les notifs backend en non-lu
        const backendIds = items.filter(i => i.backendId).map(i => i.backendId)
        await Promise.all(backendIds.map(id =>
            api.patch(`/notifications/${id}/read`).catch(() => {})
        ))
        // Patch inverse: on ne peut pas "unread" via le backend actuel, donc on supprime juste le seen localStorage
        setSeenIds(new Set())
        loadAll()
    }

    const markOneRead = (item) => {
        markSeen([item.id])
        setSeenIds(getSeenIds())
        if (item.backendId) api.patch(`/notifications/${item.backendId}/read`).catch(() => {})
    }

    const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)
    const unread = items.filter(i => !isRead(i)).length

    const FILTERS = [
        { id: 'all',      label: 'Tout' },
        { id: 'message',  label: 'Messages' },
        { id: 'event',    label: 'Événements' },
        { id: 'document', label: 'Documents' },
        ...(isAdmin ? [{ id: 'request', label: 'Demandes' }] : []),
        { id: 'system',   label: 'Système' },
    ]

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">Activité récente du laboratoire</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {unread > 0 && (
                        <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '12.5px', fontWeight: 700 }}>
                            {unread} non lu{unread > 1 ? 's' : ''}
                        </span>
                    )}
                    {unread > 0 && (
                        <button onClick={markAllRead} className="btn btn-secondary btn-sm">
                            Tout marquer comme lu
                        </button>
                    )}
                    <button onClick={loadAll} className="btn btn-ghost btn-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Filtres */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {FILTERS.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: `1px solid ${filter === f.id ? 'var(--primary)' : 'var(--border)'}`,
                            background: filter === f.id ? 'var(--primary)' : 'transparent',
                            color: filter === f.id ? '#fff' : 'var(--text-muted)',
                            fontSize: '13px',
                            fontWeight: filter === f.id ? 600 : 400,
                            cursor: 'pointer',
                        }}
                    >
                        {f.label}
                        {f.id !== 'all' && items.filter(i => i.type === f.id && !isRead(i)).length > 0 && (
                            <span style={{ marginLeft: '6px', background: filter === f.id ? 'rgba(255,255,255,0.3)' : 'var(--primary)', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' }}>
                                {items.filter(i => i.type === f.id && !isRead(i)).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading">Chargement des notifications...</div>
            ) : filtered.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </div>
                    <p className="empty-title">Aucune notification</p>
                    <p className="empty-desc">Vous êtes à jour. Revenez plus tard.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filtered.map(item => {
                        const icon = ICONS[item.type] || ICONS.system
                        const read = isRead(item)
                        return (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '14px',
                                    padding: '16px 20px',
                                    borderRadius: '10px',
                                    border: `1px solid ${read ? 'var(--border)' : item.urgent ? '#fca5a5' : 'var(--primary-100, #ccfbf1)'}`,
                                    background: read ? 'var(--surface)' : item.urgent ? '#fff5f5' : 'rgba(15,118,110,0.04)',
                                    cursor: item.link ? 'pointer' : 'default',
                                    transition: 'all 0.15s',
                                }}
                                onClick={() => {
                                    if (!read) markOneRead(item)
                                    if (item.link) navigate(item.link)
                                }}
                            >
                                {/* Icone */}
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '9px',
                                    background: icon.bg, color: icon.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    {icon.svg}
                                </div>

                                {/* Contenu */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                        {!read && (
                                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.urgent ? '#ef4444' : 'var(--primary)', flexShrink: 0, display: 'inline-block' }} />
                                        )}
                                        <span style={{ fontSize: '14px', fontWeight: read ? 500 : 700, color: 'var(--text-primary)' }}>
                                            {item.title}
                                        </span>
                                        {item.urgent && !read && (
                                            <span style={{ fontSize: '11px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', padding: '2px 7px', fontWeight: 700 }}>Urgent</span>
                                        )}
                                    </div>
                                    {item.subtitle && (
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.subtitle}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {fmtDate(item.date)}
                                    </div>
                                </div>

                                {/* Bouton marquer lu */}
                                {!read && (
                                    <button
                                        onClick={e => { e.stopPropagation(); markOneRead(item) }}
                                        className="btn btn-ghost btn-sm"
                                        style={{ flexShrink: 0, fontSize: '12px' }}
                                    >
                                        Lu
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </DashboardLayout>
    )
}
