import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

export default function Profil() {
    const [profil, setProfil] = useState(null)
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        api.get('/members/me')
            .then(r => {
                setProfil(r.data)
                setForm(r.data)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
                setError('Aucun profil membre associé à ce compte.')
            })
    }, [])

    const handleSave = async () => {
        setSaving(true)
        setError('')
        setSuccess(false)
        try {
            await api.put(`/members/${profil.id}`, form)
            setSuccess(true)
        } catch (e) {
            setError('Erreur lors de la sauvegarde.')
        } finally {
            setSaving(false)
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
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Mon Profil</h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Modifiez vos informations personnelles</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#0d9488', padding: '60px' }}>Chargement...</div>
                ) : error && !profil ? (
                    <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#dc2626' }}>{error}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>Ce compte n'a pas de profil membre associé.</div>
                        <a href="/dashboard" style={{ display: 'inline-block', marginTop: '20px', background: '#0d9488', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
                            Retour au dashboard
                        </a>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '36px', border: '0.5px solid #99f6e4' }}>

                        {/* Avatar */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ width: '80px', height: '80px', background: '#0d9488', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '32px', color: 'white', fontWeight: 800 }}>
                                {form.firstName?.charAt(0)}{form.lastName?.charAt(0)}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#134e4a' }}>{form.firstName} {form.lastName}</div>
                            <div style={{ fontSize: '13px', color: '#0d9488', marginTop: '4px' }}>{profil?.type || 'Membre'}</div>
                        </div>

                        {/* Success / Error */}
                        {success && (
                            <div style={{ background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#16a34a', textAlign: 'center' }}>
                                ✅ Profil mis à jour avec succès !
                            </div>
                        )}
                        {error && profil && (
                            <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={labelStyle}>Prénom</label>
                                <input style={inputStyle} value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                            <div>
                                <label style={labelStyle}>Nom</label>
                                <input style={inputStyle} value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Établissement d'origine</label>
                            <input style={inputStyle} value={form.establishment || ''} onChange={e => setForm({ ...form, establishment: e.target.value })} placeholder="Ex: Université Hassan II" />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Biographie</label>
                            <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={form.biography || ''} onChange={e => setForm({ ...form, biography: e.target.value })} placeholder="Décrivez vos travaux de recherche..." />
                        </div>

                        <div style={{ marginBottom: '28px' }}>
                            <label style={labelStyle}>Centres d'intérêt</label>
                            <input style={inputStyle} value={form.interests || ''} onChange={e => setForm({ ...form, interests: e.target.value })} placeholder="Ex: Machine Learning, Big Data, IA..." />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{ width: '100%', padding: '13px', background: saving ? '#99f6e4' : '#0d9488', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                            {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                        </button>

                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div style={{ background: '#134e4a', padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>

        </div>
    )
}