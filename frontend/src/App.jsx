import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Rejoindre from './pages/Rejoindre'
import Equipes from './pages/Equipes'
import Evenements from './pages/Evenements'
import Publications from './pages/Publications'
import Dashboard from './pages/Dashboard'
import Adhesions from './pages/dashboard/Adhesions'
import Profil from './pages/dashboard/Profil'
import AjouterPublication from './pages/dashboard/AjouterPublication'
import Membres from './pages/dashboard/Membres'
import Rapport from './pages/dashboard/Rapport'
import EvenementsDashboard from './pages/dashboard/Evenements'
import EquipesDashboard from './pages/dashboard/Equipes'
import DemandesMateriel from './pages/dashboard/DemandesMateriel'
import Documents from './pages/dashboard/Documents'
import Mandats from './pages/dashboard/Mandats'
import HistoriqueRoles from './pages/dashboard/HistoriqueRoles'
import Reunions from './pages/dashboard/Reunions'
import PVs from './pages/dashboard/PVs'
import Conventions from './pages/dashboard/Conventions'
import Materiel from './pages/dashboard/Materiel'
import Messages from './pages/dashboard/Messages'
import Notifications from './pages/dashboard/Notifications'
import ChatPrive from './pages/dashboard/ChatPrive'
import ProtectedRoute from './components/ProtectedRoute'
import Recherche from './pages/Recherche'
import Calendrier from './pages/Calendrier'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Pages publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/rejoindre" element={<Rejoindre />} />
                <Route path="/equipes" element={<Equipes />} />
                <Route path="/evenements" element={<Evenements />} />
                <Route path="/publications" element={<Publications />} />
                <Route path="/recherche" element={<Recherche />} />
                <Route path="/calendrier" element={<Calendrier />} />
                {/* Pages membres connectés */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/profil" element={
                    <ProtectedRoute>
                        <Profil />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/publications" element={
                    <ProtectedRoute>
                        <AjouterPublication />
                    </ProtectedRoute>
                } />

                {/* Pages admin/directeur uniquement */}
                <Route path="/dashboard/adhesions" element={
                    <ProtectedRoute roles={['DIRECTOR', 'ADMIN']}>
                        <Adhesions />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/membres" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <Membres />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/rapport" element={
                    <ProtectedRoute roles={['ADMIN', 'DIRECTOR']}>
                        <Rapport />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/evenements" element={
                    <ProtectedRoute roles={['ADMIN', 'DIRECTOR']}>
                        <EvenementsDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/reunions" element={
                    <ProtectedRoute roles={['ADMIN', 'DIRECTOR']}>
                        <Reunions />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/pv" element={
                    <ProtectedRoute roles={['ADMIN', 'DIRECTOR']}>
                        <PVs />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/conventions" element={
                    <ProtectedRoute roles={['ADMIN', 'DIRECTOR']}>
                        <Conventions />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/materiel" element={
                    <ProtectedRoute roles={['ADMIN', 'DIRECTOR']}>
                        <Materiel />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/equipes" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <EquipesDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/demandes-materiel" element={
                    <ProtectedRoute>
                        <DemandesMateriel />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/documents" element={
                    <ProtectedRoute>
                        <Documents />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/mandats" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <Mandats />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/historique-roles" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <HistoriqueRoles />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/messages" element={
                    <ProtectedRoute>
                        <Messages />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/notifications" element={
                    <ProtectedRoute>
                        <Notifications />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/chat-prive/:userId" element={
                    <ProtectedRoute>
                        <ChatPrive />
                    </ProtectedRoute>
                } />

            </Routes>
        </BrowserRouter>
    )
}

export default App
