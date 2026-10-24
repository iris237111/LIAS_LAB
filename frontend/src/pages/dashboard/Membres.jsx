import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const TYPE_LABELS = {
    PERMANENT: 'Membre permanent', ASSOCIATE: 'Membre associé',
    DOCTORAL: 'Doctorant', RETIRED: 'Retraité', FORMER: 'Ancien membre',
}
const TYPE_BADGE = {
    PERMANENT: 'badge-teal', ASSOCIATE: 'badge-green',
    DOCTORAL: 'badge-yellow', RETIRED: 'badge-gray', FORMER: 'badge-gray',
}

export default function Membres() {
    const [membres, setMembres] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [editMember, setEditMember] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => { fetchMembres() }, [])

    const fetchMembres = async () => {
        setLoading(true); setError('')
        try {
            const r = await api.get('/members')
            setMembres(r.data)
        } catch (err) {
            setError('Impossible de charger les membres.')
        } finally {
            setLoading(false)
        }
    }

    const filtered = membres.filter(m =>
        `${m.firstName} ${m.lastName} ${m.email || ''}`.toLowerCase().includes(search.toLowerCase())
    )

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.put(`/members/${editMember.id}`, editMember)
            setEditMember(null)
            fetchMembres()
        } catch {
            alert('Erreur lors de la mise à jour.')
        } finally {
            setSaving(false)
        }
    }

    const handleChangeType = async (id, type) => {
        try {
            await api.patch(`/members/${id}/type?type=${type}`)
            fetchMembres()
        } catch {
            alert('Erreur lors du changement de type.')
        }
    }

    const handleDelete = async (m) => {
        if (!confirm(`Retirer ${m.firstName} ${m.lastName} du laboratoire ? Cette action est irréversible.`)) return
        try {
            await api.delete(`/members/${m.id}`)
            fetchMembres()
        } catch {
            alert('Erreur lors de la suppression.')
        }
    }

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Membres</h1>
                    <p className="page-subtitle">Gestion des membres du laboratoire</p>
                </div>
                {membres.length > 0 && (
                    <span className="badge badge-gray" style={{ fontSize: '13px', padding: '5px 14px' }}>
                        {membres.length} membre{membres.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div style={{ marginBottom: '20px', maxWidth: '360px' }}>
                <input className="form-input" placeholder="Rechercher un membre..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <div className="loading">Chargement des membres...</div>
            ) : error ? (
                <div className="alert alert-error">{error}</div>
            ) : filtered.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                    <p className="empty-title">Aucun membre trouvé</p>
                    <p className="empty-desc">{search ? 'Modifiez votre recherche.' : 'Aucun membre enregistré.'}</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Membre</th>
                                <th>Type</th>
                                <th>Établissement</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="avatar avatar-sm">
                                                {(m.firstName?.[0] || '?').toUpperCase()}{(m.lastName?.[0] || '').toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.firstName} {m.lastName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${TYPE_BADGE[m.type] || 'badge-gray'}`}>
                                            {TYPE_LABELS[m.type] || m.type || '—'}
                                        </span>
                                    </td>
                                    <td>{m.establishment || '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => setEditMember({ ...m })} className="btn btn-secondary btn-sm">Modifier</button>
                                            <button onClick={() => handleDelete(m)} className="btn btn-danger btn-sm">Retirer</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal modification */}
            {editMember && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                                Modifier — {editMember.firstName} {editMember.lastName}
                            </h3>
                            <button onClick={() => setEditMember(null)} className="btn btn-ghost btn-sm">Fermer</button>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Prénom</label>
                                <input className="form-input" value={editMember.firstName || ''} onChange={e => setEditMember({ ...editMember, firstName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nom</label>
                                <input className="form-input" value={editMember.lastName || ''} onChange={e => setEditMember({ ...editMember, lastName: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Type de membership</label>
                            <select className="form-input" value={editMember.type || ''} onChange={e => setEditMember({ ...editMember, type: e.target.value })}>
                                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label className="form-label">Établissement</label>
                            <input className="form-input" value={editMember.establishment || ''} onChange={e => setEditMember({ ...editMember, establishment: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                {saving ? 'Sauvegarde...' : 'Enregistrer'}
                            </button>
                            <button onClick={() => setEditMember(null)} className="btn btn-secondary">Annuler</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
