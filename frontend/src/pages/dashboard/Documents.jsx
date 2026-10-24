import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const DOC_TYPES = ['FINANCING', 'PROGRAM', 'ATTESTATION', 'REPORT', 'ADMINISTRATIVE', 'PV', 'CONVENTION']
const TYPE_LABELS = { FINANCING: 'Financement', PROGRAM: 'Programme', ATTESTATION: 'Attestation', REPORT: 'Rapport', ADMINISTRATIVE: 'Administratif', PV: 'Procès-verbal', CONVENTION: 'Convention' }

export default function Documents() {
    const [docs, setDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', type: 'REPORT', file: null })
    const [uploading, setUploading] = useState(false)

    useEffect(() => { fetchDocs() }, [])

    const fetchDocs = () => {
        api.get('/documents').then(r => setDocs(r.data)).finally(() => setLoading(false))
    }

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!form.file) return
        setUploading(true)
        const fd = new FormData()
        fd.append('file', form.file)
        fd.append('title', form.title)
        fd.append('type', form.type)
        try {
            await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
            setShowForm(false)
            setForm({ title: '', type: 'REPORT', file: null })
            fetchDocs()
        } catch {
            alert('Erreur lors de l\'upload.')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer ce document ?')) return
        try {
            await api.delete(`/documents/${id}`)
            fetchDocs()
        } catch {
            alert('Erreur lors de la suppression.')
        }
    }

    const filtered = filter ? docs.filter(d => d.type === filter) : docs

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Documents</h1>
                    <p className="page-subtitle">Archivage documentaire du laboratoire</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Téléverser
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '18px' }}>Ajouter un document</h3>
                    <form onSubmit={handleUpload}>
                        <div className="form-group">
                            <label className="form-label">Titre</label>
                            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Nom du document" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                {DOC_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Fichier</label>
                            <input type="file" className="form-input" onChange={e => setForm({ ...form, file: e.target.files[0] })} required />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" disabled={uploading} className="btn btn-primary">{uploading ? 'Upload...' : 'Téléverser'}</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button onClick={() => setFilter('')} className={`btn btn-sm ${!filter ? 'btn-primary' : 'btn-secondary'}`}>Tous</button>
                {DOC_TYPES.map(t => (
                    <button key={t} onClick={() => setFilter(t)} className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-secondary'}`}>{TYPE_LABELS[t]}</button>
                ))}
            </div>

            {loading ? <div className="loading">Chargement...</div> : filtered.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <p className="empty-title">Aucun document</p>
                    <p className="empty-desc">Téléversez votre premier document.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Titre</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(d => (
                                <tr key={d.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                            {d.title}
                                        </div>
                                    </td>
                                    <td><span className="badge badge-teal">{TYPE_LABELS[d.type] || d.type}</span></td>
                                    <td>{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('fr-FR') : '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {d.fileUrl && (
                                                <a href={`http://localhost:8081${d.fileUrl}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                                                    Télécharger
                                                </a>
                                            )}
                                            <button onClick={() => handleDelete(d.id)} className="btn btn-danger btn-sm">Supprimer</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    )
}
