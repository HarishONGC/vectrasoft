import { useEffect, useMemo, useState } from 'react'
import { Plus, ShieldCheck, Trash2, UserCog } from 'lucide-react'
import type { Location, User, UserLocationAccess } from '../../api/types'
import { useCreateUser, useDeleteUser, useLocationsAdmin, useUpdateUser, useUpdateUserAccess, useUserAccess, useUsers } from '../../api/hooks'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'

type UserFormState = {
  name: string
  email: string
  password: string
  role: User['role']
}

const emptyForm: UserFormState = {
  name: '',
  email: '',
  password: '',
  role: 'VIEWER',
}

export function AdminUsersPage() {
  const { data: users = [], isLoading: loadingUsers } = useUsers()
  const { data: locations = [] } = useLocationsAdmin()

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const updateAccess = useUpdateUserAccess()

  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form, setForm] = useState<UserFormState>(emptyForm)
  const [showUserModal, setShowUserModal] = useState(false)
  const [accessUser, setAccessUser] = useState<User | null>(null)

  const accessQuery = useUserAccess(accessUser?.id ?? null)
  const [accessDraft, setAccessDraft] = useState<UserLocationAccess[]>([])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [users, search])

  const openCreate = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setShowUserModal(true)
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setForm({ name: user.name, email: user.email, password: '', role: user.role })
    setShowUserModal(true)
  }

  const handleSaveUser = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    if (!editingUser && !form.password.trim()) return

    if (editingUser) {
      await updateUser.mutateAsync({
        id: editingUser.id,
        payload: {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          ...(form.password.trim() ? { password: form.password.trim() } : {}),
        },
      })
    } else {
      await createUser.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        role: form.role,
      })
    }

    setShowUserModal(false)
  }

  const openAccess = (user: User) => {
    setAccessUser(user)
  }

  useEffect(() => {
    if (!accessUser) return
    setAccessDraft(accessQuery.data ?? [])
  }, [accessUser, accessQuery.data])

  const closeAccess = () => {
    setAccessUser(null)
    setAccessDraft([])
  }

  const toggleAccess = (loc: Location, field: 'canView' | 'canControl') => {
    setAccessDraft((prev) => {
      const existing = prev.find((a) => a.locationId === loc.id)
      if (!existing) {
        const next = { locationId: loc.id, canView: field === 'canView', canControl: field === 'canControl' }
        return [...prev, next]
      }
      return prev.map((a) =>
        a.locationId === loc.id
          ? {
              ...a,
              [field]: !a[field],
              ...(field === 'canControl' && !a.canView ? { canView: true } : {}),
            }
          : a,
      )
    })
  }

  const isChecked = (locId: string, field: 'canView' | 'canControl') => {
    return accessDraft.find((a) => a.locationId === locId)?.[field] ?? false
  }

  const saveAccess = async () => {
    if (!accessUser) return
    await updateAccess.mutateAsync({ id: accessUser.id, access: accessDraft })
    closeAccess()
  }

  return (
    <div className="min-h-full p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">Users & Access</div>
          <div className="text-xs text-muted">Create users and grant location access.</div>
        </div>
        <div className="flex items-center gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" className="h-9" />
          <Button variant="primary" onClick={openCreate}>
            <Plus size={14} /> Add User
          </Button>
        </div>
      </div>

      <Card className="mt-4 p-3">
        {loadingUsers ? (
          <div className="text-sm text-muted">Loading users...</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-border/60">
                    <td className="py-2 font-medium text-text">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <Badge tone={user.role === 'ADMIN' ? 'brand' : user.role === 'OPERATOR' ? 'ok' : 'neutral'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="text-xs text-muted">{new Date(user.createdAt).toLocaleString()}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => openAccess(user)}>
                          <ShieldCheck size={14} /> Access
                        </Button>
                        <Button variant="secondary" onClick={() => openEdit(user)}>
                          <UserCog size={14} /> Edit
                        </Button>
                        <Button variant="ghost" onClick={() => deleteUser.mutate(user.id)}>
                          <Trash2 size={14} /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showUserModal} onClose={() => setShowUserModal(false)} title={editingUser ? 'Edit User' : 'Create User'}>
        <div className="grid gap-3">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
          <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder={editingUser ? 'New password (optional)' : 'Password'}
          />
          <Select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as User['role'] }))}>
            <option value="ADMIN">ADMIN</option>
            <option value="OPERATOR">OPERATOR</option>
            <option value="VIEWER">VIEWER</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowUserModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveUser}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!accessUser} onClose={closeAccess} title={`Location Access${accessUser ? ` • ${accessUser.name}` : ''}`}>
        <div className="grid gap-3">
          <div className="text-xs text-muted">Toggle view/control permissions per location.</div>
          <div className="max-h-[360px] overflow-auto border border-border/60 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted">
                  <th className="py-2 px-3">Location</th>
                  <th className="px-3">View</th>
                  <th className="px-3">Control</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} className="border-t border-border/60">
                    <td className="py-2 px-3">
                      <div className="font-medium text-text">{loc.name}</div>
                      <div className="text-xs text-muted">{loc.code}</div>
                    </td>
                    <td className="px-3">
                      <input
                        type="checkbox"
                        checked={isChecked(loc.id, 'canView')}
                        onChange={() => toggleAccess(loc, 'canView')}
                      />
                    </td>
                    <td className="px-3">
                      <input
                        type="checkbox"
                        checked={isChecked(loc.id, 'canControl')}
                        onChange={() => toggleAccess(loc, 'canControl')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeAccess}>Cancel</Button>
            <Button variant="primary" onClick={saveAccess}>Save Access</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}