import { useEffect, useState } from 'react'
import { PublicLayout } from '../components/Layout'
import api from '../api'

export default function Home() {
    const [stats, setStats] = useState(null)

    useEffect(() => {
        api.get('/public/stats').then(r => setStats(r.data)).catch(() => {})
    }, [])

    return (
        <PublicLayout>
            <section className="hero" style={{ textAlign: 'center' }}>
                <div className="container">
                    <p className="hero-eyebrow">Faculté des Sciences Ben M'Sik — Casablanca</p>
                    <h1 className="hero-title">Laboratoire<br />d'Informatique<br />et Applications</h1>
                    <p className="hero-subtitle">
                        Unité de recherche dédiée à l'avancement de l'informatique et de ses applications dans le domaine scientifique et industriel.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="/rejoindre" className="btn btn-primary btn-lg">Rejoindre le laboratoire</a>
                        <a href="/publications" className="btn btn-ghost btn-lg" style={{ color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)' }}>Nos publications</a>
                    </div>
                </div>
            </section>

            <section style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '36px 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center' }}>
                        {[
                            { label: 'Membres actifs', value: stats?.members ?? '—' },
                            { label: 'Équipes de recherche', value: stats?.teams ?? '—' },
                            { label: 'Publications', value: stats?.publications ?? '—' },
                            { label: 'Événements', value: stats?.events ?? '—' },
                        ].map((s, i) => (
                            <div key={i} style={{ padding: '0 24px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-2px', lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '80px 0', background: 'var(--surface-2)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '52px' }}>
                        <h2 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.8px', marginBottom: '10px' }}>
                            Un laboratoire d'excellence
                        </h2>
                        <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
                            Recherche de pointe, collaboration internationale et formation de la prochaine génération de chercheurs.
                        </p>
                    </div>
                    <div className="grid-3">
                        {[
                            {
                                title: 'Recherche avancée',
                                desc: 'Des équipes spécialisées travaillant sur les dernières avancées en informatique théorique et appliquée.',
                                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            },
                            {
                                title: 'Publications scientifiques',
                                desc: 'Des travaux publiés dans les meilleures revues et conférences internationales du domaine.',
                                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            },
                            {
                                title: 'Partenariats industriels',
                                desc: 'Des collaborations actives avec le secteur privé pour des recherches à fort impact technologique.',
                                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            },
                        ].map((f, i) => (
                            <div key={i} className="card">
                                <div style={{ width: '46px', height: '46px', background: 'var(--primary-50)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '18px' }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{f.title}</h3>
                                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ background: 'var(--primary)', padding: '64px 0', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', marginBottom: '12px' }}>
                        Prêt à rejoindre le LIAS ?
                    </h2>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.72)', marginBottom: '28px' }}>
                        Soumettez votre demande d'adhésion et rejoignez notre communauté de chercheurs.
                    </p>
                    <a href="/rejoindre" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>
                        Déposer une candidature
                    </a>
                </div>
            </section>
        </PublicLayout>
    )
}
