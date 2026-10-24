import { useEffect, useState } from 'react'
import { PublicLayout } from '../components/Layout'
import api from '../api'

const TYPE_COLORS = {
    CONFERENCE: { bg: '#dbeafe', color: '#1d4ed8' },
    SEMINAR:    { bg: '#fef3c7', color: '#b45309' },
    WORKSHOP:   { bg: '#f0fdf4', color: '#16a34a' },
    DEFENSE:    { bg: '#fdf2f8', color: '#be185d' },
    OTHER:      { bg: '#f1f5f9', color: '#475569' },
}
const TYPE_LABELS = { CONFERENCE: 'Conférence', SEMINAR: 'Séminaire', WORKSHOP: 'Workshop', DEFENSE: 'Soutenance', OTHER: 'Autre' }
const typeStyle = (t) => ({ ...TYPE_COLORS[t] || TYPE_COLORS.OTHER, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' })
const typeLabel = (t) => TYPE_LABELS[t] || t

export default function Evenements() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/public/events').then(r => setEvents(r.data)).catch(() => {}).finally(() => setLoading(false))
    }, [])

    const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

    return (
        <PublicLayout>
            <div style={{ background: '#0a1628', padding: '52px 0 48px', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: '10px' }}>Événements</h1>
                    <p style={{ fontSize: '15px', color: '#94a3b8' }}>Conférences, séminaires et manifestations scientifiques du laboratoire.</p>
                </div>
            </div>

            <div style={{ padding: '48px 0', background: 'var(--surface-2)' }}>
                <div className="container">
                    {loading ? (
                        <div className="loading">Chargement des événements...</div>
                    ) : events.length === 0 ? (
                        <div className="empty">
                            <div className="empty-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </div>
                            <p className="empty-title">Aucun événement à venir</p>
                            <p className="empty-desc">Les prochains événements seront affichés ici.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {events.map(ev => (
                                <div key={ev.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                    <div style={{ minWidth: '60px', textAlign: 'center', background: 'var(--primary-50)', borderRadius: 'var(--radius)', padding: '10px 8px', border: '1px solid var(--primary-100)' }}>
                                        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                                            {ev.startDate ? new Date(ev.startDate).getDate() : '—'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
                                            {ev.startDate ? new Date(ev.startDate).toLocaleDateString('fr-FR', { month: 'short' }) : ''}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{ev.title}</h3>
                                            {ev.type && <span style={{ ...typeStyle(ev.type) }}>{typeLabel(ev.type)}</span>}
                                        </div>
                                        {ev.description && <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.6 }}>{ev.description}</p>}
                                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                            {ev.location && <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                                {ev.location}
                                            </span>}
                                            {ev.startDate && <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{fmt(ev.startDate)}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    )
}
