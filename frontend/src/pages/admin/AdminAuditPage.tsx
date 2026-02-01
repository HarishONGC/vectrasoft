import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useAudit } from '../../api/hooks'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

export function AdminAuditPage() {
  const { data = [], isLoading } = useAudit()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return data
    return data.filter((e) => {
      const blob = `${e.actor} ${e.action} ${e.entityName ?? ''} ${e.entityId ?? ''} ${JSON.stringify(e.details ?? {})}`
      return blob.toLowerCase().includes(query)
    })
  }, [data, q])

  return (
    <div className="min-h-full p-3 sm:p-4">
      <div>
        <div className="text-lg font-semibold">Audit Logs</div>
        <div className="text-sm text-muted">Tracks admin changes for compliance and accountability.</div>
      </div>

      <div className="mt-3">
        <Card className="p-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search audit events" className="pl-9" />
          </div>
        </Card>
      </div>

      <div className="mt-3">
        <Card className="p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-border/70">
                <th className="py-2 text-left font-medium">Time</th>
                <th className="py-2 text-left font-medium">Actor</th>
                <th className="py-2 text-left font-medium">Action</th>
                <th className="py-2 text-left font-medium">Entity</th>
                <th className="py-2 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="py-3 text-muted" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : null}

              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-border/50">
                  <td className="py-2 text-muted tabular-nums">{e.at}</td>
                  <td className="py-2 text-muted">{e.actor}</td>
                  <td className="py-2 font-medium">{e.action}</td>
                  <td className="py-2 text-muted">{e.entityName ?? e.entityId ?? '—'}</td>
                  <td className="py-2 text-muted">
                    <span className="block max-w-[520px] truncate">{e.details ? JSON.stringify(e.details) : '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
