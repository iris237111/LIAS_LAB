import { useEffect, useState } from 'react'
import { PublicLayout } from '../components/Layout'
import api from '../api'

const TYPE_COLORS = {
    CONFERENCE: { bg: '#dbeafe', color: '#1d4ed8' },
    SEMINAR:    { bg: '#fef3c7', color: '#b45309' },
    WORKSHOP:   { bg: '#f0fdf4', color: '#16a34a' },
    DEFENSE:    { bg: '#fdf2f8', color: '#be185d' },
    OTHER:      { bg: '#f1f5f9', color: '#475569' },
}
const TYPE_LABELS = { CONFERENCE: 'Conférence', SEMINAR: 'Séminaire', WORKSHOP: 'Workshop', DEFENSE: 'Soutenance', OTHER: 'Autre' }

export default function Calendrier() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentMonth, setCurrentMonth] = useState(new Date())

    useEffect(() => {
        api.get('/public/events').then(r => setEvents(r.data)).catch(() => {}).finally(() => setLoading(false))
    }, [])

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthLabel = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

    const eventsThisMonth = events.filter(e => {
        const d = new Date(e.startDate)
        return d.getFullYear() === year && d.getMonth() === month
    })

    const eventsByDay = {}
    eventsThisMonth.forEach(e => {
        const day = new Date(e.startDate).getDate()
        if (!eventsByDay[day]) eventsByDay[day] = []
        eventsByDay[day].push(e)
    })

    const prev = () => setCurrentMonth(new Date(year, month - 1, 1))
    const next = () => setCurrentMonth(new Date(year, month + 1, 1))

    const cells = []
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    const today = new Date()

    return (
        <PublicLayout>
            <div style={{ background: '#0a1628', padding: '52px 0 48px', textAlign: 'center' }}>
                <div className="container">
                    <h1 style={{ fontSize: '34px', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: '10px' }}>Calendrier</h1>
                    <p style={{ fontSize: '15px', color: '#94a3b8' }}>Planification des événements et activités du laboratoire.</p>
                </div>
            </div>

            <div style={{ padding: '48px 0', background: 'var(--surface-2)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <button onClick={prev} className="btn btn-ghost btn-sm">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                                </button>
                                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{monthLabel}</span>
                                <button onClick={next} className="btn btn-ghost btn-sm">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '8px' }}>
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                                    <div key={d} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{d}</div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                                {cells.map((day, i) => {
                                    const hasEvent = day && eventsByDay[day]
                                    const isToday = day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
                                    return (
                                        <div key={i} style={{
                                            aspectRatio: '1',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 'var(--radius-sm)',
                                            background: isToday ? 'var(--primary)' : hasEvent ? 'var(--primary-50)' : 'transparent',
                                            position: 'relative',
                                            cursor: hasEvent ? 'pointer' : 'default',
                                        }}>
                                            {day && (
                                                <>
                                                    <span style={{ fontSize: '13px', fontWeight: isToday ? 700 : 400, color: isToday ? '#fff' : 'var(--text-primary)' }}>{day}</span>
                                                    {hasEvent && !isToday && (
                                        <span style={{
                                            position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)',
                                            background: 'var(--primary)', color: '#fff',
                                            fontSize: '9px', fontWeight: 700, borderRadius: '4px',
                                            padding: '1px 5px', lineHeight: 1.4, whiteSpace: 'nowrap',
                                        }}>
                                            {eventsByDay[day].length} év.
                                        </span>
                                    )}
                                                </>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'capitalize' }}>
                                Événements — {monthLabel}
                            </h3>
                            {loading ? <div className="loading" style={{ padding: '24px' }}>Chargement...</div>
                                : eventsThisMonth.length === 0 ? (
                                    <div className="empty" style={{ padding: '32px' }}>
                                        <p className="empty-title" style={{ fontSize: '14px' }}>Aucun événement ce mois</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {eventsThisMonth.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).map(ev => (
                                            <div key={ev.id} className="card card-sm" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                <div style={{ minWidth: '36px', textAlign: 'center', background: 'var(--primary-50)', borderRadius: 'var(--radius-sm)', padding: '4px' }}>
                                                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{new Date(ev.startDate).getDate()}</div>
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</div>
                                                        {ev.type && <span style={{ ...TYPE_COLORS[ev.type] || TYPE_COLORS.OTHER, fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px' }}>{TYPE_LABELS[ev.type] || ev.type}</span>}
                                                    </div>
                                                    {ev.location && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{ev.location}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    )
}
