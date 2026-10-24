import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const NAV = { background: '#134e4a', width: '100%' }
const BTN_PRIMARY = { background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const BTN_DANGER = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }
const INPUT = { width: '100%', padding: '11px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', color: '#111827' }
const LABEL = { fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }

const EMPTY_FORM = { title: '', meetingDate: '', location: '', agenda: '', pvUrl: '', notes: '' }

export default function Reunions() {
    const [meetings, setMeetings] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchMeetings()
    }, [])

    const fetchMeetings = () => {
        api.get('/meetings').then(r => { setMeetings(r.data); setLoading(false) })
            .catch(() => navigate('/login'))
    }

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
    const openEdit = (m) => {
        setForm({
            title: m.title || '', meetingDate: m.meetingDate?.slice(0, 10) || '',
            location: m.location || '', agenda: m.agenda || '',
            pvUrl: m.pvUrl || '', notes: m.notes || ''
        })
        setEditId(m.id); setShowForm(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            if (editId) await api.put(`/meetings/${editId}`, form)
            else await api.post('/meetings', form)
            setShowForm(false); fetchMeetings()
        } catch { alert('Erreur lors de la sauvegarde.') }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette réunion ?')) return
        await api.delete(`/meetings/${id}`).catch(() => alert('Erreur'))
        fetchMeetings()
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
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Procès-verbaux & Réunions</h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Gérez les réunions, ordres du jour et PV du laboratoire</p>
                    </div>
                    <button onClick={openCreate} style={BTN_PRIMARY}>+ Nouvelle réunion</button>
                </div>

                {showForm && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '0.5px solid #99f6e4', marginBottom: '28px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#134e4a', margin: '0 0 24px' }}>
                            {editId ? 'Modifier la réunion' : 'Nouvelle réunion'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={LABEL}>Titre / Objet *</label>
                                <input style={INPUT} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Réunion mensuelle du conseil" />
                            </div>
                            <div>
                                <label style={LABEL}>Date</label>
                                <input type="date" style={INPUT} value={form.meetingDate} onChange={e => setForm({ ...form, meetingDate: e.target.value })} />
                            </div>
                            <div>
                                <label style={LABEL}>Lieu</label>
                                <input style={INPUT} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ex: Salle de conférences A" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={LABEL}>Ordre du jour</label>
                                <textarea rows={3} style={{ ...INPUT, resize: 'vertical' }} value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })} placeholder="Points à traiter lors de la réunion..." />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={LABEL}>Lien / URL du PV</label>
                                <input style={INPUT} value={form.pvUrl} onChange={e => setForm({ ...form, pvUrl: e.target.value })} placeholder="Lien vers le document PV (drive, serveur...)" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={LABEL}>Notes / Décisions</label>
                                <textarea rows={3} style={{ ...INPUT, resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Résumé des décisions prises..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSave} disabled={saving} style={{ ...BTN_PRIMARY, opacity: saving ? 0.6 : 1 }}>
                                {saving ? 'Sauvegarde...' : editId ? 'Enregistrer' : 'Créer la réunion'}
                            </button>
                            <button onClick={() => setShowForm(false)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : meetings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucune réunion enregistrée</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {meetings.map(m => {
                            const date = m.meetingDate ? new Date(m.meetingDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
                            return (
                                <div key={m.id} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                        <div style={{ width: '44px', height: '44px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>📋</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '15px', fontWeight: 700, color: '#134e4a', marginBottom: '4px' }}>{m.title}</div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                📅 {date} {m.location ? `· 📍 ${m.location}` : ''}
                                            </div>
                                            {m.agenda && (
                                                <div style={{ marginTop: '10px', background: '#f0fdfa', borderRadius: '8px', padding: '10px', fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>
                                                    <span style={{ fontWeight: 600, color: '#134e4a' }}>Ordre du jour : </span>{m.agenda}
                                                </div>
                                            )}
                                            {m.notes && (
                                                <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                                                    Décisions : {m.notes}
                                                </div>
                                            )}
                                            {m.pvUrl && (
                                                <a href={m.pvUrl} target="_blank" rel="noreferrer"
                                                    style={{ display: 'inline-block', marginTop: '8px', fontSize: '13px', color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>
                                                    📎 Consulter le PV
                                                </a>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                            <button onClick={() => openEdit(m)} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                ✏️ Modifier
                                            </button>
                                            <button onClick={() => handleDelete(m.id)} style={BTN_DANGER}>🗑️</button>
                                        </div>
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
