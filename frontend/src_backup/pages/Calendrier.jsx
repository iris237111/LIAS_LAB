import { useEffect, useState } from 'react'
import api from '../api'

export default function Calendrier() {
    const [evenements, setEvenements] = useState([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selected, setSelected] = useState(null)
    const token = localStorage.getItem('token')

    useEffect(() => {
        api.get('/public/events').then(r => setEvenements(r.data))
    }, [])

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

    const getEventsForDay = (day) => {
        return evenements.filter(e => {
            if (!e.startDate) return false
            const d = new Date(e.startDate)
            return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
        })
    }

    const typeColor = {
        CONFERENCE: '#3b82f6',
        SEMINAR: '#10b981',
        WORKSHOP: '#f59e0b',
    }

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* NAVBAR */}
            <div style={{ background: '#134e4a', width: '100%' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
                    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #1a6b65' }}>
                        <a href="/" style={{ fontSize: '20px', fontWeight: 800, color: '#ccfbf1', letterSpacing: '2px', textDecoration: 'none' }}>LIAS</a>
                        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                            <a href="/" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Accueil</a>
                            <a href="/equipes" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Équipes</a>
                            <a href="/evenements" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Événements</a>
                            <a href="/publications" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Publications</a>
                            <a href="/recherche" style={{ color: '#99f6e4', textDecoration: 'none', fontSize: '14px' }}>Recherche</a>
                            {token ? (
                                <a href="/dashboard" style={{ background: '#2dd4bf', color: '#134e4a', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Dashboard</a>
                            ) : (
                                <a href="/login" style={{ background: '#2dd4bf', color: '#134e4a', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>Connexion</a>
                            )}
                        </div>
                    </nav>

                    <div style={{ padding: '40px 0 36px', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#5eead4', fontWeight: 700, letterSpacing: '4px', marginBottom: '10px' }}>AGENDA</div>
                        <h1 style={{ fontSize: '40px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1.5px', margin: 0 }}>Calendrier</h1>
                        <p style={{ color: '#99f6e4', fontSize: '15px', marginTop: '10px' }}>Visualisez les événements du laboratoire LIAS</p>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>

                    {/* Calendrier */}
                    <div style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '16px', overflow: 'hidden' }}>

                        {/* Navigation mois */}
                        <div style={{ background: '#134e4a', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button onClick={prevMonth} style={{ background: 'transparent', border: '1px solid #99f6e4', color: '#99f6e4', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '16px' }}>←</button>
                            <span style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>{monthNames[month]} {year}</span>
                            <button onClick={nextMonth} style={{ background: 'transparent', border: '1px solid #99f6e4', color: '#99f6e4', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '16px' }}>→</button>
                        </div>

                        {/* Jours de la semaine */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f0fdfa' }}>
                            {dayNames.map(d => (
                                <div key={d} style={{ padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#0d9488' }}>{d}</div>
                            ))}
                        </div>

                        {/* Grille des jours */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} style={{ minHeight: '80px', borderBottom: '0.5px solid #f0fdfa', borderRight: '0.5px solid #f0fdfa' }} />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1
                                const dayEvents = getEventsForDay(day)
                                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year
                                return (
                                    <div
                                        key={day}
                                        onClick={() => dayEvents.length > 0 && setSelected(dayEvents)}
                                        style={{ minHeight: '80px', borderBottom: '0.5px solid #f0fdfa', borderRight: '0.5px solid #f0fdfa', padding: '6px', cursor: dayEvents.length > 0 ? 'pointer' : 'default', background: isToday ? '#f0fdfa' : 'white' }}>
                                        <div style={{ fontSize: '13px', fontWeight: isToday ? 800 : 400, color: isToday ? '#0d9488' : '#374151', marginBottom: '4px', width: '24px', height: '24px', background: isToday ? '#0d9488' : 'transparent', color: isToday ? 'white' : '#374151', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {day}
                                        </div>
                                        {dayEvents.slice(0, 2).map(e => (
                                            <div key={e.id} style={{ background: typeColor[e.type] || '#0d9488', color: 'white', fontSize: '10px', borderRadius: '3px', padding: '2px 5px', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {e.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <div style={{ fontSize: '10px', color: '#0d9488', fontWeight: 600 }}>+{dayEvents.length - 2} autres</div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Légende */}
                        <div style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#134e4a', marginBottom: '12px' }}>Légende</div>
                            {[
                                { type: 'CONFERENCE', label: 'Conférence', color: '#3b82f6' },
                                { type: 'SEMINAR', label: 'Séminaire', color: '#10b981' },
                                { type: 'WORKSHOP', label: 'Workshop', color: '#f59e0b' },
                            ].map(({ label, color }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', background: color, borderRadius: '3px' }} />
                                    <span style={{ fontSize: '13px', color: '#374151' }}>{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Événements sélectionnés */}
                        {selected ? (
                            <div style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#134e4a' }}>Événements</div>
                                    <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '16px' }}>✕</button>
                                </div>
                                {selected.map(e => (
                                    <div key={e.id} style={{ borderLeft: `3px solid ${typeColor[e.type] || '#0d9488'}`, paddingLeft: '12px', marginBottom: '16px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#134e4a', marginBottom: '4px' }}>{e.title}</div>
                                        {e.location && <div style={{ fontSize: '12px', color: '#6b7280' }}>📍 {e.location}</div>}
                                        {e.description && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', lineHeight: 1.5 }}>{e.description.substring(0, 100)}...</div>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ background: '#f0fdfa', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                                Cliquez sur un jour avec des événements pour voir les détails
                            </div>
                        )}

                        {/* Prochain événement */}
                        {evenements.length > 0 && (
                            <div style={{ background: 'white', border: '0.5px solid #99f6e4', borderRadius: '12px', padding: '20px', marginTop: '16px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#134e4a', marginBottom: '12px' }}>📅 Prochain événement</div>
                                {(() => {
                                    const next = evenements
                                        .filter(e => e.startDate && new Date(e.startDate) >= new Date())
                                        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0]
                                    return next ? (
                                        <div style={{ borderLeft: `3px solid ${typeColor[next.type] || '#0d9488'}`, paddingLeft: '12px' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#134e4a' }}>{next.title}</div>
                                            <div style={{ fontSize: '12px', color: '#0d9488', marginTop: '4px' }}>
                                                {new Date(next.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                    ) : <div style={{ fontSize: '13px', color: '#9ca3af' }}>Aucun événement à venir</div>
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div style={{ background: '#134e4a', padding: '30px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5eead4' }}>© 2026 Laboratoire LIAS — Faculté des Sciences Ben M'Sik, Casablanca</div>
            </div>

        </div>
    )
}