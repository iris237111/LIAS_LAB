import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const EMPTY = { name: '', description: '', theme: '' }

export default function Equipes() {
    const [equipes, setEquipes] = useState([])
    const [membres, setMembres] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [expanded, setExpanded] = useState(null)
    const [assignMember, setAssignMember] = useState('')

    useEffect(() => {
        Promise.all([
            api.get('/public/teams').then(r => setEquipes(r.data)),
            api.get('/members').then(r => setMembres(r.data)),
        ]).finally(() => setLoading(false))
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true)
        try {
            if (editId) { await api.put(`/teams/${editId}`, form) }
            else { await api.post('/teams', form) }
            setShowForm(false); setForm(EMPTY); setEditId(null)
            api.get('/public/teams').then(r => setEquipes(r.data))
        } catch { alert('Erreur.') } finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette équipe ?')) return
        try {
            // Retirer tous les membres de cette équipe d'abord
            const teamMembres = membres.filter(m => m.currentTeamId === id)
            await Promise.all(teamMembres.map(m => api.put(`/members/${m.id}`, { ...m, currentTeamId: null })))
            await api.delete(`/teams/${id}`)
            api.get('/public/teams').then(r => setEquipes(r.data))
            api.get('/members').then(r => setMembres(r.data))
        } catch { alert('Erreur lors de la suppression.') }
    }

    const handleAssign = async (equipeId) => {
        if (!assignMember) return
        try {
            const existing = membres.find(m => String(m.id) === String(assignMember))
            if (!existing) return
            await api.put(`/members/${assignMember}`, { ...existing, currentTeamId: equipeId })
            // Notifier le membre
            const team = equipes.find(e => e.id === equipeId)
            if (existing.userId) {
                api.post('/notifications', {
                    userId: existing.userId,
                    message: `Vous avez été assigné à l'équipe "${team?.name || `#${equipeId}`}"`,
                    type: 'TEAM_ASSIGNMENT',
                    read: false,
                }).catch(() => {})
            }
            api.get('/members').then(r => setMembres(r.data))
            setAssignMember('')
        } catch { alert('Erreur lors de l\'assignation.') }
    }

    const handleUnassign = async (membre) => {
        try {
            await api.put(`/members/${membre.id}`, { ...membre, currentTeamId: null })
            api.get('/members').then(r => setMembres(r.data))
        } catch { alert('Erreur lors du retrait.') }
    }

    const teamMembers = (teamId) => membres.filter(m => m.currentTeamId === teamId)
    const unassigned = membres.filter(m => !m.currentTeamId)

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Équipes</h1>
                    <p className="page-subtitle">Gestion des équipes de recherche</p>
                </div>
                <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }} className="btn btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Créer une équipe
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px' }}>{editId ? 'Modifier l\'équipe' : 'Nouvelle équipe'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Nom de l'équipe</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Ex: Équipe Intelligence Artificielle" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Axes de recherche, objectifs..." />
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Thème de recherche</label>
                            <input className="form-input" value={form.theme || ''} onChange={e => setForm({ ...form, theme: e.target.value })} placeholder="Ex: Intelligence Artificielle, Cybersécurité..." />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
                            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn btn-secondary">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <div className="loading">Chargement...</div> : equipes.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                    </div>
                    <p className="empty-title">Aucune équipe</p>
                    <p className="empty-desc">Créez la première équipe de recherche.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {equipes.map(eq => {
                        const members = teamMembers(eq.id)
                        const isOpen = expanded === eq.id
                        return (
                            <div key={eq.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{eq.name}</div>
                                        {eq.description && <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>{eq.description}</div>}
                                        <span className="badge badge-teal">{members.length} membre{members.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button onClick={() => setExpanded(isOpen ? null : eq.id)} className="btn btn-ghost btn-sm">
                                            {isOpen ? 'Masquer' : 'Membres'}
                                        </button>
                                        <button onClick={() => { setForm({ name: eq.name, description: eq.description || '', theme: eq.theme || '' }); setEditId(eq.id); setShowForm(true) }} className="btn btn-secondary btn-sm">Modifier</button>
                                        <button onClick={() => handleDelete(eq.id)} className="btn btn-danger btn-sm">Supprimer</button>
                                    </div>
                                </div>

                                {isOpen && (
                                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                        {members.length > 0 && (
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Membres actuels</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {members.map(m => (
                                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-2)', padding: '5px 10px', borderRadius: '20px', fontSize: '13px' }}>
                                                            <div className="avatar avatar-sm" style={{ width: '20px', height: '20px', fontSize: '8px' }}>{(m.firstName?.[0] || '') + (m.lastName?.[0] || '')}</div>
                                                            {m.firstName} {m.lastName}
                                                            <button onClick={() => handleUnassign(m)} title="Retirer de l'équipe" style={{ marginLeft: '2px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', padding: '0' }}>
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <select className="form-input" style={{ flex: 1, maxWidth: '280px' }} value={assignMember} onChange={e => setAssignMember(e.target.value)}>
                                                <option value="">Assigner un membre...</option>
                                                {unassigned.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                                                {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName} (déjà assigné)</option>)}
                                            </select>
                                            <button onClick={() => handleAssign(eq.id)} disabled={!assignMember} className="btn btn-primary btn-sm">Assigner</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </DashboardLayout>
    )
}
