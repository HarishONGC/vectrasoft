import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { getRole, isAuthenticated } from './auth'
import { AdminLayout } from '../layouts/AdminLayout'
import { ControlRoomLayout } from '../layouts/ControlRoomLayout'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ControlRoomDashboardPage } from '../pages/ControlRoomDashboardPage'
import { AdminLocationsPage } from '../pages/admin/AdminLocationsPage'
import { AdminCamerasPage } from '../pages/admin/AdminCamerasPage'
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'

function HomeRedirect() {
  const role = getRole()
  if (role === 'ADMIN') return <Navigate to="/control-room" replace />
  if (role === 'OPERATOR' || role === 'VIEWER') return <Navigate to="/control-room" replace />
  return <Navigate to="/login" replace />
}

function RequireRole({ roles, children }: { roles: Array<'ADMIN' | 'OPERATOR' | 'VIEWER'>; children: ReactNode }) {
  const r = getRole()
  if (!isAuthenticated() || !r || !roles.includes(r)) return <Navigate to="/login" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  { path: '/', element: <HomeRedirect /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/control-room',
    element: (
      <RequireRole roles={['ADMIN', 'OPERATOR', 'VIEWER']}>
        <ControlRoomLayout />
      </RequireRole>
    ),
    children: [{ index: true, element: <ControlRoomDashboardPage /> }],
  },
  {
    path: '/admin',
    element: (
      <RequireRole roles={['ADMIN']}>
        <AdminLayout />
      </RequireRole>
    ),
    children: [
      { path: 'locations', element: <AdminLocationsPage /> },
      { path: 'cameras', element: <AdminCamerasPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { index: true, element: <Navigate to="/admin/locations" replace /> },
    ],
  },
  {
    path: '*',
    element: (
      <RequireRole roles={['ADMIN', 'OPERATOR', 'VIEWER']}>
        <NotFoundPage />
      </RequireRole>
    ),
  },
])
