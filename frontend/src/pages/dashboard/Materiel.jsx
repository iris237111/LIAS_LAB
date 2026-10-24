import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const EMPTY = { name: '', description: '', quantity: 1, location: '' }

export default function Materiel() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => { fetchItems() }, [])

    const fetchItems = () => {
        api.get('/material').then(r => setItems(r.data)).finally(() => setLoading(false))
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            if (editId) { await api.put(`/material/${editId}`, form) }
            else { await api.post('/material', form) }
            setShowForm(false); setForm(EMPTY); setEditId(null); fetchItems()
        } catch { alert('Erreur.') } finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cet article ?')) return
        try { await api.delete(`/material/${id}`); fetchItems() } catch { alert('Erreur.') }
    }

    const filtered = items.filter(i => `${i.name} ${i.description} ${i.location}`.toLowerCase().includes(search.toLowerCase()))

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Inventaire</h1>
                    <p className="page-subtitle">Gestion du matériel du laboratoire</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }} className="btn btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px' }}>{editId ? 'Modifier l\'article' : 'Nouvel article'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Désignation</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Nom du matériel" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Quantité</label>
                                <input type="number" className="form-input" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Emplacement</label>
                                <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ex: Salle 201, Bureau..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
                            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn btn-secondary">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ marginBottom: '20px', maxWidth: '360px' }}>
                <input className="form-input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? <div className="loading">Chargement...</div> : filtered.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/></svg>
                    </div>
                    <p className="empty-title">Inventaire vide</p>
                    <p className="empty-desc">Ajoutez votre premier article.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Désignation</th><th>Description</th><th>Qté</th><th>Emplacement</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(item => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</td>
                                    <td>{item.description || '—'}</td>
                                    <td>
                                        <span className={`badge ${item.quantity > 0 ? 'badge-green' : 'badge-red'}`}>{item.quantity}</span>
                                    </td>
                                    <td>{item.location || '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => { setForm({ name: item.name, description: item.description || '', quantity: item.quantity, location: item.location || '' }); setEditId(item.id); setShowForm(true) }} className="btn btn-secondary btn-sm">Modifier</button>
                                            <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">Supprimer</button>
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
