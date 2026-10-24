import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

export default function AjouterPublication() {
    const [pubs, setPubs] = useState([])
    const [myId, setMyId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', abstractText: '', authors: '', year: new Date().getFullYear(), doi: '', publicationUrl: '' })
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [search, setSearch] = useState('')

    const role = localStorage.getItem('role') || ''
    const isAdmin = role.includes('ADMIN') || role.includes('DIRECTOR')

    useEffect(() => {
        // Récupérer mon memberId
        api.get('/members/me').then(r => setMyId(r.data.id)).catch(() => {})
        fetchPubs()
    }, [])

    const fetchPubs = async () => {
        setLoading(true)
        try {
            const r = await api.get('/publications')
            setPubs(r.data)
        } catch {
            setPubs([])
        } finally {
            setLoading(false)
        }
    }

    // Filtrer selon le rôle : admin voit tout, membre voit les siennes
    const myPubs = isAdmin ? pubs : pubs.filter(p => p.addedBy === myId)

    const filtered = myPubs.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.authors?.toLowerCase().includes(search.toLowerCase())
    )

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true); setSuccess(false)
        try {
            await api.post('/publications', form)
            setSuccess(true)
            setShowForm(false)
            setForm({ title: '', abstractText: '', authors: '', year: new Date().getFullYear(), doi: '', publicationUrl: '' })
            fetchPubs()
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l\'ajout.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette publication ?')) return
        try {
            await api.delete(`/publications/${id}`)
            fetchPubs()
        } catch (err) {
            alert(err.response?.data || 'Erreur lors de la suppression. Seuls les admins peuvent supprimer.')
        }
    }

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Publications</h1>
                    <p className="page-subtitle">
                        {isAdmin ? 'Toutes les publications du laboratoire' : 'Vos publications scientifiques'}
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Ajouter une publication
                </button>
            </div>

            {success && <div className="alert alert-success">Publication ajoutée avec succès.</div>}

            {showForm && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px' }}>Nouvelle publication</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Titre *</label>
                            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Titre de la publication" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Auteurs</label>
                            <input className="form-input" value={form.authors} onChange={e => setForm({ ...form, authors: e.target.value })} placeholder="Nom Prénom, Nom Prénom..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Résumé</label>
                            <textarea className="form-input" rows={3} value={form.abstractText} onChange={e => setForm({ ...form, abstractText: e.target.value })} placeholder="Résumé de la publication..." />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Année</label>
                                <input type="number" className="form-input" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} min="1990" max="2030" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">DOI</label>
                                <input className="form-input" value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })} placeholder="10.xxxx/xxxxx" />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">URL de la publication</label>
                            <input type="url" className="form-input" value={form.publicationUrl} onChange={e => setForm({ ...form, publicationUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Ajout...' : 'Ajouter'}</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ marginBottom: '20px', maxWidth: '360px' }}>
                <input className="form-input" placeholder="Rechercher par titre, auteur..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <div className="loading">Chargement...</div>
            ) : filtered.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <p className="empty-title">Aucune publication</p>
                    <p className="empty-desc">{isAdmin ? 'Aucune publication dans le laboratoire.' : 'Ajoutez votre première publication.'}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{filtered.length} publication{filtered.length > 1 ? 's' : ''}</p>
                    {filtered.map(p => (
                        <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '15px' }}>{p.title}</div>
                                {p.authors && <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>{p.authors}</div>}
                                {p.abstractText && <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.6 }}>{p.abstractText}</div>}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    {p.year && <span className="badge badge-gray">{p.year}</span>}
                                    {p.doi && <span className="badge badge-teal">DOI: {p.doi}</span>}
                                    {p.publicationUrl && (
                                        <a href={p.publicationUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12.5px', color: 'var(--primary)', fontWeight: 600 }}>
                                            Voir la publication
                                        </a>
                                    )}
                                </div>
                            </div>
                            {/* Admin peut supprimer tout, membre ne peut supprimer que les siennes */}
                            {(isAdmin || p.addedBy === myId) && (
                                <button onClick={() => handleDelete(p.id)} className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}>
                                    Supprimer
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
