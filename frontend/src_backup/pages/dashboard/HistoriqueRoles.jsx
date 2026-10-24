import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const ROLE_LABELS = {
    DIRECTOR:   { label: 'Directeur',      bg: '#dbeafe', color: '#1d4ed8', icon: '🎓' },
    VICE_DIR:   { label: 'Vice-directeur', bg: '#ede9fe', color: '#5b21b6', icon: '👔' },
    TEAM_CHIEF: { label: 'Chef d\'équipe', bg: '#d1fae5', color: '#065f46', icon: '🔬' },
    MEMBER:     { label: 'Membre',         bg: '#f3f4f6', color: '#374151', icon: '👤' },
}

export default function HistoriqueRoles() {
    const [historique, setHistorique] = useState([])
    const [membres, setMembres] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterRole, setFilterRole] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchAll()
    }, [])

    const fetchAll = async () => {
        const [histRes, membresRes] = await Promise.all([
            api.get('/admin/roles-history'),
            api.get('/members')
        ]).catch(() => { navigate('/login'); return [null, null] })
        if (histRes) setHistorique(histRes.data)
        if (membresRes) setMembres(membresRes.data)
        setLoading(false)
    }

    const getMemberName = (id) => {
        const m = membres.find(m => m.id === id)
        return m ? `${m.firstName} ${m.lastName}` : `Membre #${id}`
    }

    const filtered = historique
        .filter(h => !filterRole || h.role === filterRole)
        .filter(h => !search || getMemberName(h.memberId).toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0))

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            <div style={{ background: '#134e4a', width: '100%' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
                    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0' }}>
                        <a href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#ccfbf1', letterSpacing: '2px', textDecoration: 'none' }}>LIAS</a>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <a href="/dashboard" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>← Dashboard</a>
                            <a href="/dashboard/mandats" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Gérer les mandats</a>
                            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); navigate('/') }}
                                style={{ background: 'transparent', border: '1px solid #99f6e4', color: '#99f6e4', padding: '7px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                Déconnexion
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            <div style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px' }}>

                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Historique des rôles</h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Traçabilité complète de tous les rôles et responsabilités</p>
                </div>

                {/* FILTRES */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un membre..."
                        style={{ padding: '10px 14px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white', color: '#111827', minWidth: '220px' }}
                    />
                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        style={{ padding: '10px 14px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white', color: '#111827' }}>
                        <option value="">Tous les rôles</option>
                        {Object.entries(ROLE_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                    <div style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: '#134e4a', fontWeight: 700 }}>
                        {filtered.length} entrée{filtered.length > 1 ? 's' : ''}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucun historique trouvé</div>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f0fdfa', borderBottom: '1px solid #99f6e4' }}>
                                    {['Membre', 'Rôle', 'Date début', 'Date fin', 'Statut'].map(h => (
                                        <th key={h} style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#134e4a', textAlign: 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((h, idx) => {
                                    const r = ROLE_LABELS[h.role] || { label: h.role, bg: '#f3f4f6', color: '#374151', icon: '👤' }
                                    const active = !h.endDate || new Date(h.endDate) >= new Date()
                                    return (
                                        <tr key={h.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f0fdfa' : 'none', background: active ? '#fafffe' : 'white' }}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '34px', height: '34px', background: '#0d9488', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                                                        {getMemberName(h.memberId).charAt(0)}
                                                    </div>
                                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#134e4a' }}>{getMemberName(h.memberId)}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{ background: r.bg, color: r.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
                                                    {r.icon} {r.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                                                {h.startDate ? new Date(h.startDate).toLocaleDateString('fr-FR') : '—'}
                                            </td>
                                            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                                                {h.endDate ? new Date(h.endDate).toLocaleDateString('fr-FR') : '—'}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{ background: active ? '#d1fae5' : '#f3f4f6', color: active ? '#065f46' : '#6b7280', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
                                                    {active ? 'En cours' : 'Terminé'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={{ background: '#134e4a', padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>
        </div>
    )
}
