import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/Layout'
import api from '../api'

const QUICK_LINKS = [
    { label: 'Mon profil', href: '/dashboard/profil', desc: 'Modifier mes informations', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, color: '#6366f1' },
    { label: 'Publications', href: '/dashboard/publications', desc: 'Gérer mes travaux', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, color: '#0f766e' },
    { label: 'Messages', href: '/dashboard/messages', desc: 'Messagerie interne', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, color: '#0284c7' },
    { label: 'Notifications', href: '/dashboard/notifications', desc: 'Mes alertes', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, color: '#d97706' },
    { label: 'Matériel', href: '/dashboard/demandes-materiel', desc: 'Demandes de matériel', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>, color: '#7c3aed' },
    { label: 'Documents', href: '/dashboard/documents', desc: 'Archivage documentaire', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>, color: '#0f766e' },
]

const ADMIN_LINKS = [
    { label: 'Adhésions', href: '/dashboard/adhesions', desc: 'Demandes en attente', roles: ['ADMIN','DIRECTOR'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, color: '#10b981' },
    { label: 'Membres', href: '/dashboard/membres', desc: 'Gestion des membres', roles: ['ADMIN'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, color: '#6366f1' },
    { label: 'Équipes', href: '/dashboard/equipes', desc: 'Gestion des équipes', roles: ['ADMIN'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>, color: '#0f766e' },
    { label: 'Événements', href: '/dashboard/evenements', desc: 'Organisation des événements', roles: ['ADMIN','DIRECTOR'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, color: '#0284c7' },
    { label: 'Réunions & PV', href: '/dashboard/reunions', desc: 'Procès-verbaux', roles: ['ADMIN','DIRECTOR'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>, color: '#d97706' },
    { label: 'Conventions', href: '/dashboard/conventions', desc: 'Partenariats', roles: ['ADMIN','DIRECTOR'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>, color: '#7c3aed' },
    { label: 'Inventaire', href: '/dashboard/materiel', desc: 'Matériel du labo', roles: ['ADMIN','DIRECTOR'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>, color: '#0f766e' },
    { label: 'Mandats', href: '/dashboard/mandats', desc: 'Gouvernance', roles: ['ADMIN'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, color: '#6366f1' },
    { label: 'Historique rôles', href: '/dashboard/historique-roles', desc: 'Journal des rôles', roles: ['ADMIN'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg>, color: '#d97706' },
    { label: 'Rapport annuel', href: '/dashboard/rapport', desc: 'Statistiques & bilan', roles: ['ADMIN','DIRECTOR'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, color: '#10b981' },
]

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const role = localStorage.getItem('role') || ''

    useEffect(() => {
        api.get('/public/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false))
    }, [])

    const canSee = (item) => {
        if (!item.roles) return true
        return item.roles.some(r => role === r || role.includes(r))
    }

    const adminLinks = ADMIN_LINKS.filter(canSee)

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tableau de bord</h1>
                    <p className="page-subtitle">Bienvenue dans votre espace membre LIAS</p>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '32px' }}>
                {[
                    { label: 'Membres', value: stats?.members ?? '—', color: '#6366f1', bg: '#eef2ff' },
                    { label: 'Équipes', value: stats?.teams ?? '—', color: '#0f766e', bg: 'var(--primary-50)' },
                    { label: 'Publications', value: stats?.publications ?? '—', color: '#0284c7', bg: '#e0f2fe' },
                    { label: 'Événements', value: stats?.events ?? '—', color: '#d97706', bg: '#fffbeb' },
                ].map((s, i) => (
                    <div key={i} className="stat-card">
                        <div style={{ fontSize: '28px', fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>
                            {loading ? '—' : s.value}
                        </div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Member quick actions */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '-0.2px' }}>Espace membre</h2>
                <div className="grid-3">
                    {QUICK_LINKS.map(l => (
                        <a key={l.href} href={l.href} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', transition: 'box-shadow 0.15s', padding: '18px 20px' }}>
                            <div style={{ width: '40px', height: '40px', background: l.color + '18', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: l.color, flexShrink: 0 }}>
                                {l.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{l.label}</div>
                                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{l.desc}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* Admin quick actions */}
            {adminLinks.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '-0.2px' }}>Administration</h2>
                    <div className="grid-3">
                        {adminLinks.map(l => (
                            <a key={l.href} href={l.href} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', padding: '18px 20px' }}>
                                <div style={{ width: '40px', height: '40px', background: l.color + '18', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: l.color, flexShrink: 0 }}>
                                    {l.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{l.label}</div>
                                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{l.desc}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
