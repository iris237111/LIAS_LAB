import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

export default function Membres() {
    const [membres, setMembres] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const role = localStorage.getItem('role')

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        fetchMembres()
    }, [])

    const fetchMembres = () => {
        api.get('/members').then(r => {
            setMembres(r.data)
            setLoading(false)
        }).catch(() => navigate('/login'))
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return
        try {
            await api.delete(`/members/${id}`)
            fetchMembres()
        } catch (e) {
            alert('Erreur lors de la suppression.')
        }
    }

    const handleStatusChange = async (id, status) => {
        try {
            await api.patch(`/members/${id}/status`, { status })
            fetchMembres()
        } catch (e) {
            alert('Erreur lors du changement de statut.')
        }
    }

    const statusColor = {
        ACTIVE:    { bg: '#d1fae5', color: '#065f46', label: 'Actif' },
        RETIRED:   { bg: '#fef3c7', color: '#92400e', label: 'Retraité' },
        FORMER:    { bg: '#f3f4f6', color: '#374151', label: 'Ancien' },
        INACTIVE:  { bg: '#fef2f2', color: '#991b1b', label: 'Inactif' },
    }

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* NAVBAR */}
            <div style={{ background: '#134e4a', width: '100%' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
                    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0' }}>
                        <a href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#ccfbf1', letterSpacing: '2px', textDecoration: 'none' }}>LIAS</a>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <a href="/dashboard" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>← Dashboard</a>
                            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); navigate('/') }}
                                    style={{ background: 'transparent', border: '1px solid #99f6e4', color: '#99f6e4', padding: '7px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                Déconnexion
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px' }}>

                <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Gestion des membres</h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Gérez les membres du laboratoire LIAS</p>
                    </div>
                    <div style={{ background: '#0d9488', color: 'white', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 700 }}>
                        {membres.length} membre{membres.length > 1 ? 's' : ''}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : membres.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucun membre</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {membres.map(m => {
                            const s = statusColor[m.status] || statusColor.ACTIVE
                            return (
                                <div key={m.id} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>

                                    {/* Avatar */}
                                    <div style={{ width: '48px', height: '48px', background: '#0d9488', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 800, flexShrink: 0 }}>
                                        {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#134e4a' }}>{m.firstName} {m.lastName}</div>
                                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{m.type || 'Membre'} {m.institution ? `· ${m.institution}` : ''}</div>
                                    </div>

                                    {/* Status badge */}
                                    <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', flexShrink: 0 }}>
                    {s.label}
                  </span>

                                    {/* Actions admin */}
                                    {role?.includes('ADMIN') && (
                                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                            {m.status === 'ACTIVE' && (
                                                <button
                                                    onClick={() => handleStatusChange(m.id, 'RETIRED')}
                                                    style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                    Retraite
                                                </button>
                                            )}
                                            {(m.status === 'ACTIVE' || m.status === 'RETIRED') && (
                                                <button
                                                    onClick={() => handleStatusChange(m.id, 'FORMER')}
                                                    style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                    Ancien
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(m.id)}
                                                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                🗑️
                                            </button>
                                        </div>
                                    )}

                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div style={{ background: '#134e4a', padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>

        </div>
    )
}