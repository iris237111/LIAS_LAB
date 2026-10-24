import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Recherche() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const token = localStorage.getItem('token')

    const handleSearch = async () => {
        if (query.trim().length < 2) return
        setLoading(true)
        try {
            const res = await api.get(`/search?q=${encodeURIComponent(query)}`)
            setResults(res.data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* NAVBAR */}
            <div style={{ background: '#134e4a', width: '100%' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
                    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #1a6b65' }}>
                        <a href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#ccfbf1', letterSpacing: '2px', textDecoration: 'none' }}>LIAS</a>
                        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                            <a href="/" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Accueil</a>
                            <a href="/equipes" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Équipes</a>
                            <a href="/evenements" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Événements</a>
                            <a href="/calendrier" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Calendrier</a>
                            <a href="/publications" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Publications</a>
                            {token ? (
                                <a href="/dashboard" style={{ background: '#2dd4bf', color: '#134e4a', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Dashboard</a>
                            ) : (
                                <a href="/login" style={{ background: '#2dd4bf', color: '#134e4a', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Connexion</a>
                            )}
                        </div>
                    </nav>

                    {/* Search bar */}
                    <div style={{ padding: '40px 0 36px', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#5eead4', fontWeight: 700, letterSpacing: '4px', marginBottom: '10px' }}>RECHERCHE</div>
                        <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1.5px', margin: '0 0 24px' }}>Recherche globale</h1>
                        <div style={{ display: 'flex', gap: '10px', maxWidth: '600px', margin: '0 auto' }}>
                            <input
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                placeholder="Rechercher membres, publications, événements..."
                                style={{ flex: 1, padding: '14px 18px', borderRadius: '8px', border: 'none', fontSize: '15px', outline: 'none', color: '#111827' }}
                            />
                            <button
                                onClick={handleSearch}
                                disabled={loading || query.trim().length < 2}
                                style={{ background: '#2dd4bf', color: '#134e4a', border: 'none', borderRadius: '8px', padding: '14px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                                {loading ? '...' : '🔍 Rechercher'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RESULTS */}
            <div style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px' }}>

                {results === null ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#374151' }}>Tapez votre recherche ci-dessus</div>
                        <div style={{ fontSize: '14px', marginTop: '8px' }}>Recherchez parmi les membres, publications, événements et documents</div>
                    </div>
                ) : results.total === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#374151' }}>Aucun résultat pour "{query}"</div>
                        <div style={{ fontSize: '14px', marginTop: '8px' }}>Essayez avec d'autres mots-clés</div>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                            <span style={{ fontWeight: 700, color: '#0d9488' }}>{results.total}</span> résultat{results.total > 1 ? 's' : ''} pour "{results.query}"
                        </div>

                        {/* Membres */}
                        {results.members?.length > 0 && (
                            <Section title="👥 Membres" count={results.members.length}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    {results.members.map(m => (
                                        <div key={m.id} style={{ background: '#f0fdfa', border: '0.5px solid #99f6e4', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#0d9488', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                                                {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#134e4a' }}>{m.firstName} {m.lastName}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{m.type || 'Membre'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Publications */}
                        {results.publications?.length > 0 && (
                            <Section title="📄 Publications" count={results.publications.length}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {results.publications.map(p => (
                                        <div key={p.id} style={{ background: '#f0fdfa', border: '0.5px solid #99f6e4', borderRadius: '10px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                            <div style={{ background: '#0d9488', color: 'white', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>{p.year || '—'}</div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#134e4a' }}>{p.title}</div>
                                                {p.authors && <div style={{ fontSize: '12px', color: '#0d9488', marginTop: '4px' }}>👤 {p.authors}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Événements */}
                        {results.events?.length > 0 && (
                            <Section title="📅 Événements" count={results.events.length}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                    {results.events.map(e => (
                                        <div key={e.id} style={{ background: '#f0fdfa', border: '0.5px solid #99f6e4', borderRadius: '10px', padding: '16px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#134e4a', marginBottom: '4px' }}>{e.title}</div>
                                            {e.startDate && <div style={{ fontSize: '12px', color: '#6b7280' }}>📅 {new Date(e.startDate).toLocaleDateString('fr-FR')}</div>}
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {/* Documents */}
                        {results.documents?.length > 0 && (
                            <Section title="📎 Documents" count={results.documents.length}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {results.documents.map(d => (
                                        <div key={d.id} style={{ background: '#f0fdfa', border: '0.5px solid #99f6e4', borderRadius: '10px', padding: '16px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#134e4a' }}>📎 {d.filename}</div>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div style={{ background: '#134e4a', padding: '30px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>

        </div>
    )
}

function Section({ title, count, children }) {
    return (
        <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#134e4a', margin: 0 }}>{title}</h2>
                <span style={{ background: '#0d9488', color: 'white', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>{count}</span>
            </div>
            {children}
        </div>
    )
}