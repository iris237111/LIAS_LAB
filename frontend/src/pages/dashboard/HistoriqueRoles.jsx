import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/Layout'
import api from '../../api'

const ROLE_LABELS = { DIRECTOR: 'Directeur', VICE_DIR: 'Vice-Directeur', TEAM_CHIEF: 'Chef d\'équipe', MEMBER: 'Membre' }
const ROLE_BADGE = { DIRECTOR: 'badge-purple', VICE_DIR: 'badge-purple', TEAM_CHIEF: 'badge-blue', MEMBER: 'badge-teal' }

export default function HistoriqueRoles() {
    const [history, setHistory] = useState([])
    const [membres, setMembres] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterRole, setFilterRole] = useState('')

    useEffect(() => {
        Promise.all([
            api.get('/admin/roles-history').then(r => setHistory(r.data)),
            api.get('/members').then(r => setMembres(r.data)),
        ]).finally(() => setLoading(false))
    }, [])

    const getMemberName = (id) => {
        const m = membres.find(m => m.id === parseInt(id))
        return m ? `${m.firstName} ${m.lastName}` : `Membre #${id}`
    }

    const fmt = d => d ? new Date(d).toLocaleDateString('fr-FR') : 'En cours'

    const filtered = history.filter(h => {
        const name = getMemberName(h.memberId).toLowerCase()
        const matchSearch = !search || name.includes(search.toLowerCase())
        const matchRole = !filterRole || h.role === filterRole
        return matchSearch && matchRole
    })

    return (
        <DashboardLayout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Historique des rôles</h1>
                    <p className="page-subtitle">Journal complet des responsabilités du laboratoire</p>
                </div>
                <span className="badge badge-gray" style={{ fontSize: '13px', padding: '5px 14px' }}>{filtered.length} entrées</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input className="form-input" placeholder="Rechercher par nom..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '280px' }} />
                <select className="form-input" value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ maxWidth: '200px' }}>
                    <option value="">Tous les rôles</option>
                    {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
            </div>

            {loading ? <div className="loading">Chargement...</div> : filtered.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg>
                    </div>
                    <p className="empty-title">Aucun résultat</p>
                    <p className="empty-desc">Modifiez vos critères de recherche.</p>
                </div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Membre</th>
                                <th>Rôle</th>
                                <th>Date de début</th>
                                <th>Date de fin</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((h, i) => {
                                const active = !h.endDate || new Date(h.endDate) >= new Date()
                                return (
                                    <tr key={h.id || i}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className="avatar avatar-sm">{getMemberName(h.memberId).split(' ').map(w => w[0]).slice(0,2).join('')}</div>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{getMemberName(h.memberId)}</span>
                                            </div>
                                        </td>
                                        <td><span className={`badge ${ROLE_BADGE[h.role] || 'badge-gray'}`}>{ROLE_LABELS[h.role] || h.role}</span></td>
                                        <td>{fmt(h.startDate)}</td>
                                        <td>{fmt(h.endDate)}</td>
                                        <td><span className={`badge ${active ? 'badge-green' : 'badge-gray'}`}>{active ? 'Actif' : 'Terminé'}</span></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    )
}
