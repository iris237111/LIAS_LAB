import { useEffect, useState } from 'react'
import api from '../api'

export default function Home() {
    const [stats, setStats] = useState(null)

    useEffect(() => {
        api.get('/public/stats').then(r => setStats(r.data))
    }, [])

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>

            {/* HEADER TEAL */}
            <div style={{ background: '#134e4a', width: '100%' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>

                    {/* NAVBAR */}
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

                    {/* HERO */}
                    <div style={{ padding: '60px 0 50px', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#5eead4', fontWeight: 700, letterSpacing: '4px', marginBottom: '12px' }}>
                            LABORATOIRE DE RECHERCHE
                        </div>
                        <h1 style={{ fontSize: '52px', fontWeight: 800, color: '#ffffff', letterSpacing: '-2px', margin: '0 0 16px', lineHeight: 1 }}>
                            Laboratoire LIAS
                        </h1>
                        <p style={{ fontSize: '16px', color: '#99f6e4', margin: '0 auto 30px', maxWidth: '520px', lineHeight: 1.6 }}>
                            Laboratoire d'Informatique et Applications — Faculté des Sciences Ben M'Sik, Casablanca
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <a href="/publications" style={{ background: '#2dd4bf', color: '#134e4a', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 800 }}>
                                Nos Publications →
                            </a>
                            <a href="/equipes" style={{ border: '1.5px solid #2dd4bf', color: '#2dd4bf', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
                                Nos Équipes
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS */}
            <div style={{ background: '#f0fdfa', borderBottom: '1px solid #99f6e4', padding: '28px 40px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {[
                        { label: 'Membres', value: stats?.members ?? '—' },
                        { label: 'Équipes', value: stats?.teams ?? '—' },
                        { label: 'Publications', value: stats?.publications ?? '—' },
                        { label: 'Événements', value: stats?.events ?? '—' },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0d9488' }}>{value}</div>
                            <div style={{ fontSize: '13px', color: '#5eead4', marginTop: '4px', fontWeight: 500 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECTION À PROPOS */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#0d9488', fontWeight: 700, letterSpacing: '3px', marginBottom: '12px' }}>À PROPOS</div>
                        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#111827', letterSpacing: '-1px', marginBottom: '16px' }}>
                            Un laboratoire au cœur de la recherche
                        </h2>
                        <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.8, marginBottom: '20px' }}>
                            Le LIAS est un laboratoire de recherche en informatique affilié à la Faculté des Sciences Ben M'Sik. Il regroupe des chercheurs permanents, associés et doctorants travaillant sur des problématiques avancées en science des données, intelligence artificielle et systèmes distribués.
                        </p>
                        <a href="/equipes" style={{ color: '#0d9488', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                            Découvrir nos équipes →
                        </a>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                            { icon: '🔬', title: 'Recherche', desc: 'Travaux scientifiques de haut niveau' },
                            { icon: '📄', title: 'Publications', desc: 'Articles, conférences et journaux' },
                            { icon: '🎓', title: 'Formation', desc: 'Encadrement de doctorants' },
                            { icon: '🤝', title: 'Partenariats', desc: 'Conventions et collaborations' },
                        ].map(({ icon, title, desc }) => (
                            <div key={title} style={{ background: '#f0fdfa', border: '0.5px solid #99f6e4', borderRadius: '10px', padding: '18px' }}>
                                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#134e4a', marginBottom: '4px' }}>{title}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div style={{ background: '#134e4a', padding: '30px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>
                    © 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca
                </div>
            </div>

        </div>
    )
}