import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await api.post('/auth/login', { email, password })
            localStorage.setItem('token', res.data.accessToken)
            localStorage.setItem('role', res.data.role)
            localStorage.setItem('userId', res.data.userId)
            navigate('/dashboard')
        } catch (e) {
            setError('Email ou mot de passe incorrect.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0fdfa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* NAVBAR */}
            <div style={{ background: '#134e4a', padding: '0 40px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0' }}>
                    <a href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#ccfbf1', letterSpacing: '2px', textDecoration: 'none' }}>LIAS</a>
                    <a href="/" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>← Retour à l'accueil</a>
                </div>
            </div>

            {/* FORM */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '48px', width: '100%', maxWidth: '420px', border: '0.5px solid #99f6e4', boxShadow: '0 4px 24px rgba(13,148,136,0.08)' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#134e4a', letterSpacing: '-1px', marginBottom: '8px' }}>LIAS</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>Connexion</div>
                        <div style={{ fontSize: '13px', color: '#9ca3af' }}>Accédez à votre espace membre</div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            style={{ width: '100%', padding: '12px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', color: '#111827' }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            style={{ width: '100%', padding: '12px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', color: '#111827' }}
                        />
                    </div>

                    {/* Button */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        style={{ width: '100%', padding: '13px', background: loading ? '#99f6e4' : '#0d9488', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>

                    {/* Divider */}
                    <div style={{ borderTop: '1px solid #f0fdfa', margin: '24px 0' }} />

                    {/* Membership request link */}
                    <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                        Pas encore membre ?{' '}
                        <a href="/rejoindre" style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>
                            Demander à rejoindre le LIAS
                        </a>
                    </div>

                </div>
            </div>
        </div>
    )
}