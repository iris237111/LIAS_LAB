import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicLayout } from '../components/Layout'
import api from '../api'

const ROLES = [
    { value: 'Membre permanent', label: 'Membre permanent' },
    { value: 'Membre associé', label: 'Membre associé' },
    { value: 'Doctorant', label: 'Doctorant' },
]

export default function Rejoindre() {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', requestedRole: 'Membre permanent', institution: '', speciality: '' })
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const motivation = [
                `Type souhaité : ${form.requestedRole}`,
                form.institution ? `Institution : ${form.institution}` : '',
                form.speciality ? `Spécialité : ${form.speciality}` : '',
            ].filter(Boolean).join('\n')

            const data = new FormData()
            data.append('applicantName', `${form.firstName} ${form.lastName}`.trim())
            data.append('emailAddress', form.email)
            data.append('motivation', motivation)
            if (form.password) data.append('password', form.password)
            data.append('requestedRole', form.requestedRole)

            await api.post('/membership-requests/public', data)
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur s\'est produite. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <PublicLayout>
                <div style={{ padding: '80px 0', textAlign: 'center' }}>
                    <div className="container">
                        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                            <div style={{ width: '64px', height: '64px', background: 'var(--success-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Candidature soumise</h2>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '28px' }}>
                                Votre demande d'adhésion a été transmise aux administrateurs du laboratoire. Vous serez notifié par email dès qu'une décision sera prise.
                            </p>
                            <a href="/" className="btn btn-primary">Retour à l'accueil</a>
                        </div>
                    </div>
                </div>
            </PublicLayout>
        )
    }

    return (
        <PublicLayout>
            <div style={{ background: '#0a1628', padding: '52px 0 48px', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: '10px' }}>Rejoindre le LIAS</h1>
                    <p style={{ fontSize: '15px', color: '#94a3b8' }}>Complétez le formulaire ci-dessous pour soumettre votre candidature.</p>
                </div>
            </div>

            <div style={{ padding: '48px 0', background: 'var(--surface-2)' }}>
                <div className="container" style={{ maxWidth: '600px' }}>
                    <div className="card" style={{ padding: '32px' }}>
                        {error && <div className="alert alert-error">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Prénom</label>
                                    <input className="form-input" placeholder="Prénom" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nom</label>
                                    <input className="form-input" placeholder="Nom de famille" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Adresse email</label>
                                <input type="email" className="form-input" placeholder="vous@exemple.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mot de passe</label>
                                <input type="password" className="form-input" placeholder="Minimum 8 caractères" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type de membership souhaité</label>
                                <select className="form-input" value={form.requestedRole} onChange={e => setForm({ ...form, requestedRole: e.target.value })}>
                                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Institution / Établissement</label>
                                <input className="form-input" placeholder="Université, entreprise..." value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label">Spécialité / Domaine de recherche</label>
                                <textarea className="form-input" placeholder="Décrivez brièvement votre domaine de recherche..." value={form.speciality} onChange={e => setForm({ ...form, speciality: e.target.value })} rows={3} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
                                {loading ? 'Envoi en cours...' : 'Soumettre la candidature'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </PublicLayout>
    )
}
