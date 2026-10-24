import { useEffect, useState } from 'react'
import api from '../api'

export default function Publications() {
    const [publications, setPublications] = useState([])
    const [loading, setLoading] = useState(true)
    const role = localStorage.getItem('role')
    const token = localStorage.getItem('token')

    const fetchPublications = () => {
        api.get('/public/publications').then(r => {
            setPublications(r.data)
            setLoading(false)
        })
    }

    useEffect(() => {
        fetchPublications()
    }, [])

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) return
        try {
            await api.delete(`/publications/${id}`)
            fetchPublications()
        } catch (e) {
            alert('Erreur lors de la suppression.')
        }
    }

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#ffffff', minHeight: '100vh', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* NAVBAR */}
            <div style={{ background: '#134e4a', width: '100%' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
                    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #1a6b65' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#ccfbf1', letterSpacing: '2px' }}>LIAS</span>
                        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                            <a href="/" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Accueil</a>
                            <a href="/equipes" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Équipes</a>
                            <a href="/evenements" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Événements</a>
                            <a href="/publications" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Publications</a>
                            <a href="/calendrier" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Calendrier</a>
                            <a href="/recherche" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Recherche</a>
                            {localStorage.getItem('token') ? (
                                <a href="/dashboard" style={{ background: '#2dd4bf', color: '#134e4a', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Dashboard</a>
                            ) : (
                                <a href="/login" style={{ background: '#2dd4bf', color: '#134e4a', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Connexion</a>
                            )}
                        </div>
                    </nav>

                    {/* PAGE HEADER */}
                    <div style={{ padding: '40px 0 36px', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#5eead4', fontWeight: 700, letterSpacing: '4px', marginBottom: '10px' }}>SCIENCE & RECHERCHE</div>
                        <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1.5px', margin: 0 }}>Nos Publications</h1>
                        <p style={{ color: '#99f6e4', fontSize: '15px', marginTop: '10px' }}>Articles, conférences et journaux scientifiques du LIAS</p>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '50px 40px' }}>

                {/* Bouton ajouter si connecté */}
                {token && (
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <a href="/dashboard/publications" style={{ background: '#0d9488', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
                            + Ajouter une publication
                        </a>
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', fontSize: '16px' }}>Chargement...</div>
                ) : publications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucune publication pour le moment</div>
                        <div style={{ fontSize: '14px', marginTop: '8px' }}>Les publications seront affichées ici dès leur ajout.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {publications.map(pub => (
                            <div key={pub.id} style={{ background: '#f0fdfa', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

                                {/* Année */}
                                <div style={{ background: '#0d9488', color: 'white', borderRadius: '8px', padding: '10px 14px', textAlign: 'center', minWidth: '60px', flexShrink: 0 }}>
                                    <div style={{ fontSize: '16px', fontWeight: 800 }}>{pub.year || '—'}</div>
                                </div>

                                {/* Contenu */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#134e4a', marginBottom: '6px' }}>{pub.title}</div>
                                    {pub.authors && (
                                        <div style={{ fontSize: '13px', color: '#0d9488', marginBottom: '6px', fontWeight: 500 }}>
                                            👤 {pub.authors}
                                        </div>
                                    )}
                                    {pub.abstractText && (
                                        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginBottom: '10px' }}>
                                            {pub.abstractText.length > 200 ? pub.abstractText.substring(0, 200) + '...' : pub.abstractText}
                                        </div>
                                    )}
                                    {pub.doi && (
                                        <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer"
                                           style={{ fontSize: '12px', color: '#0d9488', textDecoration: 'none', fontWeight: 600 }}>
                                            DOI: {pub.doi} →
                                        </a>
                                    )}
                                </div>

                                {/* Bouton supprimer si admin */}
                                {token && (role?.includes('ADMIN') || role?.includes('DIRECTOR') || String(pub.addedBy) === localStorage.getItem('userId')) && (
                                    <button
                                        onClick={() => handleDelete(pub.id)}
                                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                                        🗑️ Supprimer
                                    </button>
                                )}

                            </div>
                        ))}
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