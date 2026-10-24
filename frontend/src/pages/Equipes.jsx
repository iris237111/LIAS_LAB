import { useEffect, useState } from 'react'
import { PublicLayout } from '../components/Layout'
import api from '../api'

export default function Equipes() {
    const [equipes, setEquipes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/public/teams').then(r => setEquipes(r.data)).catch(() => {}).finally(() => setLoading(false))
    }, [])

    return (
        <PublicLayout>
            <div style={{ background: '#0a1628', padding: '52px 0 48px', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: '10px' }}>Équipes de recherche</h1>
                    <p style={{ fontSize: '15px', color: '#94a3b8' }}>Découvrez les équipes qui composent le laboratoire LIAS.</p>
                </div>
            </div>

            <div style={{ padding: '48px 0', background: 'var(--surface-2)' }}>
                <div className="container">
                    {loading ? (
                        <div className="loading">Chargement des équipes...</div>
                    ) : equipes.length === 0 ? (
                        <div className="empty">
                            <div className="empty-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                            </div>
                            <p className="empty-title">Aucune équipe disponible</p>
                            <p className="empty-desc">Les équipes de recherche seront affichées ici.</p>
                        </div>
                    ) : (
                        <div className="grid-2">
                            {equipes.map(e => (
                                <div key={e.id} className="card">
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                        <div style={{ width: '44px', height: '44px', background: 'var(--primary-50)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{e.name}</h3>
                                            {e.description && <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{e.description}</p>}
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
