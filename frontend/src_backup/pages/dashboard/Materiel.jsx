import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const BTN_PRIMARY = { background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const BTN_DANGER = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }
const INPUT = { width: '100%', padding: '11px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', color: '#111827' }
const LABEL = { fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }

const EMPTY_FORM = { name: '', description: '', quantity: 1, arrivalDate: '', category: '' }

export default function Materiel() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchItems()
    }, [])

    const fetchItems = () => {
        api.get('/material').then(r => { setItems(r.data); setLoading(false) })
            .catch(() => navigate('/login'))
    }

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
    const openEdit = (item) => {
        setForm({
            name: item.name || '', description: item.description || '',
            quantity: item.quantity || 1, arrivalDate: item.arrivalDate?.slice(0, 10) || '',
            category: item.category || ''
        })
        setEditId(item.id); setShowForm(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            if (editId) await api.put(`/material/${editId}`, form)
            else await api.post('/material', form)
            setShowForm(false); fetchItems()
        } catch { alert('Erreur lors de la sauvegarde.') }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cet article ?')) return
        await api.delete(`/material/${id}`).catch(() => alert('Erreur'))
        fetchItems()
    }

    const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0)

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
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Gestion du matériel</h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Inventaire et suivi des équipements du laboratoire</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', color: '#134e4a', fontWeight: 700 }}>
                            {items.length} article{items.length > 1 ? 's' : ''} · {totalItems} unités
                        </div>
                        <button onClick={openCreate} style={BTN_PRIMARY}>+ Ajouter</button>
                    </div>
                </div>

                {showForm && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '0.5px solid #99f6e4', marginBottom: '28px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#134e4a', margin: '0 0 24px' }}>
                            {editId ? 'Modifier l\'article' : 'Nouvel article'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={LABEL}>Nom *</label>
                                <input style={INPUT} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Ordinateur portable" />
                            </div>
                            <div>
                                <label style={LABEL}>Catégorie</label>
                                <input style={INPUT} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Ex: Informatique, Mobilier..." />
                            </div>
                            <div>
                                <label style={LABEL}>Quantité</label>
                                <input type="number" min="1" style={INPUT} value={form.quantity} onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
                            </div>
                            <div>
                                <label style={LABEL}>Date d'arrivée</label>
                                <input type="date" style={INPUT} value={form.arrivalDate} onChange={e => setForm({ ...form, arrivalDate: e.target.value })} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={LABEL}>Description</label>
                                <textarea rows={2} style={{ ...INPUT, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Détails sur le matériel..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSave} disabled={saving} style={{ ...BTN_PRIMARY, opacity: saving ? 0.6 : 1 }}>
                                {saving ? 'Sauvegarde...' : editId ? 'Enregistrer' : 'Ajouter'}
                            </button>
                            <button onClick={() => setShowForm(false)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖥️</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucun matériel enregistré</div>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f0fdfa', borderBottom: '1px solid #99f6e4' }}>
                                    {['Nom', 'Catégorie', 'Quantité', 'Date d\'arrivée', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: '#134e4a', textAlign: 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, idx) => (
                                    <tr key={item.id} style={{ borderBottom: idx < items.length - 1 ? '1px solid #f0fdfa' : 'none' }}>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#134e4a' }}>{item.name}</div>
                                            {item.description && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{item.description.slice(0, 60)}{item.description.length > 60 ? '...' : ''}</div>}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{item.category || '—'}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ background: '#f0fdfa', color: '#0d9488', fontSize: '13px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', border: '1px solid #99f6e4' }}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                                            {item.arrivalDate ? new Date(item.arrivalDate).toLocaleDateString('fr-FR') : '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => openEdit(item)} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✏️</button>
                                                <button onClick={() => handleDelete(item.id)} style={BTN_DANGER}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
