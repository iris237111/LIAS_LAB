import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

export default function AjouterPublication() {
    const [form, setForm] = useState({ title: '', authors: '', year: new Date().getFullYear(), abstractText: '', doi: '' })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async () => {
        if (!form.title || !form.authors) {
            setError('Le titre et les auteurs sont obligatoires.')
            return
        }
        setLoading(true)
        setError('')
        try {
            await api.post('/publications', form)
            setSuccess(true)
            setTimeout(() => navigate('/dashboard'), 2000)
        } catch (e) {
            setError('Erreur lors de l\'ajout de la publication.')
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '11px',
        border: '1px solid #d1fae5',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        background: '#f9fffe',
        color: '#111827'
    }

    const labelStyle = {
        fontSize: '13px',
        fontWeight: 600,
        color: '#374151',
        display: 'block',
        marginBottom: '6px'
    }

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* NAVBAR */}
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

            {/* CONTENT */}
            <div style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '0 auto', padding: '40px' }}>

                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Ajouter une publication</h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Renseignez les informations de votre publication scientifique</p>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '36px', border: '0.5px solid #99f6e4' }}>

                    {/* Success */}
                    {success && (
                        <div style={{ background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#16a34a', textAlign: 'center' }}>
                            ✅ Publication ajoutée ! Redirection vers le dashboard...
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {/* Titre */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Titre <span style={{ color: '#dc2626' }}>*</span></label>
                        <input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titre de la publication" />
                    </div>

                    {/* Auteurs */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Auteurs <span style={{ color: '#dc2626' }}>*</span></label>
                        <input style={inputStyle} value={form.authors} onChange={e => setForm({ ...form, authors: e.target.value })} placeholder="Ex: Sekkat I., ..." />
                    </div>

                    {/* Année */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Année de publication</label>
                        <input type="number" style={inputStyle} value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} min="1900" max="2100" />
                    </div>

                    {/* Abstract */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Résumé (Abstract)</label>
                        <textarea rows={5} style={{ ...inputStyle, resize: 'vertical' }} value={form.abstractText} onChange={e => setForm({ ...form, abstractText: e.target.value })} placeholder="Résumé de la publication..." />
                    </div>

                    {/* DOI */}
                    <div style={{ marginBottom: '28px' }}>
                        <label style={labelStyle}>DOI <span style={{ color: '#9ca3af' }}>(optionnel)</span></label>
                        <input style={inputStyle} value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })} placeholder="Ex: 10.1000/xyz123" />
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || success}
                            style={{ flex: 1, padding: '13px', background: loading ? '#99f6e4' : '#0d9488', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? 'Ajout en cours...' : 'Ajouter la publication'}
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{ padding: '13px 20px', background: 'transparent', color: '#0d9488', border: '1px solid #0d9488', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                            Annuler
                        </button>
                    </div>

                </div>
            </div>

            {/* FOOTER */}
            <div style={{ background: '#134e4a', padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>

        </div>
    )
}