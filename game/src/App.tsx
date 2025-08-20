import { Routes, Route } from 'react-router-dom'
import { MockAuthProvider } from './contexts/MockAuthContext'
import { EventStateProvider } from './contexts/EventStateContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Navigation } from './components/Navigation'
import { UserSwitcher } from './components/UserSwitcher'
import { ToastProvider } from './components/Toast'
import { Explore } from './pages/Explore'
import { EventDetail } from './pages/EventDetail'
import { Dashboard } from './pages/Dashboard'
import { CreateEvent } from './pages/CreateEvent'
import { Login } from './pages/Login'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <MockAuthProvider>
      <EventStateProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
          <Navigation />
          
          {/* Demo User Switcher */}
          <div className="fixed top-20 right-4 z-40">
            <UserSwitcher />
          </div>
          
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Explore />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create" 
                element={
                  <ProtectedRoute>
                    <CreateEvent />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        </ToastProvider>
      </EventStateProvider>
    </MockAuthProvider>
  )
}

export default App

