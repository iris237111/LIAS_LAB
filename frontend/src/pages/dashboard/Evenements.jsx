import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const EMPTY_FORM = { title: '', description: '', startDate: '', location: '', type: 'CONFERENCE' }

export default function Evenements() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => { fetchEvents() }, [])

    const fetchEvents = () => {
        api.get('/events').then(r => setEvents(r.data)).finally(() => setLoading(false))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const payload = { ...form, startDate: form.startDate ? form.startDate + 'T00:00:00' : null }
            if (editId) {
                await api.put(`/events/${editId}`, payload)
            } else {
                await api.post('/events', payload)
            }
            setShowForm(false); setForm(EMPTY_FORM); setEditId(null)
            fetchEvents()
        } catch {
            alert('Erreur lors de l\'enregistrement.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cet événement ?')) return
        try { await api.delete(`/events/${id}`); fetchEvents() } catch { alert('Erreur.') }
    }

    const openEdit = (ev) => {
        setForm({ title: ev.title, description: ev.description || '', startDate: ev.startDate?.split('T')[0] || '', location: ev.location || '', type: ev.type || 'CONFERENCE' })
        setEditId(ev.id); setShowForm(true)
    }

    const fmt = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Aucune date'

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Événements</h1>
                    <p className="page-subtitle">Gestion des événements du laboratoire</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }} className="btn btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px' }}>{editId ? 'Modifier l\'événement' : 'Nouvel événement'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Titre</label>
                            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input type="date" className="form-input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Lieu</label>
                                <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Type</label>
                            <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                {['CONFERENCE', 'SEMINAR', 'WORKSHOP', 'DEFENSE', 'OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
                            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn btn-secondary">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <div className="loading">Chargement...</div> : events.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <p className="empty-title">Aucun événement</p>
                    <p className="empty-desc">Créez le premier événement du laboratoire.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Titre</th><th>Date</th><th>Lieu</th><th>Type</th><th>Actions</th></tr></thead>
                        <tbody>
                            {events.map(ev => (
                                <tr key={ev.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</td>
                                    <td>{fmt(ev.startDate)}</td>
                                    <td>{ev.location || '—'}</td>
                                    <td><span className="badge badge-blue">{ev.type}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => openEdit(ev)} className="btn btn-secondary btn-sm">Modifier</button>
                                            <button onClick={() => handleDelete(ev.id)} className="btn btn-danger btn-sm">Supprimer</button>
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
