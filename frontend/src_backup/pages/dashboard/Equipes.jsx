import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const BTN_PRIMARY = { background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const BTN_DANGER = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }
const INPUT = { width: '100%', padding: '11px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', color: '#111827' }
const LABEL = { fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }

const EMPTY_FORM = { name: '', description: '', researchAxes: '' }

export default function EquipesDashboard() {
    const [equipes, setEquipes] = useState([])
    const [membres, setMembres] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [expandedId, setExpandedId] = useState(null)
    const [addingMemberId, setAddingMemberId] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchAll()
    }, [])

    const fetchAll = async () => {
        const [teamsRes, membresRes] = await Promise.all([
            api.get('/teams'),
            api.get('/members')
        ]).catch(() => { navigate('/login'); return [null, null] })
        if (teamsRes) setEquipes(teamsRes.data)
        if (membresRes) setMembres(membresRes.data)
        setLoading(false)
    }

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
    const openEdit = (eq) => {
        setForm({ name: eq.name || '', description: eq.description || '', researchAxes: eq.researchAxes || '' })
        setEditId(eq.id); setShowForm(true)
    }

    const handleSave = async () => {
        if (!form.name.trim()) { alert('Le nom est obligatoire.'); return }
        setSaving(true)
        try {
            if (editId) await api.put(`/teams/${editId}`, form)
            else await api.post('/teams', form)
            setShowForm(false); fetchAll()
        } catch { alert('Erreur lors de la sauvegarde.') }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette équipe ? Les membres seront désaffectés.')) return
        await api.delete(`/teams/${id}`).catch(() => alert('Erreur'))
        fetchAll()
    }

    const getMembresEquipe = (teamId) => membres.filter(m => m.currentTeamId === teamId)
    const getMembresDisponibles = (teamId) => membres.filter(m => !m.currentTeamId || m.currentTeamId !== teamId)

    const handleAddMembre = async (teamId) => {
        if (!addingMemberId) return
        const membre = membres.find(m => m.id === parseInt(addingMemberId))
        if (!membre) return
        try {
            await api.put(`/members/${membre.id}`, { ...membre, currentTeamId: teamId })
            setAddingMemberId('')
            fetchAll()
        } catch { alert('Erreur lors de l\'ajout.') }
    }

    const handleRemoveMembre = async (membre) => {
        if (!window.confirm(`Retirer ${membre.firstName} ${membre.lastName} de l'équipe ?`)) return
        try {
            await api.put(`/members/${membre.id}`, { ...membre, currentTeamId: null })
            fetchAll()
        } catch { alert('Erreur lors du retrait.') }
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
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Gestion des équipes</h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Créez les équipes et assignez les membres</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', color: '#134e4a', fontWeight: 700 }}>
                            {equipes.length} équipe{equipes.length > 1 ? 's' : ''} · {membres.length} membre{membres.length > 1 ? 's' : ''}
                        </div>
                        <button onClick={openCreate} style={BTN_PRIMARY}>+ Nouvelle équipe</button>
                    </div>
                </div>

                {/* FORM CRÉATION / MODIFICATION */}
                {showForm && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '0.5px solid #99f6e4', marginBottom: '28px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#134e4a', margin: '0 0 24px' }}>
                            {editId ? 'Modifier l\'équipe' : 'Nouvelle équipe'}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={LABEL}>Nom de l'équipe *</label>
                                <input style={INPUT} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Équipe Intelligence Artificielle" />
                            </div>
                            <div>
                                <label style={LABEL}>Axes de recherche</label>
                                <input style={INPUT} value={form.researchAxes} onChange={e => setForm({ ...form, researchAxes: e.target.value })} placeholder="Ex: Machine Learning, Vision par ordinateur..." />
                            </div>
                            <div>
                                <label style={LABEL}>Description</label>
                                <textarea rows={3} style={{ ...INPUT, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Présentation et objectifs de l'équipe..." />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleSave} disabled={saving} style={{ ...BTN_PRIMARY, opacity: saving ? 0.6 : 1 }}>
                                {saving ? 'Sauvegarde...' : editId ? 'Enregistrer' : 'Créer l\'équipe'}
                            </button>
                            <button onClick={() => setShowForm(false)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {/* LISTE DES ÉQUIPES */}
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : equipes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔬</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucune équipe créée</div>
                        <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>Cliquez sur "Nouvelle équipe" pour commencer.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {equipes.map(eq => {
                            const membresEquipe = getMembresEquipe(eq.id)
                            const membresDisponibles = getMembresDisponibles(eq.id)
                            const isExpanded = expandedId === eq.id

                            return (
                                <div key={eq.id} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '12px', overflow: 'hidden' }}>

                                    {/* HEADER ÉQUIPE */}
                                    <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '44px', height: '44px', background: '#0d9488', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                            🔬
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#134e4a' }}>{eq.name}</div>
                                            {eq.researchAxes && <div style={{ fontSize: '12px', color: '#0d9488', marginTop: '2px' }}>🔎 {eq.researchAxes}</div>}
                                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                                {membresEquipe.length} membre{membresEquipe.length > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : eq.id)}
                                                style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                {isExpanded ? '▲ Réduire' : '▼ Gérer les membres'}
                                            </button>
                                            <button onClick={() => openEdit(eq)} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                                ✏️
                                            </button>
                                            <button onClick={() => handleDelete(eq.id)} style={BTN_DANGER}>🗑️</button>
                                        </div>
                                    </div>

                                    {/* SECTION MEMBRES (dépliable) */}
                                    {isExpanded && (
                                        <div style={{ borderTop: '1px solid #f0fdfa', padding: '20px 24px', background: '#f9fffe' }}>

                                            {/* Membres actuels */}
                                            <div style={{ marginBottom: '20px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '12px' }}>
                                                    Membres de l'équipe ({membresEquipe.length})
                                                </div>
                                                {membresEquipe.length === 0 ? (
                                                    <div style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                                                        Aucun membre assigné à cette équipe.
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                        {membresEquipe.map(m => (
                                                            <div key={m.id} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{ width: '32px', height: '32px', background: '#0d9488', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
                                                                    {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#134e4a' }}>{m.firstName} {m.lastName}</div>
                                                                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{m.type || 'Membre'}</div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveMembre(m)}
                                                                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '16px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
                                                                    title="Retirer de l'équipe">
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Ajouter un membre */}
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>
                                                    Ajouter un membre
                                                </div>
                                                {membresDisponibles.length === 0 ? (
                                                    <div style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                                                        Tous les membres sont déjà dans une équipe.
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <select
                                                            value={addingMemberId}
                                                            onChange={e => setAddingMemberId(e.target.value)}
                                                            style={{ ...INPUT, maxWidth: '320px' }}>
                                                            <option value="">-- Choisir un membre --</option>
                                                            {membresDisponibles.map(m => (
                                                                <option key={m.id} value={m.id}>
                                                                    {m.firstName} {m.lastName} {m.currentTeamId ? '(autre équipe)' : '(sans équipe)'}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleAddMembre(eq.id)}
                                                            disabled={!addingMemberId}
                                                            style={{ ...BTN_PRIMARY, opacity: !addingMemberId ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                                                            + Ajouter
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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
