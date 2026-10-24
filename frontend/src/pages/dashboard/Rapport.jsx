import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

export default function Rapport() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [year, setYear] = useState(new Date().getFullYear())

    useEffect(() => {
        Promise.all([
            api.get('/public/stats').then(r => r.data).catch(() => null),
            api.get('/members').then(r => r.data).catch(() => []),
            api.get('/public/publications').then(r => r.data).catch(() => []),
            api.get('/public/events').then(r => r.data).catch(() => []),
            api.get('/public/teams').then(r => r.data).catch(() => []),
        ]).then(([globalStats, members, pubs, events, teams]) => {
            const pubsThisYear = pubs.filter(p => p.year === year)
            const eventsThisYear = events.filter(e => e.startDate && new Date(e.startDate).getFullYear() === year)
            setStats({ globalStats, members, pubs, pubsThisYear, events, eventsThisYear, teams })
        }).finally(() => setLoading(false))
    }, [year])

    const roleCount = (role) => stats?.members?.filter(m => m.type === role).length || 0

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Rapport annuel</h1>
                    <p className="page-subtitle">Synthèse des activités du laboratoire</p>
                </div>
                <select className="form-input" style={{ width: 'auto' }} value={year} onChange={e => setYear(parseInt(e.target.value))}>
                    {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            {loading ? <div className="loading">Chargement...</div> : !stats ? (
                <div className="empty"><p className="empty-title">Données indisponibles</p></div>
            ) : (
                <>
                    {/* Chiffres clés */}
                    <div className="stats-grid" style={{ marginBottom: '28px' }}>
                        {[
                            { label: 'Membres actifs', value: stats.members?.length || 0, color: '#6366f1', desc: 'Total des membres' },
                            { label: 'Équipes', value: stats.teams?.length || 0, color: '#0f766e', desc: 'Équipes de recherche' },
                            { label: `Publications ${year}`, value: stats.pubsThisYear?.length || 0, color: '#0284c7', desc: 'Cette année' },
                            { label: `Événements ${year}`, value: stats.eventsThisYear?.length || 0, color: '#d97706', desc: 'Cette année' },
                        ].map((s, i) => (
                            <div key={i} className="stat-card">
                                <div style={{ fontSize: '30px', fontWeight: 800, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.desc}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid-2" style={{ gap: '20px' }}>
                        {/* Composition */}
                        <div className="card">
                            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', fontSize: '15px' }}>Composition des membres</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                    { role: 'PERMANENT', label: 'Membres permanents', color: '#0f766e' },
                                    { role: 'ASSOCIATE', label: 'Membres associés', color: '#0284c7' },
                                    { role: 'DOCTORAL', label: 'Doctorants', color: '#d97706' },
                                    { role: 'FORMER', label: 'Anciens membres', color: '#7c3aed' },
                                    { role: 'RETIRED', label: 'Retraités', color: '#475569' },
                                ].map(({ role, label, color }) => {
                                    const count = roleCount(role)
                                    const total = stats.members?.length || 1
                                    const pct = Math.round((count / total) * 100)
                                    return (
                                        <div key={role}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
                                            </div>
                                            <div style={{ height: '6px', background: 'var(--surface-3)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.4s' }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Publications */}
                        <div className="card">
                            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', fontSize: '15px' }}>Publications {year}</h3>
                            {stats.pubsThisYear?.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>Aucune publication pour {year}.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {stats.pubsThisYear?.slice(0, 6).map((p, i) => (
                                        <div key={i} style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', fontSize: '13px' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{p.title}</div>
                                            {p.authors && <div style={{ color: 'var(--text-muted)' }}>{p.authors}</div>}
                                        </div>
                                    ))}
                                    {stats.pubsThisYear?.length > 6 && (
                                        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center' }}>+{stats.pubsThisYear.length - 6} autres publications</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    )
}
