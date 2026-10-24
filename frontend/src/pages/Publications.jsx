import { useEffect, useState } from 'react'
import { PublicLayout } from '../components/Layout'
import api from '../api'

export default function Publications() {
    const [pubs, setPubs] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        api.get('/public/publications').then(r => setPubs(r.data)).catch(() => {}).finally(() => setLoading(false))
    }, [])

    const filtered = pubs.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.authors?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <PublicLayout>
            <div style={{ background: '#0a1628', padding: '52px 0 48px', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: '10px' }}>Publications</h1>
                    <p style={{ fontSize: '15px', color: '#94a3b8' }}>Productions scientifiques des chercheurs du laboratoire LIAS.</p>
                </div>
            </div>

            <div style={{ padding: '48px 0', background: 'var(--surface-2)' }}>
                <div className="container">
                    <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
                        <input className="form-input" placeholder="Rechercher par titre, auteur..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    {loading ? (
                        <div className="loading">Chargement des publications...</div>
                    ) : filtered.length === 0 ? (
                        <div className="empty">
                            <div className="empty-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            </div>
                            <p className="empty-title">Aucune publication trouvée</p>
                            <p className="empty-desc">Modifiez vos critères de recherche.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filtered.map(p => (
                                <div key={p.id} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'var(--primary-50)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{p.title}</h3>
                                        {p.authors && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{p.authors}</p>}
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            {p.journal && <span className="badge badge-teal">{p.journal}</span>}
                                            {p.year && <span className="badge badge-gray">{p.year}</span>}
                                            {p.type && <span className="badge badge-blue">{p.type}</span>}
                                            {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: '12.5px', color: 'var(--primary)', fontWeight: 600 }}>Voir la publication</a>}
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
