import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const role = localStorage.getItem('role')

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }
        api.get('/public/stats').then(r => {
            setStats(r.data)
            setLoading(false)
        }).catch(() => {
            setLoading(false)
        })
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('userId')
        navigate('/')
    }

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* NAVBAR */}
            <div style={{ background: '#134e4a', width: '100%' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
                    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0' }}>
                        <a href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#ccfbf1', letterSpacing: '2px', textDecoration: 'none' }}>LIAS</a>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <span style={{ background: '#0d9488', color: 'white', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>
                                {role?.replace('ROLE_', '') || 'MEMBRE'}
                            </span>
                            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #99f6e4', color: '#99f6e4', padding: '7px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                Déconnexion
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px' }}>

                {/* Welcome */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#134e4a', letterSpacing: '-1px', margin: '0 0 6px' }}>
                        Tableau de bord
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Bienvenue dans votre espace membre LIAS</p>
                </div>

                {/* Stats */}
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', fontSize: '16px', padding: '40px' }}>Chargement...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        {[
                            { label: 'Membres', value: stats?.members ?? '—', icon: '👥', href: '/dashboard/membres' },
                            { label: 'Équipes', value: stats?.teams ?? '—', icon: '🔬', href: '/equipes' },
                            { label: 'Publications', value: stats?.publications ?? '—', icon: '📄', href: '/publications' },
                            { label: 'Événements', value: stats?.events ?? '—', icon: '📅', href: '/evenements' },
                        ].map(({ label, value, icon, href }) => (
                            <a key={label} href={href} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '24px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
                                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0d9488' }}>{value}</div>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{label}</div>
                            </a>
                        ))}
                    </div>
                )}

                {/* Quick actions */}
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#134e4a', marginBottom: '16px' }}>Actions rapides</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {[
                            { icon: '📄', label: 'Ajouter une publication', href: '/dashboard/publications' },
                            { icon: '👤', label: 'Mon profil', href: '/dashboard/profil' },
                            { icon: '💬', label: 'Messages internes', href: '/dashboard/messages' },
                            { icon: '🔔', label: 'Notifications', href: '/dashboard/notifications' },
                            { icon: '📦', label: 'Demandes de matériel', href: '/dashboard/demandes-materiel' },
                            { icon: '📁', label: 'Documents', href: '/dashboard/documents' },
                            ...(role?.includes('ADMIN') || role?.includes('DIRECTOR') ? [
                                { icon: '✅', label: 'Demandes d\'adhésion', href: '/dashboard/adhesions' },
                                { icon: '👥', label: 'Gérer les membres', href: '/dashboard/membres' },
                                { icon: '🔬', label: 'Gérer les équipes', href: '/dashboard/equipes' },
                                { icon: '📅', label: 'Gérer les événements', href: '/dashboard/evenements' },
                                { icon: '📋', label: 'Réunions & PV', href: '/dashboard/reunions' },
                                { icon: '🤝', label: 'Conventions', href: '/dashboard/conventions' },
                                { icon: '🖥️', label: 'Inventaire matériel', href: '/dashboard/materiel' },
                                { icon: '🏛️', label: 'Mandats & Gouvernance', href: '/dashboard/mandats' },
                                { icon: '📜', label: 'Historique des rôles', href: '/dashboard/historique-roles' },
                                { icon: '📊', label: 'Rapport annuel', href: '/dashboard/rapport' },
                            ] : []),
                        ].map(({ icon, label, href }) => (
                            <a key={label} href={href} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '10px', padding: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <span style={{ fontSize: '24px' }}>{icon}</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#134e4a' }}>{label}</span>
                            </a>
                        ))}
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <div style={{ background: '#134e4a', padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>

        </div>
    )
}