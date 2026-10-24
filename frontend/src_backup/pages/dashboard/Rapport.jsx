import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

export default function Rapport() {
    const [year, setYear] = useState(new Date().getFullYear())
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleGenerate = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await api.get(`/reports/generate?year=${year}`, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `rapport-lias-${year}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (e) {
            setError('Erreur lors de la génération du rapport.')
        } finally {
            setLoading(false)
        }
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
            <div style={{ flex: 1, maxWidth: '700px', width: '100%', margin: '0 auto', padding: '40px' }}>

                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#134e4a', margin: '0 0 6px' }}>Rapport annuel</h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Générez le rapport d'activité annuel du laboratoire LIAS</p>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', padding: '36px', border: '0.5px solid #99f6e4' }}>

                    {/* Info */}
                    <div style={{ background: '#f0fdfa', borderRadius: '10px', padding: '20px', marginBottom: '28px', border: '0.5px solid #99f6e4' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#134e4a', marginBottom: '8px' }}>📊 Contenu du rapport</div>
                        <ul style={{ fontSize: '13px', color: '#6b7280', lineHeight: 2, paddingLeft: '20px', margin: 0 }}>
                            <li>Nombre d'événements de l'année</li>
                            <li>Publications scientifiques</li>
                            <li>Membres actifs du laboratoire</li>
                            <li>Informations générales du LIAS</li>
                        </ul>
                    </div>

                    {/* Année */}
                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                            Année du rapport
                        </label>
                        <input
                            type="number"
                            value={year}
                            onChange={e => setYear(parseInt(e.target.value))}
                            min="2000"
                            max="2100"
                            style={{ width: '100%', padding: '12px', border: '1px solid #d1fae5', borderRadius: '8px', fontSize: '16px', fontWeight: 700, color: '#134e4a', outline: 'none', boxSizing: 'border-box', background: '#f9fffe', textAlign: 'center' }}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {/* Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        style={{ width: '100%', padding: '14px', background: loading ? '#99f6e4' : '#0d9488', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? '⏳ Génération en cours...' : '📥 Générer et télécharger le PDF'}
                    </button>

                </div>
            </div>

            {/* FOOTER */}
            <div style={{ background: '#134e4a', padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>

        </div>
    )
}