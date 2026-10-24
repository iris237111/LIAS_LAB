import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

export default function Adhesions() {
    const [demandes, setDemandes] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        fetchDemandes()
    }, [])

    const fetchDemandes = () => {
        api.get('/membership-requests').then(r => {
            setDemandes(r.data)
            setLoading(false)
        }).catch(() => navigate('/login'))
    }

    const handleDecision = async (id, accepted, reason = '') => {
        setActionLoading(id)
        try {
            await api.post(`/membership-requests/${id}/decision`, { accepted, reason })
            fetchDemandes()
        } catch (e) {
            alert('Erreur lors de la décision.')
        } finally {
            setActionLoading(null)
        }
    }

    const statusColor = {
        PENDING:  { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
        ACCEPTED: { bg: '#d1fae5', color: '#065f46', label: 'Acceptée' },
        REJECTED: { bg: '#fef2f2', color: '#991b1b', label: 'Refusée' },
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

                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Demandes d'adhésion</h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Gérez les demandes de rejoindre le laboratoire LIAS</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : demandes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucune demande pour le moment</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {demandes.map(d => {
                            const s = statusColor[d.status] || statusColor.PENDING
                            return (
                                <div key={d.id} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '24px' }}>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '17px', fontWeight: 700, color: '#134e4a', marginBottom: '4px' }}>{d.applicantName}</div>
                                            <div style={{ fontSize: '13px', color: '#0d9488' }}>📧 {d.email}</div>
                                        </div>
                                        <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>
                      {s.label}
                    </span>
                                    </div>

                                    {d.motivation && (
                                        <div style={{ background: '#f0fdfa', borderRadius: '8px', padding: '14px', marginBottom: '16px', fontSize: '13px', color: '#374151', lineHeight: 1.7 }}>
                                            <div style={{ fontWeight: 600, color: '#134e4a', marginBottom: '6px' }}>Lettre de motivation :</div>
                                            {d.motivation}
                                        </div>
                                    )}

                                    {d.cvUrl && (
                                        <a href={`http://localhost:8081/${d.cvUrl}`} target="_blank" rel="noreferrer"
                                           style={{ fontSize: '13px', color: '#0d9488', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}>
                                            📎 Télécharger le CV
                                        </a>
                                    )}

                                    {d.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleDecision(d.id, true)}
                                                disabled={actionLoading === d.id}
                                                style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                                                ✅ Accepter
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const reason = prompt('Motif du refus (optionnel) :')
                                                    handleDecision(d.id, false, reason || '')
                                                }}
                                                disabled={actionLoading === d.id}
                                                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                                                ❌ Refuser
                                            </button>
                                        </div>
                                    )}

                                    {d.status !== 'PENDING' && d.decisionReason && (
                                        <div style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                                            Motif : {d.decisionReason}
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