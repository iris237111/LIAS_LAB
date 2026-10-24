import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const NAV = { background: '#134e4a', width: '100%' }
const BTN_PRIMARY = { background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const BTN_DANGER = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }
const INPUT = { width: '100%', padding: '11px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', color: '#111827' }
const LABEL = { fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }

const TYPE_COLOR = {
    CONFERENCE: { bg: '#dbeafe', color: '#1d4ed8', label: 'Conférence' },
    SEMINAR:    { bg: '#d1fae5', color: '#065f46', label: 'Séminaire' },
    WORKSHOP:   { bg: '#fef3c7', color: '#92400e', label: 'Workshop' },
}

const EMPTY_FORM = { title: '', type: 'CONFERENCE', startDate: '', endDate: '', location: '', description: '', edition: '' }

export default function EvenementsDashboard() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchEvents()
    }, [])

    const fetchEvents = () => {
        api.get('/events').then(r => { setEvents(r.data); setLoading(false) })
            .catch(() => navigate('/login'))
    }

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
    const openEdit = (ev) => {
        setForm({
            title: ev.title || '', type: ev.type || 'CONFERENCE',
            startDate: ev.startDate?.slice(0, 10) || '', endDate: ev.endDate?.slice(0, 10) || '',
            location: ev.location || '', description: ev.description || '', edition: ev.edition || ''
        })
        setEditId(ev.id); setShowForm(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            if (editId) await api.put(`/events/${editId}`, form)
            else await api.post('/events', form)
            setShowForm(false); fetchEvents()
        } catch { alert('Erreur lors de la sauvegarde.') }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cet événement ?')) return
        await api.delete(`/events/${id}`).catch(() => alert('Erreur'))
        fetchEvents()
    }

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            <div style={NAV}>
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
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Gestion des événements</h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Créez et gérez les conférences, séminaires et workshops</p>
                    </div>
                    <button onClick={openCreate} style={BTN_PRIMARY}>+ Nouvel événement</button>
                </div>

                {/* FORM */}
                {showForm && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '0.5px solid #99f6e4', marginBottom: '28px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#134e4a', margin: '0 0 24px' }}>
                            {editId ? 'Modifier l\'événement' : 'Nouvel événement'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={LABEL}>Titre *</label>
                                <input style={INPUT} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titre de l'événement" />
                            </div>
                            <div>
                                <label style={LABEL}>Type</label>
                                <select style={INPUT} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="CONFERENCE">Conférence</option>
                                    <option value="SEMINAR">Séminaire</option>
                                    <option value="WORKSHOP">Workshop</option>
                                </select>
                            </div>
                            <div>
                                <label style={LABEL}>Édition / numéro</label>
                                <input style={INPUT} value={form.edition} onChange={e => setForm({ ...form, edition: e.target.value })} placeholder="Ex: 3ème édition" />
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
                                <label style={LABEL}>Lieu</label>
                                <input style={INPUT} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ex: Faculté des Sciences Ben M'Sik" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={LABEL}>Description</label>
                                <textarea rows={3} style={{ ...INPUT, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description de l'événement..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSave} disabled={saving} style={{ ...BTN_PRIMARY, opacity: saving ? 0.6 : 1 }}>
                                {saving ? 'Sauvegarde...' : editId ? 'Enregistrer' : 'Créer l\'événement'}
                            </button>
                            <button onClick={() => setShowForm(false)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {/* LIST */}
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucun événement</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {events.map(ev => {
                            const t = TYPE_COLOR[ev.type] || { bg: '#f0fdfa', color: '#0d9488', label: ev.type }
                            const date = ev.startDate ? new Date(ev.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
                            return (
                                <div key={ev.id} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <span style={{ background: t.bg, color: t.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>{t.label}</span>
                                            {ev.edition && <span style={{ fontSize: '12px', color: '#9ca3af' }}>{ev.edition}</span>}
                                        </div>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#134e4a' }}>{ev.title}</div>
                                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                                            📅 {date} {ev.location ? `· 📍 ${ev.location}` : ''}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                        <button onClick={() => openEdit(ev)} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                            ✏️ Modifier
                                        </button>
                                        <button onClick={() => handleDelete(ev.id)} style={BTN_DANGER}>🗑️</button>
                                    </div>
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
