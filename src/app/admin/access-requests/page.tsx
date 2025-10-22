'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { HoverCard } from '@/components/motion/HoverCard'
import { Reveal } from '@/components/motion/Reveal'
import { toast } from 'sonner'

interface AccessRequest {
  id: string
  fullName: string
  email: string
  phone?: string | null
  jobTitle: string
  companyName: string
  applicationId?: string | null
  applicationName?: string | null
  useCase: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt?: { _seconds: number; _nanoseconds: number } | string | number | null
  updatedAt?: { _seconds: number; _nanoseconds: number } | string | number | null
}

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const

type StatusFilter = (typeof statusOptions)[number]['value']

export default function AccessRequestsAdminPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<StatusFilter>('pending')
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Set initial time on client side to avoid hydration mismatch
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString())
  }, [])

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (status !== 'all') params.set('status', status)
        params.set('limit', '100')
        const res = await fetch(`/api/access-requests?${params.toString()}`)
        if (!res.ok) {
          throw new Error('Failed to load access requests')
        }
        const json = await res.json()
        const data: AccessRequest[] = json?.data || []
        setRequests(data)
        setLastUpdated(new Date().toLocaleTimeString())
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load access requests')
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [status, refreshKey])

  const pendingCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests])

  const approve = async (id: string) => {
    try {
      const res = await fetch(`/api/access-requests/${encodeURIComponent(id)}/approve`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Approved from admin panel' })
      })
      if (!res.ok) throw new Error('Approve failed')
      toast.success('Request approved')
      setRequests(prev => prev.map(r => (r.id === id ? { ...r, status: 'approved' } as AccessRequest : r)))
    } catch (e: any) {
      toast.error(e?.message || 'Approve failed')
    }
  }

  const reject = async (id: string) => {
    try {
      const res = await fetch(`/api/access-requests/${encodeURIComponent(id)}/reject`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Rejected from admin panel' })
      })
      if (!res.ok) throw new Error('Reject failed')
      toast.success('Request rejected')
      setRequests(prev => prev.map(r => (r.id === id ? { ...r, status: 'rejected' } as AccessRequest : r)))
    } catch (e: any) {
      toast.error(e?.message || 'Reject failed')
    }
  }

  const formatDate = (value?: AccessRequest['createdAt']) => {
    if (!value) return '-'
    if (typeof value === 'number') return new Date(value).toLocaleString()
    if (typeof value === 'string') return new Date(value).toLocaleString()
    if (typeof value === 'object' && '_seconds' in value) {
      return new Date((value._seconds as number) * 1000).toLocaleString()
    }
    return '-'
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Access Requests</h1>
          <p className="text-muted-foreground">Review and take action on incoming access requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Filter by status</Label>
            <Select value={status} onValueChange={(v: StatusFilter) => setStatus(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => setRefreshKey(k => k + 1)}>Refresh</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Reveal>
        <HoverCard>
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
            <CardDescription>All loaded requests</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{requests.length}</CardContent>
        </Card>
        </HoverCard>
        </Reveal>
        <Reveal delay={0.05}>
        <HoverCard>
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>Awaiting review</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{pendingCount}</CardContent>
        </Card>
        </HoverCard>
        </Reveal>
        <Reveal delay={0.1}>
        <HoverCard>
        <Card>
          <CardHeader>
            <CardTitle>Last Updated</CardTitle>
            <CardDescription>Last refresh time</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{lastUpdated}</CardContent>
        </Card>
        </HoverCard>
        </Reveal>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <CardDescription>Approve or reject access requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Applicant</TableHead>
                  <TableHead className="min-w-[180px]">Company</TableHead>
                  <TableHead className="min-w-[160px]">Application</TableHead>
                  <TableHead className="min-w-[140px]">Status</TableHead>
                  <TableHead className="min-w-[180px]">Submitted</TableHead>
                  <TableHead className="min-w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading...</TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No requests</TableCell>
                  </TableRow>
                ) : (
                  requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.fullName}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{r.companyName}</div>
                        <div className="text-xs text-muted-foreground">{r.jobTitle}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{r.applicationName || '-'}</div>
                        <div className="text-xs text-muted-foreground">{r.applicationId || '-'}</div>
                      </TableCell>
                      <TableCell className="capitalize">{r.status}</TableCell>
                      <TableCell>{formatDate(r.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" disabled={r.status !== 'pending'} onClick={() => approve(r.id)}>Approve</Button>
                          <Button size="sm" variant="destructive" disabled={r.status !== 'pending'} onClick={() => reject(r.id)}>Reject</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
