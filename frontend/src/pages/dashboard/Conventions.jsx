import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const EMPTY = { title: '', partnerName: '', startDate: '', endDate: '', description: '' }

export default function Conventions() {
    const [conventions, setConventions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => { fetchConventions() }, [])

    const fetchConventions = () => {
        api.get('/conventions').then(r => setConventions(r.data)).finally(() => setLoading(false))
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            if (editId) { await api.put(`/conventions/${editId}`, form) }
            else { await api.post('/conventions', form) }
            setShowForm(false); setForm(EMPTY); setEditId(null); fetchConventions()
        } catch { alert('Erreur.') } finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette convention ?')) return
        try { await api.delete(`/conventions/${id}`); fetchConventions() } catch { alert('Erreur.') }
    }

    const fmt = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—'
    const isActive = (c) => {
        const now = new Date()
        const start = c.startDate ? new Date(c.startDate) : null
        const end = c.endDate ? new Date(c.endDate) : null
        if (!start) return false
        if (!end) return start <= now
        return start <= now && now <= end
    }

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Conventions</h1>
                    <p className="page-subtitle">Partenariats et accords de coopération</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }} className="btn btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px' }}>{editId ? 'Modifier la convention' : 'Nouvelle convention'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Titre</label>
                            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Partenaire</label>
                            <input className="form-input" value={form.partnerName} onChange={e => setForm({ ...form, partnerName: e.target.value })} placeholder="Nom de l'institution partenaire" />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Date de début</label>
                                <input type="date" className="form-input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date de fin</label>
                                <input type="date" className="form-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Description</label>
                            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
                            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn btn-secondary">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <div className="loading">Chargement...</div> : conventions.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </div>
                    <p className="empty-title">Aucune convention</p>
                    <p className="empty-desc">Enregistrez votre premier partenariat.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Titre</th><th>Partenaire</th><th>Début</th><th>Fin</th><th>Statut</th><th>Actions</th></tr></thead>
                        <tbody>
                            {conventions.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</td>
                                    <td>{c.partnerName || '—'}</td>
                                    <td>{fmt(c.startDate)}</td>
                                    <td>{fmt(c.endDate)}</td>
                                    <td><span className={`badge ${isActive(c) ? 'badge-green' : 'badge-gray'}`}>{isActive(c) ? 'Active' : 'Expirée'}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => { setForm({ title: c.title, partnerName: c.partnerName || '', startDate: c.startDate?.split('T')[0] || '', endDate: c.endDate?.split('T')[0] || '', description: c.description || '' }); setEditId(c.id); setShowForm(true) }} className="btn btn-secondary btn-sm">Modifier</button>
                                            <button onClick={() => handleDelete(c.id)} className="btn btn-danger btn-sm">Supprimer</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    )
}
