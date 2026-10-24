import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const STATUS = {
    PENDING:  { cls: 'badge-yellow', label: 'En attente' },
    APPROVED: { cls: 'badge-green', label: 'Approuvée' },
    REJECTED: { cls: 'badge-red', label: 'Refusée' },
}

export default function DemandesMateriel() {
    const [demandes, setDemandes] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ itemName: '', quantity: 1, reason: '' })
    const [saving, setSaving] = useState(false)
    const role = localStorage.getItem('role') || ''
    const isAdmin = role.includes('ADMIN') || role.includes('DIRECTOR')

    useEffect(() => { fetchDemandes() }, [])

    const fetchDemandes = () => {
        const endpoint = isAdmin ? '/material-requests' : '/material-requests/my'
        api.get(endpoint).then(r => setDemandes(r.data)).finally(() => setLoading(false))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.post('/material-requests', form)
            setShowForm(false)
            setForm({ itemName: '', quantity: 1, reason: '' })
            fetchDemandes()
        } catch {
            alert('Erreur lors de l\'envoi.')
        } finally {
            setSaving(false)
        }
    }

    const handleDecision = async (id, status) => {
        try {
            await api.post(`/material-requests/${id}/decision?status=${status}`)
            fetchDemandes()
        } catch {
            alert('Erreur.')
        }
    }

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Demandes de matériel</h1>
                    <p className="page-subtitle">{isAdmin ? 'Gérez les demandes des membres' : 'Soumettez et suivez vos demandes'}</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Nouvelle demande
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px' }}>Nouvelle demande de matériel</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Désignation du matériel</label>
                                <input className="form-input" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} required placeholder="Ex: Ordinateur portable, projecteur..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Quantité</label>
                                <input type="number" className="form-input" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Justification</label>
                            <textarea className="form-input" rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Expliquez pourquoi vous avez besoin de ce matériel..." />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Envoi...' : 'Soumettre la demande'}</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <div className="loading">Chargement...</div> : demandes.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    </div>
                    <p className="empty-title">Aucune demande</p>
                    <p className="empty-desc">Soumettez votre première demande de matériel.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Matériel</th>
                                <th>Qté</th>
                                {isAdmin && <th>Demandeur</th>}
                                <th>Justification</th>
                                <th>Statut</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {demandes.map(d => {
                                const s = STATUS[d.status] || STATUS.PENDING
                                return (
                                    <tr key={d.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.itemName}</td>
                                        <td>{d.quantity}</td>
                                        {isAdmin && <td>{d.memberName || '—'}</td>}
                                        <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.reason || '—'}</td>
                                        <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                                        {isAdmin && (
                                            <td>
                                                {d.status === 'PENDING' && (
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button onClick={() => handleDecision(d.id, 'APPROVED')} className="btn btn-primary btn-sm">Approuver</button>
                                                        <button onClick={() => handleDecision(d.id, 'REJECTED')} className="btn btn-danger btn-sm">Refuser</button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    )
}
