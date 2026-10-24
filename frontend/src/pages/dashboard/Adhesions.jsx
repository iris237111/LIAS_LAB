import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const STATUS = {
    PENDING:  { cls: 'badge-yellow', label: 'En attente' },
    ACCEPTED: { cls: 'badge-green', label: 'Acceptée' },
    REJECTED: { cls: 'badge-red', label: 'Refusée' },
}

export default function Adhesions() {
    const [demandes, setDemandes] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)

    useEffect(() => { fetchDemandes() }, [])

    const fetchDemandes = () => {
        api.get('/membership-requests').then(r => setDemandes(r.data)).finally(() => setLoading(false))
    }

    const handleDecision = async (id, accepted, reason = '') => {
        setActionLoading(id)
        try {
            await api.post(`/membership-requests/${id}/decision`, { accepted, reason })
            fetchDemandes()
        } catch {
            alert('Erreur lors de la décision.')
        } finally {
            setActionLoading(null)
        }
    }

    const pending = demandes.filter(d => d.status === 'PENDING')
    const processed = demandes.filter(d => d.status !== 'PENDING')

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Demandes d'adhésion</h1>
                    <p className="page-subtitle">Gérez les candidatures au laboratoire LIAS</p>
                </div>
                {pending.length > 0 && (
                    <span className="badge badge-yellow" style={{ fontSize: '13px', padding: '5px 14px' }}>{pending.length} en attente</span>
                )}
            </div>

            {loading ? (
                <div className="loading">Chargement...</div>
            ) : demandes.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="empty-title">Aucune demande</p>
                    <p className="empty-desc">Les nouvelles demandes d'adhésion apparaîtront ici.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[...demandes].sort((a, b) => (a.status === 'PENDING' ? -1 : 1) - (b.status === 'PENDING' ? -1 : 1)).map(d => {
                        const s = STATUS[d.status] || STATUS.PENDING
                        return (
                            <div key={d.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="avatar">{(d.applicantName?.[0] || d.email?.[0] || '?').toUpperCase()}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{d.applicantName || 'Candidat'}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{d.email}</div>
                                        </div>
                                    </div>
                                    <span className={`badge ${s.cls}`}>{s.label}</span>
                                </div>

                                {d.motivation && (
                                    <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: '14px' }}>
                                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Motivation</div>
                                        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{d.motivation}</p>
                                    </div>
                                )}

                                {d.cvUrl && (
                                    <a href={`http://localhost:8081/${d.cvUrl}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ marginBottom: '14px', display: 'inline-flex' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                        Télécharger le CV
                                    </a>
                                )}

                                {d.status === 'PENDING' && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleDecision(d.id, true)} disabled={actionLoading === d.id} className="btn btn-primary btn-sm">
                                            Accepter
                                        </button>
                                        <button onClick={() => { const r = prompt('Motif du refus (optionnel) :'); handleDecision(d.id, false, r || '') }} disabled={actionLoading === d.id} className="btn btn-danger btn-sm">
                                            Refuser
                                        </button>
                                    </div>
                                )}

                                {d.status !== 'PENDING' && d.decisionReason && (
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Motif : {d.decisionReason}</p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </DashboardLayout>
    )
}
