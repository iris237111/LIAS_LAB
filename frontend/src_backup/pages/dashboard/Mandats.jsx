import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const INPUT = { width: '100%', padding: '11px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', color: '#111827' }
const LABEL = { fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }
const BTN_PRIMARY = { background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const BTN_DANGER = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }

const ROLE_LABELS = {
    DIRECTOR:   { label: 'Directeur',       bg: '#dbeafe', color: '#1d4ed8', icon: '🎓' },
    VICE_DIR:   { label: 'Vice-directeur',  bg: '#ede9fe', color: '#5b21b6', icon: '👔' },
    TEAM_CHIEF: { label: 'Chef d\'équipe',  bg: '#d1fae5', color: '#065f46', icon: '🔬' },
    MEMBER:     { label: 'Membre',          bg: '#f3f4f6', color: '#374151', icon: '👤' },
}

const EMPTY_FORM = { memberId: '', role: 'DIRECTOR', startDate: '', endDate: '' }

export default function Mandats() {
    const [mandats, setMandats] = useState([])
    const [membres, setMembres] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchAll()
    }, [])

    const fetchAll = async () => {
        const [mandatsRes, membresRes] = await Promise.all([
            api.get('/admin/roles-history'),
            api.get('/members')
        ]).catch(() => { navigate('/login'); return [null, null] })
        if (mandatsRes) setMandats(mandatsRes.data)
        if (membresRes) setMembres(membresRes.data)
        setLoading(false)
    }

    const getMemberName = (id) => {
        const m = membres.find(m => m.id === id)
        return m ? `${m.firstName} ${m.lastName}` : `Membre #${id}`
    }

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
    const openEdit = (m) => {
        setForm({
            memberId: m.memberId || '',
            role: m.role || 'DIRECTOR',
            startDate: m.startDate || '',
            endDate: m.endDate || ''
        })
        setEditId(m.id); setShowForm(true)
    }

    const handleSave = async () => {
        if (!form.memberId || !form.startDate) { alert('Le membre et la date de début sont obligatoires.'); return }
        setSaving(true)
        try {
            const payload = { ...form, memberId: parseInt(form.memberId) }
            if (editId) await api.put(`/admin/roles-history/${editId}`, payload)
            else await api.post('/admin/roles-history', payload)
            setShowForm(false); fetchAll()
        } catch { alert('Erreur lors de la sauvegarde.') }
        finally { setSaving(false) }
    }

    const isActive = (m) => !m.endDate || new Date(m.endDate) >= new Date()

    const actifs = mandats.filter(m => isActive(m))
    const historique = mandats.filter(m => !isActive(m))

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
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Mandats & Gouvernance</h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Gérez les rôles de gouvernance et l'historique des mandats</p>
                    </div>
                    <button onClick={openCreate} style={BTN_PRIMARY}>+ Nouveau mandat</button>
                </div>

                {/* FORMULAIRE */}
                {showForm && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '0.5px solid #99f6e4', marginBottom: '28px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#134e4a', margin: '0 0 24px' }}>
                            {editId ? 'Modifier le mandat' : 'Nouveau mandat'}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={LABEL}>Membre *</label>
                                <select style={INPUT} value={form.memberId} onChange={e => setForm({ ...form, memberId: e.target.value })}>
                                    <option value="">-- Choisir un membre --</option>
                                    {membres.map(m => (
                                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={LABEL}>Rôle / Responsabilité</label>
                                <select style={INPUT} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v.icon} {v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={LABEL}>Date de début *</label>
                                <input type="date" style={INPUT} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                            </div>
                            <div>
                                <label style={LABEL}>Date de fin <span style={{ color: '#9ca3af', fontWeight: 400 }}>(laisser vide si en cours)</span></label>
                                <input type="date" style={INPUT} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSave} disabled={saving} style={{ ...BTN_PRIMARY, opacity: saving ? 0.6 : 1 }}>
                                {saving ? 'Sauvegarde...' : editId ? 'Enregistrer' : 'Créer le mandat'}
                            </button>
                            <button onClick={() => setShowForm(false)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : (
                    <>
                        {/* MANDATS EN COURS */}
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#134e4a', marginBottom: '14px' }}>
                                Gouvernance actuelle
                                <span style={{ marginLeft: '10px', background: '#0d9488', color: 'white', fontSize: '12px', padding: '2px 10px', borderRadius: '20px' }}>{actifs.length}</span>
                            </h2>
                            {actifs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '30px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4', color: '#9ca3af' }}>
                                    Aucun mandat actif — cliquez sur "Nouveau mandat" pour commencer.
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                    {actifs.map(m => {
                                        const r = ROLE_LABELS[m.role] || { label: m.role, bg: '#f0fdfa', color: '#0d9488', icon: '👤' }
                                        return (
                                            <div key={m.id} style={{ background: 'white', border: `1px solid ${r.bg}`, borderRadius: '12px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{ width: '44px', height: '44px', background: r.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                                                    {r.icon}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#134e4a' }}>{getMemberName(m.memberId)}</div>
                                                    <span style={{ background: r.bg, color: r.color, fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' }}>{r.label}</span>
                                                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                                        Depuis le {m.startDate ? new Date(m.startDate).toLocaleDateString('fr-FR') : '—'}
                                                    </div>
                                                </div>
                                                <button onClick={() => openEdit(m)} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                    ✏️
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* HISTORIQUE */}
                        {historique.length > 0 && (
                            <div>
                                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#134e4a', marginBottom: '14px' }}>
                                    Historique des mandats
                                    <span style={{ marginLeft: '10px', background: '#6b7280', color: 'white', fontSize: '12px', padding: '2px 10px', borderRadius: '20px' }}>{historique.length}</span>
                                </h2>
                                <div style={{ background: 'white', borderRadius: '12px', border: '0.5px solid #e5e7eb', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                                {['Membre', 'Rôle', 'Début', 'Fin', ''].map(h => (
                                                    <th key={h} style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textAlign: 'left' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historique.map((m, idx) => {
                                                const r = ROLE_LABELS[m.role] || { label: m.role, bg: '#f3f4f6', color: '#374151' }
                                                return (
                                                    <tr key={m.id} style={{ borderBottom: idx < historique.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>{getMemberName(m.memberId)}</td>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            <span style={{ background: r.bg, color: r.color, fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' }}>{r.label}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{m.startDate ? new Date(m.startDate).toLocaleDateString('fr-FR') : '—'}</td>
                                                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{m.endDate ? new Date(m.endDate).toLocaleDateString('fr-FR') : '—'}</td>
                                                        <td style={{ padding: '12px 16px' }}>
                                                            <button onClick={() => openEdit(m)} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>✏️</button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div style={{ background: '#134e4a', padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>
        </div>
    )
}
