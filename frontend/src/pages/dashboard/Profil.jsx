import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

export default function Profil() {
    const [profil, setProfil] = useState(null)
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [teams, setTeams] = useState([])
    const [members, setMembers] = useState([])
    const [teamPopup, setTeamPopup] = useState(false)

    useEffect(() => {
        api.get('/members/me')
            .then(r => { setProfil(r.data); setForm(r.data) })
            .catch(() => setError('Aucun profil membre associé à ce compte.'))
            .finally(() => setLoading(false))
        api.get('/public/teams').then(r => setTeams(r.data)).catch(() => {})
        api.get('/members').then(r => setMembers(r.data)).catch(() => {})
    }, [])

    const handleSave = async () => {
        setSaving(true); setError(''); setSuccess(false)
        try {
            await api.put(`/members/${profil.id}`, form)
            setSuccess(true)
        } catch {
            setError('Erreur lors de la sauvegarde.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Mon profil</h1>
                    <p className="page-subtitle">Modifiez vos informations personnelles</p>
                </div>
            </div>

            {loading ? (
                <div className="loading">Chargement...</div>
            ) : error && !profil ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <p className="empty-title">Profil introuvable</p>
                    <p className="empty-desc">{error}</p>
                </div>
            ) : (
                <div style={{ maxWidth: '640px' }}>
                    <div className="card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="avatar avatar-lg" style={{ fontSize: '20px' }}>
                            {(form.firstName?.[0] || '') + (form.lastName?.[0] || '')}
                        </div>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{form.firstName} {form.lastName}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>{profil?.email}</div>
                            {profil?.type && <span className="badge badge-teal" style={{ marginTop: '8px' }}>{profil.type}</span>}
                        </div>
                    </div>

                    {/* Équipe assignée */}
                    {(() => {
                        const team = teams.find(t => t.id === profil?.currentTeamId)
                        const teamMembers = members.filter(m => m.currentTeamId === profil?.currentTeamId)
                        return (
                            <>
                            <div className="card" style={{ marginBottom: '20px', cursor: team ? 'pointer' : 'default' }} onClick={() => team && setTeamPopup(true)}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Mon équipe</div>
                                {team ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #0f766e, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{team.name}</div>
                                            {team.theme && <div style={{ fontSize: '13px', color: 'var(--primary)', marginTop: '2px', fontWeight: 500 }}>🔬 {team.theme}</div>}
                                            {team.description && <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{team.description}</div>}
                                        </div>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>Vous n'êtes assigné à aucune équipe.</div>
                                )}
                            </div>

                            {/* Popup équipe */}
                            {teamPopup && team && (
                                <div onClick={() => setTeamPopup(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '24px' }}>
                                    <div className="card" style={{ width: '100%', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #0f766e, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--text-primary)' }}>{team.name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{teamMembers.length} membre{teamMembers.length !== 1 ? 's' : ''}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => setTeamPopup(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', lineHeight: 1 }}>✕</button>
                                        </div>

                                        {team.theme && (
                                            <div style={{ background: 'rgba(15,118,110,0.08)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Thème de recherche</div>
                                                <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{team.theme}</div>
                                            </div>
                                        )}

                                        {team.description && (
                                            <div style={{ marginBottom: '16px' }}>
                                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Description</div>
                                                <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{team.description}</div>
                                            </div>
                                        )}

                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Membres ({teamMembers.length})</div>
                                            {teamMembers.length === 0 ? (
                                                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aucun membre dans cette équipe.</div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {teamMembers.map(m => (
                                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', background: 'var(--surface-2)' }}>
                                                            <div className="avatar avatar-sm" style={{ background: m.id === profil?.id ? '#0f766e' : '#6366f1', fontSize: '11px' }}>
                                                                {(m.firstName?.[0] || '') + (m.lastName?.[0] || '')}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                                                                    {m.firstName} {m.lastName}
                                                                    {m.id === profil?.id && <span style={{ marginLeft: '6px', fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>(Vous)</span>}
                                                                </div>
                                                                {m.establishment && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.establishment}</div>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            </>
                        )
                    })()}

                    <div className="card">
                        {success && <div className="alert alert-success">Profil mis à jour avec succès.</div>}
                        {error && profil && <div className="alert alert-error">{error}</div>}

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Prénom</label>
                                <input className="form-input" value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nom</label>
                                <input className="form-input" value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Établissement d'origine</label>
                            <input className="form-input" placeholder="Ex: Université Hassan II" value={form.establishment || ''} onChange={e => setForm({ ...form, establishment: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Biographie</label>
                            <textarea className="form-input" rows={4} placeholder="Décrivez vos travaux de recherche..." value={form.biography || ''} onChange={e => setForm({ ...form, biography: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label className="form-label">Centres d'intérêt</label>
                            <input className="form-input" placeholder="Ex: Machine Learning, Big Data, IA..." value={form.interests || ''} onChange={e => setForm({ ...form, interests: e.target.value })} />
                        </div>
                        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                            {saving ? 'Sauvegarde en cours...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
