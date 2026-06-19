import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ConfirmDialog, ToastContainer } from './components/ui'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { SuperAdminRoute } from './components/SuperAdminRoute'
import { DevConsolePage } from './features/dev-console/pages/DevConsolePage'
import { CreateExpensePage } from './features/expenses/pages/CreateExpensePage'
import { EditExpensePage } from './features/expenses/pages/EditExpensePage'
import { EventExpensesPage } from './features/expenses/pages/EventExpensesPage'
import { CreateEventPage } from './features/events/pages/CreateEventPage'
import { JoinEventPage } from './features/events/pages/JoinEventPage'
import { EventSettingsPage } from './features/events/pages/EventSettingsPage'
import { EventsPage } from './features/events/pages/EventsPage'
import { EventLayout } from './features/events/layouts/EventLayout'
import { EventMembersPage } from './features/members/pages/EventMembersPage'
import { ProfilePage } from './features/profile/pages/ProfilePage'
import { EventSettlementsPage } from './features/settlements/pages/EventSettlementsPage'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <>
      <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/app" element={<Navigate to="/app/events" replace />} />
          <Route path="/app/events" element={<EventsPage />} />
          <Route path="/app/events/new" element={<CreateEventPage />} />
          <Route path="/app/join" element={<JoinEventPage />} />
          <Route path="/app/events/:eventCode" element={<EventLayout />}>
            <Route index element={<Navigate to="expenses" replace />} />
            <Route path="expenses/new" element={<CreateExpensePage />} />
            <Route path="expenses/:expenseId/edit" element={<EditExpensePage />} />
            <Route path="expenses" element={<EventExpensesPage />} />
            <Route path="members" element={<EventMembersPage />} />
            <Route path="settlements" element={<EventSettlementsPage />} />
            <Route path="settings" element={<EventSettingsPage />} />
          </Route>
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route element={<SuperAdminRoute />}>
            <Route path="/app/dev-console" element={<DevConsolePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
      <ConfirmDialog />
      <ToastContainer />
    </>
  )
}
