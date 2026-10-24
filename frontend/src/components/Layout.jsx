import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api'

const NAV_LINKS = [
    { href: '/', label: 'Accueil' },
    { href: '/equipes', label: 'Équipes' },
    { href: '/evenements', label: 'Événements' },
    { href: '/publications', label: 'Publications' },
    { href: '/calendrier', label: 'Calendrier' },
    { href: '/recherche', label: 'Recherche' },
]

export function PublicLayout({ children }) {
    const token = localStorage.getItem('token')
    const location = useLocation()
    return (
        <div className="page">
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        <a href="/" className="navbar-logo">LIAS</a>
                        <div className="navbar-links">
                            {NAV_LINKS.map(l => (
                                <a key={l.href} href={l.href} className={`navbar-link${location.pathname === l.href ? ' active' : ''}`}>{l.label}</a>
                            ))}
                        </div>
                        <div className="navbar-actions">
                            {token
                                ? <a href="/dashboard" className="btn btn-primary btn-sm">Dashboard</a>
                                : <a href="/login" className="btn btn-primary btn-sm">Connexion</a>
                            }
                        </div>
                    </div>
                </div>
            </nav>
            {children}
            <footer className="footer">
                <div className="container">
                    <p className="footer-text">© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</p>
                </div>
            </footer>
        </div>
    )
}

const SIDEBAR_ITEMS = [
    { section: 'Espace membre', items: [
        { href: '/dashboard', label: 'Vue d\'ensemble', icon: <GridIcon /> },
        { href: '/dashboard/profil', label: 'Mon profil', icon: <UserIcon /> },
        { href: '/dashboard/publications', label: 'Publications', icon: <DocIcon /> },
        { href: '/dashboard/messages', label: 'Messages', icon: <ChatIcon /> },
        { href: '/dashboard/notifications', label: 'Notifications', icon: <BellIcon /> },
        { href: '/dashboard/demandes-materiel', label: 'Demandes matériel', icon: <BoxIcon /> },
        { href: '/dashboard/documents', label: 'Documents', icon: <FolderIcon /> },
    ]},
    { section: 'Administration', adminOnly: true, items: [
        { href: '/dashboard/adhesions', label: 'Adhésions', icon: <CheckIcon />, roles: ['ADMIN','DIRECTOR'] },
        { href: '/dashboard/membres', label: 'Membres', icon: <UsersIcon />, roles: ['ADMIN'] },
        { href: '/dashboard/equipes', label: 'Équipes', icon: <LayersIcon />, roles: ['ADMIN'] },
        { href: '/dashboard/evenements', label: 'Événements', icon: <CalIcon />, roles: ['ADMIN','DIRECTOR'] },
        { href: '/dashboard/reunions', label: 'Réunions', icon: <ClipIcon />, roles: ['ADMIN','DIRECTOR'] },
        { href: '/dashboard/pv', label: 'Procès-verbaux', icon: <DocIcon />, roles: ['ADMIN','DIRECTOR'] },
        { href: '/dashboard/conventions', label: 'Conventions', icon: <LinkIcon />, roles: ['ADMIN','DIRECTOR'] },
        { href: '/dashboard/materiel', label: 'Inventaire', icon: <ServerIcon />, roles: ['ADMIN','DIRECTOR'] },
        { href: '/dashboard/mandats', label: 'Mandats', icon: <ShieldIcon />, roles: ['ADMIN'] },
        { href: '/dashboard/historique-roles', label: 'Historique rôles', icon: <HistIcon />, roles: ['ADMIN'] },
        { href: '/dashboard/rapport', label: 'Rapport annuel', icon: <ChartIcon />, roles: ['ADMIN','DIRECTOR'] },
    ]},
]

const SEEN_KEY = 'lias_seen_notifs'
const getSeenIds = () => { try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')) } catch { return new Set() } }

export function DashboardLayout({ children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const role = localStorage.getItem('role') || ''
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const seen = getSeenIds()
                let count = 0

                // Notifications système (messages privés, assignation équipe, etc.)
                const sysR = await api.get('/notifications')
                count += sysR.data.filter(n => !n.read && !seen.has(`sys-${n.id}`)).length

                // Messages canal global des 48h (des autres)
                const meRes = await api.get('/members/me').catch(() => ({ data: null }))
                const myUserId = meRes.data?.userId
                if (myUserId) {
                    const msgR = await api.get('/messages')
                    const newMsgs = msgR.data.filter(m => {
                        const age = Date.now() - new Date(m.sentAt).getTime()
                        return age < 48 * 3600 * 1000 && m.senderId !== myUserId
                            && !m.receiverId && m.globalMessage && !m.teamId && !m.eventId
                            && !seen.has(`msg-${m.id}`)
                    })
                    count += newMsgs.length
                }

                // Événements récents (7 jours)
                const evtR = await api.get('/events').catch(() => ({ data: [] }))
                const newEvts = evtR.data.filter(ev => {
                    const age = Date.now() - new Date(ev.startDate || ev.date || ev.createdAt).getTime()
                    return Math.abs(age) < 7 * 86400000 && !seen.has(`evt-${ev.id}`)
                })
                count += newEvts.length

                // Documents récents (7 jours)
                const docR = await api.get('/documents').catch(() => ({ data: [] }))
                const newDocs = docR.data.filter(d => {
                    const age = Date.now() - new Date(d.createdAt || d.uploadedAt).getTime()
                    return age < 7 * 86400000 && !seen.has(`doc-${d.id}`)
                })
                count += newDocs.length

                setUnreadCount(count)
            } catch {}
        }
        fetchUnread()
        const interval = setInterval(fetchUnread, 15000)
        return () => clearInterval(interval)
    }, [location.pathname])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('userId')
        navigate('/')
    }

    const canSee = (item) => {
        if (!item.roles) return true
        return item.roles.some(r => role === r || role.includes(r))
    }

    return (
        <div className="page">
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        <a href="/" className="navbar-logo">LIAS</a>
                        <div className="navbar-actions">
                            <a href="/" className="btn btn-ghost btn-sm" style={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.15)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                Accueil
                            </a>
                            <span className="navbar-badge">{role.replace('ROLE_', '')}</span>
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}>
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="dash-layout">
                <aside className="dash-sidebar">
                    {SIDEBAR_ITEMS.map(section => {
                        const visible = section.items.filter(canSee)
                        if (visible.length === 0) return null
                        return (
                            <div key={section.section} className="sidebar-section">
                                <p className="sidebar-label">{section.section}</p>
                                {visible.map(item => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className={`sidebar-item${location.pathname === item.href ? ' active' : ''}`}>
                                        <span className="sidebar-icon">{item.icon}</span>
                                        {item.label}
                                        {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                                            <span style={{
                                                marginLeft: 'auto',
                                                background: '#ef4444',
                                                color: '#fff',
                                                borderRadius: '10px',
                                                padding: '1px 7px',
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                minWidth: '18px',
                                                textAlign: 'center',
                                            }}>
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </a>
                                ))}
                            </div>
                        )
                    })}
                </aside>
                <main className="dash-content">{children}</main>
            </div>
            <footer className="footer">
                <div className="container">
                    <p className="footer-text">© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</p>
                </div>
            </footer>
        </div>
    )
}

/* SVG Icons */
function GridIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function UserIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function DocIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function ChatIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function BellIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> }
function BoxIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> }
function FolderIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> }
function CheckIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
function UsersIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function LayersIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> }
function CalIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function ClipIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> }
function LinkIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> }
function ServerIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg> }
function ShieldIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function HistIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg> }
function ChartIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
