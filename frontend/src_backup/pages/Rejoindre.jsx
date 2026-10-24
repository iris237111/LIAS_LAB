import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Rejoindre() {
    const [form, setForm] = useState({ applicantName: '', emailAddress: '', motivation: '' })
    const [cv, setCv] = useState(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async () => {
        if (!form.applicantName || !form.emailAddress || !form.motivation) {
            setError('Veuillez remplir tous les champs obligatoires.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const data = new FormData()
            data.append('applicantName', form.applicantName)
            data.append('emailAddress', form.emailAddress)
            data.append('motivation', form.motivation)
            if (cv) data.append('cv', cv)

            await api.post('/membership-requests/public', data)
            setSuccess(true)
        } catch (e) {
            setError('Une erreur est survenue. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: '#134e4a', padding: '0 40px' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0' }}>
                        <a href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#ccfbf1', letterSpacing: '2px', textDecoration: 'none' }}>LIAS</a>
                    </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '460px', width: '100%', textAlign: 'center', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
                        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#134e4a', marginBottom: '12px' }}>Demande envoyée !</h2>
                        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, marginBottom: '24px' }}>
                            Votre demande d'adhésion au laboratoire LIAS a bien été reçue. Le directeur examinera votre dossier et vous serez notifié(e) par email.
                        </p>
                        <a href="/" style={{ background: '#0d9488', color: 'white', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
                            Retour à l'accueil
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* NAVBAR */}
            <div style={{ background: '#134e4a', padding: '0 40px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0' }}>
                    <a href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#ccfbf1', letterSpacing: '2px', textDecoration: 'none' }}>LIAS</a>
                    <a href="/login" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>← Retour à la connexion</a>
                </div>
            </div>

            {/* FORM */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '48px', width: '100%', maxWidth: '520px', border: '0.5px solid #99f6e4', boxShadow: '0 4px 24px rgba(13,148,136,0.08)' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#134e4a', letterSpacing: '-1px', marginBottom: '8px' }}>LIAS</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>Demande d'adhésion</div>
                        <div style={{ fontSize: '13px', color: '#9ca3af' }}>Remplissez ce formulaire pour rejoindre le laboratoire</div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {/* Nom complet */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                            Nom complet <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={form.applicantName}
                            onChange={e => setForm({ ...form, applicantName: e.target.value })}
                            placeholder="Prénom Nom"
                            style={{ width: '100%', padding: '12px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe' }}
                        />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                            Email <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                            type="email"
                            value={form.emailAddress}
                            onChange={e => setForm({ ...form, emailAddress: e.target.value })}
                            placeholder="votre@email.com"
                            style={{ width: '100%', padding: '12px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe' }}
                        />
                    </div>

                    {/* Motivation */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                            Lettre de motivation <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <textarea
                            value={form.motivation}
                            onChange={e => setForm({ ...form, motivation: e.target.value })}
                            placeholder="Expliquez pourquoi vous souhaitez rejoindre le laboratoire LIAS..."
                            rows={5}
                            style={{ width: '100%', padding: '12px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', resize: 'vertical' }}
                        />
                    </div>

                    {/* CV */}
                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                            CV <span style={{ color: '#9ca3af' }}>(optionnel)</span>
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={e => setCv(e.target.files[0])}
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', background: '#f9fffe' }}
                        />
                        {cv && <div style={{ fontSize: '12px', color: '#0d9488', marginTop: '6px' }}>✅ {cv.name}</div>}
                    </div>

                    {/* Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{ width: '100%', padding: '13px', background: loading ? '#99f6e4' : '#0d9488', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Envoi en cours...' : 'Soumettre ma demande →'}
                    </button>

                    <div style={{ borderTop: '1px solid #f0fdfa', margin: '24px 0' }} />

                    <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                        Déjà membre ?{' '}
                        <a href="/login" style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>Se connecter</a>
                    </div>

                </div>
            </div>
        </div>
    )
}