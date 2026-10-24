import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const BTN_PRIMARY = { background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const BTN_DANGER = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }
const INPUT = { width: '100%', padding: '11px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', color: '#111827' }
const LABEL = { fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }

const EMPTY_FORM = { title: '', partner: '', startDate: '', endDate: '', description: '', documentUrl: '' }

export default function Conventions() {
    const [conventions, setConventions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchConventions()
    }, [])

    const fetchConventions = () => {
        api.get('/conventions').then(r => { setConventions(r.data); setLoading(false) })
            .catch(() => navigate('/login'))
    }

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
    const openEdit = (c) => {
        setForm({
            title: c.title || '', partner: c.partner || '',
            startDate: c.startDate?.slice(0, 10) || '', endDate: c.endDate?.slice(0, 10) || '',
            description: c.description || '', documentUrl: c.documentUrl || ''
        })
        setEditId(c.id); setShowForm(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            if (editId) await api.put(`/conventions/${editId}`, form)
            else await api.post('/conventions', form)
            setShowForm(false); fetchConventions()
        } catch { alert('Erreur lors de la sauvegarde.') }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette convention ?')) return
        await api.delete(`/conventions/${id}`).catch(() => alert('Erreur'))
        fetchConventions()
    }

    const isActive = (c) => {
        if (!c.endDate) return true
        return new Date(c.endDate) >= new Date()
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
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Conventions & Collaborations</h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Gérez les partenariats et conventions du laboratoire</p>
                    </div>
                    <button onClick={openCreate} style={BTN_PRIMARY}>+ Nouvelle convention</button>
                </div>

                {showForm && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '0.5px solid #99f6e4', marginBottom: '28px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#134e4a', margin: '0 0 24px' }}>
                            {editId ? 'Modifier la convention' : 'Nouvelle convention'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={LABEL}>Titre *</label>
                                <input style={INPUT} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Intitulé de la convention" />
                            </div>
                            <div>
                                <label style={LABEL}>Partenaire *</label>
                                <input style={INPUT} value={form.partner} onChange={e => setForm({ ...form, partner: e.target.value })} placeholder="Nom de l'institution partenaire" />
                            </div>
                            <div>
                                <label style={LABEL}>Date de début</label>
                                <input type="date" style={INPUT} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                            </div>
                            <div>
                                <label style={LABEL}>Date de fin</label>
                                <input type="date" style={INPUT} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={LABEL}>Description</label>
                                <textarea rows={3} style={{ ...INPUT, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Objectifs et domaines de collaboration..." />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={LABEL}>Lien vers le document</label>
                                <input style={INPUT} value={form.documentUrl} onChange={e => setForm({ ...form, documentUrl: e.target.value })} placeholder="URL du document de convention" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSave} disabled={saving} style={{ ...BTN_PRIMARY, opacity: saving ? 0.6 : 1 }}>
                                {saving ? 'Sauvegarde...' : editId ? 'Enregistrer' : 'Créer la convention'}
                            </button>
                            <button onClick={() => setShowForm(false)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : conventions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤝</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucune convention enregistrée</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        {conventions.map(c => {
                            const active = isActive(c)
                            const start = c.startDate ? new Date(c.startDate).toLocaleDateString('fr-FR') : '—'
                            const end = c.endDate ? new Date(c.endDate).toLocaleDateString('fr-FR') : 'En cours'
                            return (
                                <div key={c.id} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '22px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <span style={{ background: active ? '#d1fae5' : '#f3f4f6', color: active ? '#065f46' : '#6b7280', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
                                            {active ? 'Active' : 'Expirée'}
                                        </span>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => openEdit(c)} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✏️</button>
                                            <button onClick={() => handleDelete(c.id)} style={BTN_DANGER}>🗑️</button>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#134e4a', marginBottom: '4px' }}>{c.title}</div>
                                    <div style={{ fontSize: '13px', color: '#0d9488', marginBottom: '8px' }}>🤝 {c.partner}</div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>📅 {start} → {end}</div>
                                    {c.description && (
                                        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginBottom: '10px' }}>
                                            {c.description.length > 120 ? c.description.slice(0, 120) + '...' : c.description}
                                        </div>
                                    )}
                                    {c.documentUrl && (
                                        <a href={c.documentUrl} target="_blank" rel="noreferrer"
                                            style={{ fontSize: '13px', color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>
                                            📎 Voir le document
                                        </a>
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
