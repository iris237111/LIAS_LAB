import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, roles }) {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token) return <Navigate to="/login" />

    if (roles && !roles.some(r => role === r || role?.includes(r))) {
        return (
            <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#f0fdfa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '0.5px solid #fecaca', maxWidth: '420px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#134e4a', marginBottom: '8px' }}>Accès refusé</h2>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                        Votre rôle <strong>{role}</strong> ne permet pas d'accéder à cette page.
                    </p>
                    <a href="/dashboard" style={{ background: '#0d9488', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
                        Retour au dashboard
                    </a>
                </div>
            </div>
        )
    }

    return children
}