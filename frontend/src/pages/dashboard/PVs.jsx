import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

export default function PVs() {
    const [reunions, setReunions] = useState([])
    const [selectedId, setSelectedId] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')

    const load = async () => {
        try {
            const response = await api.get('/meetings')
            setReunions(response.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Impossible de charger les réunions.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const selected = reunions.find(r => String(r.id) === String(selectedId))
    const chooseMeeting = id => {
        setSelectedId(id)
        const meeting = reunions.find(r => String(r.id) === String(id))
        setContent(meeting?.pvContent || '')
        setError('')
        setNotice('')
    }

    const save = async e => {
        e.preventDefault()
        if (!selected || !content.trim()) {
            setError('Sélectionnez une réunion et saisissez le compte-rendu.')
            return
        }
        setSaving(true)
        setError('')
        setNotice('')
        try {
            const response = await api.put(`/meetings/${selected.id}/pv`, { content })
            setReunions(items => items.map(item => item.id === response.data.id ? response.data : item))
            setNotice('Le procès-verbal a été enregistré pour cette réunion.')
        } catch (err) {
            setError(err.response?.data?.message || 'Impossible d’enregistrer le procès-verbal. Réessayez.')
        } finally {
            setSaving(false)
        }
    }

    const fmt = d => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

    return <DashboardLayout>
        <div className="page-header">
            <div>
                <h1 className="page-title">Procès-verbaux</h1>
                <p className="page-subtitle">Choisissez la réunion terminée concernée puis rédigez son compte-rendu.</p>
            </div>
        </div>

        {loading ? <div className="loading">Chargement...</div> : reunions.length === 0 ? (
            <div className="empty">
                <p className="empty-title">Aucune réunion disponible</p>
                <p className="empty-desc">Créez d’abord une réunion dans la rubrique Réunions.</p>
            </div>
        ) : <div className="card">
            <form onSubmit={save}>
                <div className="form-group">
                    <label className="form-label" htmlFor="pv-meeting">Réunion concernée</label>
                    <select id="pv-meeting" className="form-input" value={selectedId} onChange={e => chooseMeeting(e.target.value)} required>
                        <option value="">Choisir une réunion...</option>
                        {reunions.map(r => <option key={r.id} value={r.id}>{r.title} — {fmt(r.date)}{r.pvContent ? ' (PV existant)' : ''}</option>)}
                    </select>
                </div>

                {selected && <div style={{ margin: '16px 0', padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                    <strong>{selected.title}</strong>
                    <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 13 }}>{fmt(selected.date)}{selected.location ? ` · ${selected.location}` : ''}</div>
                    {selected.agenda && <p style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap' }}>Ordre du jour : {selected.agenda}</p>}
                </div>}

                <div className="form-group">
                    <label className="form-label" htmlFor="pv-content">Compte-rendu de la réunion</label>
                    <textarea id="pv-content" className="form-input" rows={10} value={content} onChange={e => setContent(e.target.value)} placeholder="Saisissez les échanges, décisions prises et actions à suivre..." required />
                </div>
                {error && <p role="alert" style={{ color: 'var(--danger, #dc2626)', marginBottom: 12 }}>{error}</p>}
                {notice && <p role="status" style={{ color: 'var(--success, #059669)', marginBottom: 12 }}>{notice}</p>}
                <button type="submit" className="btn btn-primary" disabled={saving || !selected}>{saving ? 'Enregistrement...' : 'Enregistrer le PV'}</button>
            </form>
        </div>}

        {!loading && reunions.some(r => r.pvContent?.trim()) && <section style={{ marginTop: 28 }}>
            <div className="page-header" style={{ marginBottom: 14 }}>
                <div>
                    <h2 className="page-title" style={{ fontSize: 20 }}>PV enregistrés</h2>
                    <p className="page-subtitle">Les comptes-rendus sont affichés avec la réunion à laquelle ils correspondent.</p>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reunions.filter(r => r.pvContent?.trim()).map(r => (
                    <article key={r.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{r.title}</h3>
                                <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 13 }}>
                                    {fmt(r.date)}{r.location ? ` · ${r.location}` : ''}
                                </div>
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                                setSelectedId(String(r.id))
                                setContent(r.pvContent)
                                setError('')
                                setNotice('')
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}>Modifier le PV</button>
                        </div>
                        <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {r.pvContent}
                        </div>
                    </article>
                ))}
            </div>
        </section>}
    </DashboardLayout>
}
