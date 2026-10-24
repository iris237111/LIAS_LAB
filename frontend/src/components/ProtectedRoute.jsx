import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, roles }) {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (!token) return <Navigate to="/login" />

    if (roles && !roles.some(r => role === r || role?.includes(r))) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
                <div className="card" style={{ maxWidth: '420px', width: '100%', margin: '24px', textAlign: 'center', padding: '48px 32px' }}>
                    <div style={{ width: '52px', height: '52px', background: 'var(--danger-light)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>Accès refusé</h2>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.65 }}>
                        Votre rôle <strong style={{ color: 'var(--text-primary)' }}>{role}</strong> ne permet pas d'accéder à cette page.
                    </p>
                    <a href="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex' }}>Retour au dashboard</a>
                </div>
            </div>
        )
    }

    return children
}
