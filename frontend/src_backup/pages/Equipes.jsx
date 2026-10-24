import { useEffect, useState } from 'react'
import api from '../api'

export default function Equipes() {
    const [equipes, setEquipes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/public/teams').then(r => {
            setEquipes(r.data)
            setLoading(false)
        })
    }, [])

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
                        <div style={{ fontSize: '12px', color: '#5eead4', fontWeight: 700, letterSpacing: '4px', marginBottom: '10px' }}>RECHERCHE</div>
                        <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1.5px', margin: 0 }}>Nos Équipes</h1>
                        <p style={{ color: '#99f6e4', fontSize: '15px', marginTop: '10px' }}>Découvrez les équipes de recherche du laboratoire LIAS</p>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '50px 40px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', fontSize: '16px' }}>Chargement...</div>
                ) : equipes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔬</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucune équipe pour le moment</div>
                        <div style={{ fontSize: '14px', marginTop: '8px' }}>Les équipes seront affichées ici dès leur création.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {equipes.map(eq => (
                            <div key={eq.id} style={{ background: '#f0fdfa', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '28px' }}>
                                <div style={{ width: '44px', height: '44px', background: '#0d9488', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                    <span style={{ color: 'white', fontSize: '20px' }}>🔬</span>
                                </div>
                                <div style={{ fontSize: '17px', fontWeight: 700, color: '#134e4a', marginBottom: '8px' }}>{eq.name}</div>
                                <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>{eq.description || 'Équipe de recherche du laboratoire LIAS.'}</div>
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