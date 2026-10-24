import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const INPUT = { width: '100%', padding: '11px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', color: '#111827' }
const LABEL = { fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }
const BTN_PRIMARY = { background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }

const STATUS_COLOR = {
    PENDING:  { bg: '#fef3c7', color: '#92400e', label: 'En attente' },
    APPROVED: { bg: '#d1fae5', color: '#065f46', label: 'Approuvée' },
    REJECTED: { bg: '#fef2f2', color: '#991b1b', label: 'Refusée' },
}

const EMPTY_FORM = { materialName: '', quantity: 1, justification: '' }

export default function DemandesMateriel() {
    const [demandes, setDemandes] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [actionLoading, setActionLoading] = useState(null)
    const navigate = useNavigate()
    const role = localStorage.getItem('role')
    const isAdmin = role?.includes('ADMIN') || role?.includes('DIRECTOR')

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchDemandes()
    }, [])

    const fetchDemandes = () => {
        api.get('/material-requests').then(r => { setDemandes(r.data); setLoading(false) })
            .catch(() => navigate('/login'))
    }

    const handleSubmit = async () => {
        if (!form.materialName.trim()) { alert('Le nom du matériel est obligatoire.'); return }
        setSaving(true)
        try {
            await api.post('/material-requests', form)
            setForm(EMPTY_FORM); setShowForm(false); fetchDemandes()
        } catch { alert('Erreur lors de la soumission.') }
        finally { setSaving(false) }
    }

    const handleDecision = async (id, status) => {
        setActionLoading(id)
        try {
            await api.post(`/material-requests/${id}/decision?status=${status}`)
            fetchDemandes()
        } catch { alert('Erreur lors de la décision.') }
        finally { setActionLoading(null) }
    }

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

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

            <div style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Demandes de matériel</h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                            {isAdmin ? 'Gérez et validez les demandes de matériel des membres' : 'Soumettez vos besoins en matériel au laboratoire'}
                        </p>
                    </div>
                    {!isAdmin && (
                        <button onClick={() => setShowForm(true)} style={BTN_PRIMARY}>+ Nouvelle demande</button>
                    )}
                </div>

                {/* FORMULAIRE SOUMISSION */}
                {showForm && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '0.5px solid #99f6e4', marginBottom: '28px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#134e4a', margin: '0 0 24px' }}>Nouvelle demande de matériel</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={LABEL}>Matériel demandé *</label>
                                <input style={INPUT} value={form.materialName} onChange={e => setForm({ ...form, materialName: e.target.value })} placeholder="Ex: Ordinateur portable, Projecteur..." />
                            </div>
                            <div>
                                <label style={LABEL}>Quantité</label>
                                <input type="number" min="1" style={INPUT} value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={LABEL}>Justification</label>
                                <textarea rows={3} style={{ ...INPUT, resize: 'vertical' }} value={form.justification} onChange={e => setForm({ ...form, justification: e.target.value })} placeholder="Expliquez pourquoi vous avez besoin de ce matériel..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSubmit} disabled={saving} style={{ ...BTN_PRIMARY, opacity: saving ? 0.6 : 1 }}>
                                {saving ? 'Envoi...' : 'Soumettre la demande'}
                            </button>
                            <button onClick={() => setShowForm(false)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {/* LISTE */}
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : demandes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucune demande pour le moment</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {demandes.map(d => {
                            const s = STATUS_COLOR[d.status] || STATUS_COLOR.PENDING
                            return (
                                <div key={d.id} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '22px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#134e4a', marginBottom: '4px' }}>
                                                📦 {d.materialName}
                                                <span style={{ marginLeft: '10px', fontSize: '13px', color: '#0d9488', fontWeight: 600 }}>× {d.quantity}</span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Demandeur ID : {d.requestedBy}</div>
                                        </div>
                                        <span style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', flexShrink: 0 }}>
                                            {s.label}
                                        </span>
                                    </div>

                                    {d.justification && (
                                        <div style={{ background: '#f0fdfa', borderRadius: '8px', padding: '12px', marginBottom: '14px', fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
                                            <span style={{ fontWeight: 600, color: '#134e4a' }}>Justification : </span>{d.justification}
                                        </div>
                                    )}

                                    {isAdmin && d.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => handleDecision(d.id, 'APPROVED')}
                                                disabled={actionLoading === d.id}
                                                style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                                                ✅ Approuver
                                            </button>
                                            <button
                                                onClick={() => handleDecision(d.id, 'REJECTED')}
                                                disabled={actionLoading === d.id}
                                                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                                                ❌ Refuser
                                            </button>
                                        </div>
                                    )}

                                    {d.reviewedAt && (
                                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '10px' }}>
                                            Traité le {new Date(d.reviewedAt).toLocaleDateString('fr-FR')}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div style={{ background: '#134e4a', padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>
        </div>
    )
}
