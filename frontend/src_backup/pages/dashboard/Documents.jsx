import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const BTN_PRIMARY = { background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const BTN_DANGER = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }
const INPUT = { width: '100%', padding: '11px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', color: '#111827' }
const LABEL = { fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }

const TYPE_LABELS = {
    FINANCING:      { label: 'Demande de financement', bg: '#dbeafe', color: '#1d4ed8' },
    PROGRAM:        { label: 'Programme',               bg: '#d1fae5', color: '#065f46' },
    ATTESTATION:    { label: 'Attestation',             bg: '#fef3c7', color: '#92400e' },
    REPORT:         { label: 'Rapport',                 bg: '#ede9fe', color: '#5b21b6' },
    ADMINISTRATIVE: { label: 'Administratif',           bg: '#f3f4f6', color: '#374151' },
    PV:             { label: 'Procès-verbal',           bg: '#fee2e2', color: '#991b1b' },
    CONVENTION:     { label: 'Convention',              bg: '#ccfbf1', color: '#0f766e' },
}

export default function Documents() {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [file, setFile] = useState(null)
    const [type, setType] = useState('ADMINISTRATIVE')
    const [uploading, setUploading] = useState(false)
    const [filterType, setFilterType] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchDocuments()
    }, [])

    const fetchDocuments = () => {
        api.get('/documents').then(r => { setDocuments(r.data); setLoading(false) })
            .catch(() => navigate('/login'))
    }

    const handleUpload = async () => {
        if (!file) { alert('Veuillez sélectionner un fichier.'); return }
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type)
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setFile(null); setShowForm(false); fetchDocuments()
        } catch { alert('Erreur lors de l\'upload.') }
        finally { setUploading(false) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce document ?')) return
        await api.delete(`/documents/${id}`).catch(() => alert('Erreur'))
        fetchDocuments()
    }

    const filtered = filterType ? documents.filter(d => d.type === filterType) : documents

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
                        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Archivage documentaire</h1>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Uploadez et consultez les documents du laboratoire</p>
                    </div>
                    <button onClick={() => setShowForm(true)} style={BTN_PRIMARY}>+ Uploader un document</button>
                </div>

                {/* FORMULAIRE UPLOAD */}
                {showForm && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '0.5px solid #99f6e4', marginBottom: '28px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#134e4a', margin: '0 0 24px' }}>Nouveau document</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <label style={LABEL}>Type de document</label>
                                <select style={INPUT} value={type} onChange={e => setType(e.target.value)}>
                                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={LABEL}>Fichier *</label>
                                <input
                                    type="file"
                                    onChange={e => setFile(e.target.files[0])}
                                    style={{ ...INPUT, padding: '8px' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleUpload} disabled={uploading} style={{ ...BTN_PRIMARY, opacity: uploading ? 0.6 : 1 }}>
                                {uploading ? 'Upload en cours...' : '📤 Uploader'}
                            </button>
                            <button onClick={() => setShowForm(false)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {/* FILTRE PAR TYPE */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setFilterType('')}
                        style={{ background: !filterType ? '#0d9488' : 'white', color: !filterType ? 'white' : '#374151', border: '0.5px solid #99f6e4', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        Tous ({documents.length})
                    </button>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => {
                        const count = documents.filter(d => d.type === k).length
                        if (count === 0) return null
                        return (
                            <button
                                key={k}
                                onClick={() => setFilterType(k)}
                                style={{ background: filterType === k ? '#0d9488' : 'white', color: filterType === k ? 'white' : '#374151', border: '0.5px solid #99f6e4', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                {v.label} ({count})
                            </button>
                        )
                    })}
                </div>

                {/* LISTE */}
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#374151' }}>Aucun document</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {filtered.map(doc => {
                            const t = TYPE_LABELS[doc.type] || { label: doc.type, bg: '#f0fdfa', color: '#0d9488' }
                            return (
                                <div key={doc.id} style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ fontSize: '24px' }}>📄</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#134e4a' }}>{doc.filename}</div>
                                        <div style={{ marginTop: '4px' }}>
                                            <span style={{ background: t.bg, color: t.color, fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' }}>
                                                {t.label}
                                            </span>
                                            {doc.uploadedAt && (
                                                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '10px' }}>
                                                    {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <a
                                            href={`http://localhost:8081/${doc.fileUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                                            📥 Télécharger
                                        </a>
                                        <button onClick={() => handleDelete(doc.id)} style={BTN_DANGER}>🗑️</button>
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
