'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HoverCard } from '@/components/motion/HoverCard';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { DeleteApplicationDialog, DeleteAllApplicationsDialog } from '@/components/ui/confirmation-dialog';
import { 
  Building2, 
  Plus, 
  Search, 
  Settings, 
  Eye, 
  Monitor,
  Globe,
  Smartphone,
  Activity,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
// import { format } from 'date-fns';

interface Application {
  id: string;
  name: string;
  description: string;
  platform: 'desktop' | 'web' | 'mobile';
  authRequired: boolean;
  maxUsers: number;
  currentUsers: number;
  trialDefaults: {
    type: 'count' | 'duration';
    limit: number;
  };
  status: 'active' | 'maintenance' | 'inactive';
  healthCheck: {
    lastCheck: string;
    status: 'healthy' | 'warning' | 'error';
  };
  createdAt: string;
  updatedAt: string;
}

const platformLabels = {
  desktop: 'Desktop',
  web: 'Web',
  mobile: 'Mobile',
};

const statusOptions = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  { value: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-800', icon: XCircle },
];

const healthStatusColors = {
  healthy: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
};

export default function ApplicationsManagementPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: 'desktop' as 'desktop' | 'web' | 'mobile',
    authRequired: true,
    maxUsers: 50,
    trialType: 'count' as 'count' | 'duration',
    trialLimit: 10,
    status: 'active' as 'active' | 'maintenance' | 'inactive',
  });

  // Confirmation dialog states
  const [deleteApplicationDialog, setDeleteApplicationDialog] = useState<{
    isOpen: boolean;
    application: Application | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    application: null,
    isLoading: false
  });

  const [deleteAllApplicationsDialog, setDeleteAllApplicationsDialog] = useState<{
    isOpen: boolean;
    isLoading: boolean;
  }>({
    isOpen: false,
    isLoading: false
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || []);
      } else {
        toast.error('Failed to load applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async () => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          platform: formData.platform,
          authRequired: formData.authRequired,
          maxUsers: formData.maxUsers,
          trialDefaults: {
            type: formData.trialType,
            limit: formData.trialLimit,
          },
          status: formData.status,
          currentUsers: 0,
          healthCheck: {
            lastCheck: new Date().toISOString(),
            status: 'healthy',
          },
        }),
      });

      if (response.ok) {
        toast.success('Application created successfully');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchApplications();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create application');
      }
    } catch {
      toast.error('An error occurred while creating application');
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: 'active' | 'maintenance' | 'inactive') => {
    try {
      const response = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Application ${status === 'active' ? 'activated' : status === 'maintenance' ? 'put in maintenance' : 'deactivated'} successfully`);
        fetchApplications();
      } else {
        toast.error('Failed to update application status');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const handleDeleteAllApplications = async () => {
    setDeleteAllApplicationsDialog({
      isOpen: true,
      isLoading: false
    });
  };

  const confirmDeleteAllApplications = async () => {
    setDeleteAllApplicationsDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/applications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('All applications deleted successfully');
        fetchApplications();
        
        setDeleteAllApplicationsDialog({
          isOpen: false,
          isLoading: false
        });
      } else {
        toast.error('Failed to delete all applications');
        setDeleteAllApplicationsDialog(prev => ({ ...prev, isLoading: false }));
      }
    } catch {
      toast.error('An error occurred while deleting applications');
      setDeleteAllApplicationsDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    const application = applications.find(app => app.id === appId);
    if (application) {
      setDeleteApplicationDialog({
        isOpen: true,
        application,
        isLoading: false
      });
    }
  };

  const confirmDeleteApplication = async () => {
    if (!deleteApplicationDialog.application) return;
    
    setDeleteApplicationDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch(`/api/applications/${deleteApplicationDialog.application.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Application deleted successfully');
        fetchApplications();
        
        setDeleteApplicationDialog({
          isOpen: false,
          application: null,
          isLoading: false
        });
      } else {
        toast.error('Failed to delete application');
        setDeleteApplicationDialog(prev => ({ ...prev, isLoading: false }));
      }
    } catch {
      toast.error('An error occurred while deleting application');
      setDeleteApplicationDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleUpdateApplication = async () => {
    if (!selectedApplication) return;

    try {
      const response = await fetch(`/api/applications/${selectedApplication.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          platform: formData.platform,
          authRequired: formData.authRequired,
          maxUsers: formData.maxUsers,
          trialDefaults: {
            type: formData.trialType,
            limit: formData.trialLimit,
          },
          status: formData.status,
        }),
      });

      if (response.ok) {
        toast.success('Application updated successfully');
        setIsEditDialogOpen(false);
        fetchApplications();
        resetForm();
      } else {
        toast.error('Failed to update application');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  const populateFormForEdit = (app: Application) => {
    setFormData({
      name: app.name,
      description: app.description,
      platform: app.platform,
      authRequired: app.authRequired,
      maxUsers: app.maxUsers,
      trialType: app.trialDefaults.type,
      trialLimit: app.trialDefaults.limit,
      status: app.status,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      platform: 'desktop' as 'desktop' | 'web' | 'mobile',
      authRequired: true,
      maxUsers: 50,
      trialType: 'count' as 'count' | 'duration',
      trialLimit: 10,
      status: 'active' as 'active' | 'maintenance' | 'inactive',
    });
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || app.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const activeApplications = applications.filter(a => a.status === 'active').length;
  const maintenanceApplications = applications.filter(a => a.status === 'maintenance').length;
  const totalUsers = applications.reduce((sum, app) => sum + app.currentUsers, 0);
  const maxUsers = applications.reduce((sum, app) => sum + app.maxUsers, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm md:text-base">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Applications Management</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage VR/AR applications and their configurations</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="destructive"
              onClick={handleDeleteAllApplications}
              className="w-full sm:w-auto min-h-[44px]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Apps
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto min-h-[44px]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Application
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Application</DialogTitle>
                <DialogDescription>
                  Add a new VR/AR application to the platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Application Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="VR Training Simulator"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Immersive training environment"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={formData.platform} onValueChange={(value: string) => setFormData(prev => ({ ...prev, platform: value as 'desktop' | 'web' | 'mobile' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Max Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 50 }))}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trialLimit">Trial Limit</Label>
                  <Input
                    id="trialLimit"
                    type="number"
                    value={formData.trialLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, trialLimit: parseInt(e.target.value) || 10 }))}
                    placeholder="10"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateApplication}>
                    Create Application
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Application Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Application</DialogTitle>
                <DialogDescription>
                  Update application information and settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Application Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="VR Shopping Experience"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Immersive virtual shopping environment"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-platform">Platform</Label>
                  <Select value={formData.platform} onValueChange={(value: string) => setFormData(prev => ({ ...prev, platform: value as 'desktop' | 'web' | 'mobile' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trial type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxUsers">Maximum Users</Label>
                  <Input
                    id="edit-maxUsers"
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: parseInt(e.target.value) || 0 }))}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value as 'active' | 'maintenance' | 'inactive' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trial type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-authRequired"
                      checked={formData.authRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, authRequired: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="edit-authRequired">Authentication Required</Label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-trialType">Trial Type</Label>
                    <Select value={formData.trialType} onValueChange={(value: string) => setFormData(prev => ({ ...prev, trialType: value as 'count' | 'duration' }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trial type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Session Count</SelectItem>
                        <SelectItem value="duration">Time Duration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-trialLimit">Trial Limit</Label>
                    <Input
                      id="edit-trialLimit"
                      type="number"
                      value={formData.trialLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, trialLimit: parseInt(e.target.value) || 0 }))}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateApplication}>
                    Update Application
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>

          {/* View Application Details Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  Complete information for {selectedApplication?.name}
                </DialogDescription>
              </DialogHeader>
              {selectedApplication && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {selectedApplication.platform === 'desktop' && <Monitor className="w-5 h-5 text-primary" />}
                          {selectedApplication.platform === 'web' && <Globe className="w-5 h-5 text-primary" />}
                          {selectedApplication.platform === 'mobile' && <Smartphone className="w-5 h-5 text-primary" />}
                        </div>
                        <span>Basic Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Application Name</Label>
                          <p className="text-lg font-semibold">{selectedApplication.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Platform</Label>
                          <Badge className="bg-blue-100 text-blue-800">
                            {selectedApplication.platform === 'desktop' && <Monitor className="w-3 h-3 mr-1" />}
                            {selectedApplication.platform === 'web' && <Globe className="w-3 h-3 mr-1" />}
                            {selectedApplication.platform === 'mobile' && <Smartphone className="w-3 h-3 mr-1" />}
                            {selectedApplication.platform.charAt(0).toUpperCase() + selectedApplication.platform.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                          <Badge className={
                            selectedApplication.status === 'active' ? 'bg-green-100 text-green-800' :
                            selectedApplication.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {selectedApplication.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {selectedApplication.status === 'maintenance' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {selectedApplication.status === 'inactive' && <XCircle className="w-3 h-3 mr-1" />}
                            {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Authentication</Label>
                          <Badge className={selectedApplication.authRequired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {selectedApplication.authRequired ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                          <p className="text-lg">{selectedApplication.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Capacity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>User Capacity</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Current Users</Label>
                          <p className="text-2xl font-bold">{selectedApplication.currentUsers}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Maximum Users</Label>
                          <p className="text-2xl font-bold">{selectedApplication.maxUsers}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Usage</Label>
                          <p className="text-2xl font-bold">
                            {Math.round((selectedApplication.currentUsers / selectedApplication.maxUsers) * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Capacity Usage</span>
                          <span>{selectedApplication.currentUsers} / {selectedApplication.maxUsers}</span>
                        </div>
                        <Progress 
                          value={(selectedApplication.currentUsers / selectedApplication.maxUsers) * 100} 
                          className="h-3" 
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trial Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5" />
                        <span>Trial Configuration</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Trial Type</Label>
                          <p className="text-lg font-medium">
                            {selectedApplication.trialDefaults.type === 'count' ? 'Session Count' : 'Time Duration'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Trial Limit</Label>
                          <p className="text-lg font-medium">{selectedApplication.trialDefaults.limit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Health Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-5 h-5" />
                        <span>Health Status</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Health Status</Label>
                          <Badge className={
                            selectedApplication.healthCheck?.status === 'healthy' ? 'bg-green-100 text-green-800' :
                            selectedApplication.healthCheck?.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {selectedApplication.healthCheck?.status === 'healthy' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {selectedApplication.healthCheck?.status === 'warning' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {selectedApplication.healthCheck?.status === 'error' && <XCircle className="w-3 h-3 mr-1" />}
                            {selectedApplication.healthCheck?.status || 'Unknown'}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Last Health Check</Label>
                          <p className="text-lg">
                            {selectedApplication.healthCheck?.lastCheck 
                              ? new Date(selectedApplication.healthCheck.lastCheck).toLocaleString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Application Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Application ID</Label>
                          <p className="text-sm font-mono bg-muted p-2 rounded">{selectedApplication.id}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                          <p className="text-lg">{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                          <p className="text-lg">{new Date(selectedApplication.updatedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Application Status</Label>
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              selectedApplication.status === 'active' ? 'bg-green-100 text-green-800' :
                              selectedApplication.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {selectedApplication.status === 'active' ? 'Available for users' : 
                               selectedApplication.status === 'maintenance' ? 'Under maintenance' : 
                               'Not available'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Reveal>
          <HoverCard>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
          </HoverCard>
          </Reveal>
          <Reveal delay={0.05}>
          <HoverCard>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeApplications}</div>
            </CardContent>
          </Card>
          </HoverCard>
          </Reveal>
          <Reveal delay={0.1}>
          <HoverCard>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maintenanceApplications}</div>
            </CardContent>
          </Card>
          </HoverCard>
          </Reveal>
          <Reveal delay={0.15}>
          <HoverCard>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                of {maxUsers} max capacity
              </p>
            </CardContent>
          </Card>
          </HoverCard>
          </Reveal>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Monitor and manage your VR/AR applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]" id="applications-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-[180px]" id="applications-platform-filter">
                  <SelectValue placeholder="Filter by platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Applications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredApplications.map((app) => {
                const StatusIcon = statusOptions.find(s => s.value === app.status)?.icon || CheckCircle;
                const usagePercentage = (app.currentUsers / app.maxUsers) * 100;

                return (
                  <Reveal key={app.id}>
                  <HoverCard>
                  <Card className="relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{app.name}</CardTitle>
                            <div className="text-xs space-y-1">
                              <div className="truncate">{platformLabels[app.platform]}</div>
                              <div className={`truncate ${healthStatusColors[app.healthCheck?.status || 'healthy']}`}>
                                {app.healthCheck?.status || 'healthy'}
                              </div>
                            </div>
                          </div>
                        <Badge className={`flex-shrink-0 ${statusOptions.find(s => s.value === app.status)?.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusOptions.find(s => s.value === app.status)?.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{app.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Users</span>
                          <span>{app.currentUsers} / {app.maxUsers}</span>
                        </div>
                        <Progress value={usagePercentage} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Trial: {app.trialDefaults.limit} {app.trialDefaults.type}</span>
                        <span>Auth: {app.authRequired ? 'Required' : 'Optional'}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 gap-2">
                        <div className="flex space-x-1 flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplication(app);
                              setIsViewDialogOpen(true);
                            }}
                            className="flex-1 min-w-0"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplication(app);
                              populateFormForEdit(app);
                              setIsEditDialogOpen(true);
                            }}
                            className="flex-1 min-w-0"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Configure</span>
                          </Button>
                        </div>
                        <div className="flex space-x-1">
                          {app.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateApplicationStatus(app.id, 'maintenance')}
                            >
                              <AlertCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateApplicationStatus(app.id, 'active')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteApplication(app.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </HoverCard>
                  </Reveal>
                );
              })}
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No applications found
              </div>
            )}
          </CardContent>
        </Card>

      {/* Confirmation Dialogs */}
      {deleteApplicationDialog.application && (
        <DeleteApplicationDialog
          isOpen={deleteApplicationDialog.isOpen}
          onClose={() => setDeleteApplicationDialog({
            isOpen: false,
            application: null,
            isLoading: false
          })}
          onConfirm={confirmDeleteApplication}
          appName={deleteApplicationDialog.application.name}
          isLoading={deleteApplicationDialog.isLoading}
        />
      )}

      <DeleteAllApplicationsDialog
        isOpen={deleteAllApplicationsDialog.isOpen}
        onClose={() => setDeleteAllApplicationsDialog({
          isOpen: false,
          isLoading: false
        })}
        onConfirm={confirmDeleteAllApplications}
        appCount={applications.length}
        isLoading={deleteAllApplicationsDialog.isLoading}
      />
    </div>
  );
}
