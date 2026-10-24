import { useState } from 'react'
import { PublicLayout } from '../components/Layout'
import api from '../api'

export default function Recherche() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return
        setLoading(true)
        try {
            const [pubs, members] = await Promise.all([
                api.get(`/public/publications?search=${encodeURIComponent(query)}`).then(r => r.data).catch(() => []),
                api.get(`/public/members?search=${encodeURIComponent(query)}`).then(r => r.data).catch(() => []),
            ])
            setResults({ pubs, members })
        } finally {
            setLoading(false)
        }
    }

    return (
        <PublicLayout>
            <div style={{ background: '#0a1628', padding: '52px 0 48px', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: '24px' }}>Recherche</h1>
                    <form onSubmit={handleSearch} style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', gap: '10px' }}>
                        <input
                            className="form-input"
                            placeholder="Chercher un membre, une publication..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Recherche...' : 'Rechercher'}
                        </button>
                    </form>
                </div>
            </div>

            <div style={{ padding: '48px 0', background: 'var(--surface-2)' }}>
                <div className="container">
                    {results === null ? (
                        <div className="empty" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                            <p className="empty-desc">Saisissez un terme pour lancer la recherche.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {results.members?.length > 0 && (
                                <div>
                                    <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                                        Membres ({results.members.length})
                                    </h2>
                                    <div className="grid-2">
                                        {results.members.map(m => (
                                            <div key={m.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div className="avatar avatar-lg">{(m.firstName?.[0] || '') + (m.lastName?.[0] || '')}</div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{m.firstName} {m.lastName}</div>
                                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{m.email}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {results.pubs?.length > 0 && (
                                <div>
                                    <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                                        Publications ({results.pubs.length})
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {results.pubs.map(p => (
                                            <div key={p.id} className="card">
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{p.title}</div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.authors}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {results.members?.length === 0 && results.pubs?.length === 0 && (
                                <div className="empty">
                                    <p className="empty-title">Aucun résultat</p>
                                    <p className="empty-desc">Essayez un autre terme de recherche.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    )
}
