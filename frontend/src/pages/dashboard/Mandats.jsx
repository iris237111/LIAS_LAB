import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const ROLE_LABELS = { DIRECTOR: 'Directeur', VICE_DIR: 'Vice-Directeur', TEAM_CHIEF: 'Chef d\'équipe', MEMBER: 'Membre' }
const EMPTY = { memberId: '', role: 'DIRECTOR', startDate: '', endDate: '' }

export default function Mandats() {
    const [mandats, setMandats] = useState([])
    const [membres, setMembres] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        Promise.all([
            api.get('/admin/roles-history').then(r => setMandats(r.data)),
            api.get('/members').then(r => setMembres(r.data)),
        ]).finally(() => setLoading(false))
    }, [])

    const refreshMandats = () => api.get('/admin/roles-history').then(r => setMandats(r.data))

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            if (editId) { await api.put(`/admin/roles-history/${editId}`, form) }
            else { await api.post('/admin/roles-history', form) }
            setShowForm(false); setForm(EMPTY); setEditId(null); refreshMandats()
        } catch { alert('Erreur.') } finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer ce mandat ?')) return
        try { await api.delete(`/admin/roles-history/${id}`); refreshMandats() } catch { alert('Erreur.') }
    }

    const fmt = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—'
    const isActive = (m) => !m.endDate || new Date(m.endDate) >= new Date()
    const active = mandats.filter(isActive)
    const archived = mandats.filter(m => !isActive(m))

    const getMemberName = (id) => {
        const m = membres.find(m => m.id === parseInt(id))
        return m ? `${m.firstName} ${m.lastName}` : '—'
    }

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Mandats & Gouvernance</h1>
                    <p className="page-subtitle">Historique des responsabilités du laboratoire</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }} className="btn btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px' }}>{editId ? 'Modifier le mandat' : 'Nouveau mandat'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Membre</label>
                            <select className="form-input" value={form.memberId} onChange={e => setForm({ ...form, memberId: e.target.value })} required>
                                <option value="">Sélectionner un membre...</option>
                                {membres.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Rôle / Responsabilité</label>
                            <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Date de début</label>
                                <input type="date" className="form-input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date de fin (optionnel)</label>
                                <input type="date" className="form-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
                            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn btn-secondary">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <div className="loading">Chargement...</div> : (
                <>
                    {active.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>Mandats actifs</h2>
                            <div className="grid-2">
                                {active.map(m => (
                                    <div key={m.id} className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{getMemberName(m.memberId)}</div>
                                                <span className="badge badge-teal">{ROLE_LABELS[m.role] || m.role}</span>
                                                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '8px' }}>Depuis le {fmt(m.startDate)}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => { setForm({ memberId: m.memberId, role: m.role, startDate: m.startDate?.split('T')[0] || '', endDate: m.endDate?.split('T')[0] || '' }); setEditId(m.id); setShowForm(true) }} className="btn btn-ghost btn-sm">Modifier</button>
                                                <button onClick={() => handleDelete(m.id)} className="btn btn-danger btn-sm">Supprimer</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {archived.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>Mandats archivés</h2>
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>Membre</th><th>Rôle</th><th>Début</th><th>Fin</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {archived.map(m => (
                                            <tr key={m.id}>
                                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getMemberName(m.memberId)}</td>
                                                <td><span className="badge badge-gray">{ROLE_LABELS[m.role] || m.role}</span></td>
                                                <td>{fmt(m.startDate)}</td>
                                                <td>{fmt(m.endDate)}</td>
                                                <td>
                                                    <button onClick={() => handleDelete(m.id)} className="btn btn-danger btn-sm">Supprimer</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {mandats.length === 0 && (
                        <div className="empty">
                            <div className="empty-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                            <p className="empty-title">Aucun mandat enregistré</p>
                            <p className="empty-desc">Ajoutez le premier mandat de gouvernance.</p>
                        </div>
                    )}
                </>
            )}
        </DashboardLayout>
    )
}
