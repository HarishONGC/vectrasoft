import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { useHealthSettings, useUpdateHealthSettings } from '../../api/hooks'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

export function AdminSettingsPage() {
  const { data, isLoading } = useHealthSettings()
  const update = useUpdateHealthSettings()

  const [pingIntervalSeconds, setPingIntervalSeconds] = useState(5)
  const [timeoutMs, setTimeoutMs] = useState(1200)
  const [unstableThreshold, setUnstableThreshold] = useState(2)
  const [offlineTimeoutSeconds, setOfflineTimeoutSeconds] = useState(20)
  const [latencyWarnMs, setLatencyWarnMs] = useState(250)
  const [autoRetryCount, setAutoRetryCount] = useState(2)
  const [escalationMinutes, setEscalationMinutes] = useState(10)

  useEffect(() => {
    if (!data) return
    setPingIntervalSeconds(data.pingIntervalSeconds)
    setTimeoutMs(data.timeoutMs)
    setUnstableThreshold(data.unstableThreshold)
    setOfflineTimeoutSeconds(data.offlineTimeoutSeconds)
    setLatencyWarnMs(data.latencyWarnMs)
    setAutoRetryCount(data.autoRetryCount)
    setEscalationMinutes(data.escalationMinutes)
  }, [data])

  return (
    <div className="min-h-full p-3 sm:p-4">
      <div>
        <div className="text-lg font-semibold">Health Check Settings</div>
        <div className="text-sm text-muted">Tune ping interval, timeout, and unstable thresholds.</div>
      </div>

      <div className="mt-3 max-w-3xl">
        <Card className="p-4">
          {isLoading ? <div className="text-sm text-muted">Loading...</div> : null}

          <div className="mt-1 grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Ping Interval (sec)</div>
              <Input
                type="number"
                value={pingIntervalSeconds}
                onChange={(e) => setPingIntervalSeconds(Number(e.target.value))}
              />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Timeout (ms)</div>
              <Input type="number" value={timeoutMs} onChange={(e) => setTimeoutMs(Number(e.target.value))} />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Unstable Threshold</div>
              <Input
                type="number"
                value={unstableThreshold}
                onChange={(e) => setUnstableThreshold(Number(e.target.value))}
              />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Offline Timeout (sec)</div>
              <Input type="number" value={offlineTimeoutSeconds} onChange={(e) => setOfflineTimeoutSeconds(Number(e.target.value))} />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Latency Warning (ms)</div>
              <Input type="number" value={latencyWarnMs} onChange={(e) => setLatencyWarnMs(Number(e.target.value))} />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Auto-Retry Count</div>
              <Input type="number" value={autoRetryCount} onChange={(e) => setAutoRetryCount(Number(e.target.value))} />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">Escalation Window (min)</div>
              <Input type="number" value={escalationMinutes} onChange={(e) => setEscalationMinutes(Number(e.target.value))} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-muted">
              In production: use these settings for ICMP/TCP ping and camera heartbeat checks.
            </div>
            <Button
              variant="primary"
              disabled={update.isPending}
              onClick={() =>
                update.mutate({
                  pingIntervalSeconds,
                  timeoutMs,
                  unstableThreshold,
                  offlineTimeoutSeconds,
                  latencyWarnMs,
                  autoRetryCount,
                  escalationMinutes,
                })
              }
            >
              <Save size={16} /> Save
            </Button>
          </div>

          {update.isSuccess ? <div className="mt-2 text-xs text-emerald-500">Saved.</div> : null}
          {update.error ? <div className="mt-2 text-xs text-rose-500">Save failed.</div> : null}
        </Card>
      </div>
    </div>
  )
}
