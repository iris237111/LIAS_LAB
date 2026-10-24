import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const EMPTY = { title: '', date: '', location: '', agenda: '' }

export default function Reunions() {
    const [reunions, setReunions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { fetchReunions() }, [])

    const fetchReunions = () => {
        api.get('/meetings').then(r => setReunions(r.data)).finally(() => setLoading(false))
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        setError('')
        try {
            const payload = { ...form, date: `${form.date}T00:00:00` }
            if (editId) { await api.put(`/meetings/${editId}`, payload) }
            else { await api.post('/meetings', payload) }
            setShowForm(false); setForm(EMPTY); setEditId(null); fetchReunions()
        } catch (err) { setError(err.response?.data?.message || 'Impossible d’enregistrer la réunion. Vérifiez les informations et réessayez.') } finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette réunion ?')) return
        try { await api.delete(`/meetings/${id}`); fetchReunions() } catch { alert('Erreur.') }
    }

    const fmt = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

    return (
        <DashboardLayout>
        <div className="page-header">
                <div>
                    <h1 className="page-title">Réunions</h1>
                    <p className="page-subtitle">Planifiez les réunions. Rédigez leur PV après la réunion dans la rubrique Procès-verbaux.</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }} className="btn btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px' }}>{editId ? 'Modifier la réunion' : 'Nouvelle réunion'}</h3>
                    {error && <div role="alert" className="form-error" style={{ marginBottom: 14 }}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Titre / Objet</label>
                            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Objet de la réunion" />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Lieu</label>
                                <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Salle, en ligne..." />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Ordre du jour (facultatif)</label>
                            <textarea className="form-input" rows={3} value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })} placeholder="Sujets prévus pour la réunion..." />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
                            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn btn-secondary">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <div className="loading">Chargement...</div> : reunions.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                    </div>
                    <p className="empty-title">Aucune réunion</p>
                    <p className="empty-desc">Enregistrez votre première réunion.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {reunions.map(r => (
                        <div key={r.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{r.title}</div>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        <span>{fmt(r.date)}</span>
                                        {r.location && <span>{r.location}</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <span className="badge">{r.pvContent ? 'PV rédigé' : 'PV à rédiger'}</span>
                                    <button onClick={() => { setForm({ title: r.title, date: r.date?.split('T')[0] || '', location: r.location || '', agenda: r.agenda || '' }); setEditId(r.id); setError(''); setShowForm(true) }} className="btn btn-secondary btn-sm">Modifier</button>
                                    <button onClick={() => handleDelete(r.id)} className="btn btn-danger btn-sm">Supprimer</button>
                                </div>
                            </div>
                            {r.agenda && <p style={{ marginTop: 12, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>Ordre du jour : {r.agenda}</p>}
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
