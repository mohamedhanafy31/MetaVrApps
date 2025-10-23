'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FloatingCard, AdvancedHolographicCard } from '@/components/ui/vr-effects';
import { FadeIn } from '@/components/motion/FadeIn';
import { HoverCard } from '@/components/motion/HoverCard';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Eye,
  Settings,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface AccessRequest {
  id: string;
  fullName: string;
  email: string;
  company: string;
  jobTitle: string;
  applicationId: string;
  useCase: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Application {
  id: string;
  name: string;
  description: string;
  platform: 'mobile' | 'web' | 'desktop';
  status: 'active' | 'inactive' | 'maintenance';
  maxConcurrentUsers: number;
  currentUsers: number;
  iconUrl?: string;
}

interface KPIData {
  totalUsers: number;
  totalApplications: number;
  pendingRequests: number;
  trialConversionRate: number;
}

export default function AdminDashboard() {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalUsers: 0,
    totalApplications: 0,
    pendingRequests: 0,
    trialConversionRate: 0,
  });
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch KPI data
      const kpiResponse = await fetch('/api/analytics/dashboard');
      if (kpiResponse.ok) {
        const kpiData = await kpiResponse.json();
        setKpiData(kpiData.data);
      }

      // Fetch pending access requests
      const requestsResponse = await fetch('/api/access-requests?status=pending&limit=5');
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setAccessRequests(requestsData.data);
      }

      // Fetch applications
      const appsResponse = await fetch('/api/applications');
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/access-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: 'Approved from dashboard' }),
      });

      if (response.ok) {
        toast.success('Access request approved');
        fetchDashboardData(); // Refresh data
      } else {
        toast.error('Failed to approve request');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/access-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: 'Rejected from dashboard' }),
      });

      if (response.ok) {
        toast.success('Access request rejected');
        fetchDashboardData(); // Refresh data
      } else {
        toast.error('Failed to reject request');
      }
    } catch {
      toast.error('An error occurred');
    }
  };


  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'mobile':
        return '📱';
      case 'web':
        return '🌐';
      case 'desktop':
        return '💻';
      default:
        return '📱';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FadeIn delay={0}>
                <AdvancedHolographicCard>
                  <HoverCard>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{kpiData.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                          +12% from last month
                        </p>
                      </CardContent>
                    </Card>
                  </HoverCard>
                </AdvancedHolographicCard>
              </FadeIn>

              <FadeIn delay={0.1}>
                <AdvancedHolographicCard>
                  <HoverCard>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Applications</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{kpiData.totalApplications}</div>
                        <p className="text-xs text-muted-foreground">
                          {applications.filter(app => app.status === 'active').length} active
                        </p>
                      </CardContent>
                    </Card>
                  </HoverCard>
                </AdvancedHolographicCard>
              </FadeIn>

              <FadeIn delay={0.2}>
                <AdvancedHolographicCard>
                  <HoverCard>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{kpiData.pendingRequests}</div>
                        <p className="text-xs text-muted-foreground">
                          Awaiting review
                        </p>
                      </CardContent>
                    </Card>
                  </HoverCard>
                </AdvancedHolographicCard>
              </FadeIn>

              <FadeIn delay={0.3}>
                <AdvancedHolographicCard>
                  <HoverCard>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Trial Conversion</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{kpiData.trialConversionRate}%</div>
                        <p className="text-xs text-muted-foreground">
                          +5% from last month
                        </p>
                      </CardContent>
                    </Card>
                  </HoverCard>
                </AdvancedHolographicCard>
              </FadeIn>
            </div>

            {/* Recent Access Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Access Requests</CardTitle>
                <CardDescription>
                  Review and approve pending access requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accessRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending access requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accessRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {request.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.fullName}</p>
                            <p className="text-sm text-muted-foreground">{request.email}</p>
                            <p className="text-sm text-muted-foreground">{request.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="vr-success"
                            onClick={() => handleApproveRequest(request.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button size="sm" variant="vr-secondary">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>
                  Monitor your VR/AR applications and their usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {applications.map((app) => (
                    <FloatingCard key={app.id}>
                      <Card variant="holographic" className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl float-subtle">{getPlatformIcon(app.platform)}</div>
                            <div>
                              <h3 className="font-medium">{app.name}</h3>
                              <p className="text-sm text-muted-foreground">{app.platform}</p>
                            </div>
                          </div>
                          <Badge 
                            variant={app.status === 'active' ? 'active' : app.status === 'maintenance' ? 'maintenance' : 'inactive'}
                            animated={app.status === 'active'}
                          >
                            {app.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Users</span>
                            <span>{app.currentUsers}/{app.maxConcurrentUsers}</span>
                          </div>
                          <Progress 
                            value={(app.currentUsers / app.maxConcurrentUsers) * 100} 
                            variant="shimmer"
                            color={app.status === 'active' ? 'blue' : app.status === 'maintenance' ? 'orange' : 'red'}
                            animated={app.status === 'active'}
                            className="h-2"
                          />
                        </div>
                        
                        <div className="flex justify-between">
                          <Button size="sm" variant="vr-secondary">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="vr-primary">
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </Card>
                    </FloatingCard>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
    </div>
  );
}
