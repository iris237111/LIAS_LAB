import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../api'

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await axios.post('http://localhost:8081/api/auth/login', form, { withCredentials: true })
            localStorage.setItem('token', res.data.accessToken)
            localStorage.setItem('role', res.data.role)
            if (res.data.memberId) localStorage.setItem('userId', res.data.memberId)
            navigate('/dashboard')
        } catch {
            try {
                const check = await api.get(`/membership-requests/public/check?email=${encodeURIComponent(form.email)}`)
                const status = check.data.status
                if (status === 'PENDING') {
                    setError('Votre demande d\'adhésion est en cours de traitement. Vous serez contacté par email dès qu\'une décision sera prise.')
                } else if (status === 'REJECTED') {
                    setError('Votre demande d\'adhésion a été refusée. Contactez l\'administration pour plus d\'informations.')
                } else {
                    setError('Identifiants incorrects. Vérifiez votre email et mot de passe.')
                }
            } catch {
                setError('Identifiants incorrects. Vérifiez votre email et mot de passe.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column' }}>
            <nav style={{ background: '#0a1628', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <a href="/" style={{ fontSize: '17px', fontWeight: 800, color: '#fff', letterSpacing: '4px' }}>LIAS</a>
                <a href="/" style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Retour à l'accueil</a>
            </nav>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ width: '52px', height: '52px', background: 'var(--primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(15,118,110,0.25)' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '6px' }}>Connexion</h1>
                        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Accédez à votre espace membre LIAS</p>
                    </div>

                    <div className="card" style={{ padding: '28px' }}>
                        {error && <div className="alert alert-error">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Adresse email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="vous@exemple.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label className="form-label">Mot de passe</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
                                {loading ? 'Connexion en cours...' : 'Se connecter'}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        Pas encore membre ?{' '}
                        <a href="/rejoindre" style={{ color: 'var(--primary)', fontWeight: 600 }}>Déposer une candidature</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
