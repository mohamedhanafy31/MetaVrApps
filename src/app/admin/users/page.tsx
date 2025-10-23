'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DeleteUserDialog, DeleteAllUsersDialog } from '@/components/ui/confirmation-dialog';
import { 
  Plus, 
  Search, 
  UserCheck, 
  UserX, 
  Edit, 
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'moderator' | 'admin';
  company: string;
  trialLimit: number;
  trialUsed: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'user' as 'user' | 'moderator' | 'admin',
    company: '',
    trialLimit: 10
  });

  // Confirmation dialog states
  const [deleteUserDialog, setDeleteUserDialog] = useState<{
    isOpen: boolean;
    user: User | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    user: null,
    isLoading: false
  });

  const [deleteAllUsersDialog, setDeleteAllUsersDialog] = useState<{
    isOpen: boolean;
    isLoading: boolean;
  }>({
    isOpen: false,
    isLoading: false
  });

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john.doe@example.com',
        displayName: 'John Doe',
        role: 'user',
        company: 'Acme Corp',
        trialLimit: 10,
        trialUsed: 3,
        status: 'active',
        createdAt: '2024-01-15',
        lastLogin: '2024-01-20'
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        displayName: 'Jane Smith',
        role: 'moderator',
        company: 'Tech Solutions',
        trialLimit: 25,
        trialUsed: 15,
        status: 'active',
        createdAt: '2024-01-10',
        lastLogin: '2024-01-19'
      },
      {
        id: '3',
        email: 'admin@example.com',
        displayName: 'Admin User',
        role: 'admin',
        company: 'MetaVR',
        trialLimit: 100,
        trialUsed: 45,
        status: 'active',
        createdAt: '2024-01-01',
        lastLogin: '2024-01-20'
      }
    ];
    const timeoutId = setTimeout(() => {
      setUsers(mockUsers);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    if (!formData.email || !formData.displayName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: formData.email,
      displayName: formData.displayName,
      role: formData.role,
      company: formData.company,
      trialLimit: formData.trialLimit,
      trialUsed: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never'
    };

    setUsers(prev => [...prev, newUser]);
    setIsCreateDialogOpen(false);
    setFormData({
      email: '',
      displayName: '',
      role: 'user',
      company: '',
      trialLimit: 10
    });
    toast.success('User created successfully');
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      company: user.company,
      trialLimit: user.trialLimit
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setUsers(prev => prev.map(user => 
      user.id === editingUser.id 
        ? { ...user, ...formData }
        : user
    ));
    
    setIsEditDialogOpen(false);
    setEditingUser(null);
    toast.success('User updated successfully');
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setDeleteUserDialog({
        isOpen: true,
        user,
        isLoading: false
      });
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserDialog.user) return;
    
    setDeleteUserDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.filter(user => user.id !== deleteUserDialog.user!.id));
      toast.success('User deleted successfully');
      
      setDeleteUserDialog({
        isOpen: false,
        user: null,
        isLoading: false
      });
    } catch (error) {
      toast.error('Failed to delete user');
      setDeleteUserDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteAllUsers = () => {
    setDeleteAllUsersDialog({
      isOpen: true,
      isLoading: false
    });
  };

  const confirmDeleteAllUsers = async () => {
    setDeleteAllUsersDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUsers([]);
      toast.success('All users deleted successfully');
      
      setDeleteAllUsersDialog({
        isOpen: false,
        isLoading: false
      });
    } catch (error) {
      toast.error('Failed to delete all users');
      setDeleteAllUsersDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'moderator':
        return <Badge variant="warning">Moderator</Badge>;
      case 'user':
        return <Badge variant="default">User</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="destructive"
            onClick={handleDeleteAllUsers}
            className="w-full sm:w-auto min-h-[44px]"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All Users
          </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto min-h-[44px]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account with trial settings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="user@example.com"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={formData.role} onValueChange={(value: string) => setFormData(prev => ({ ...prev, role: value as 'user' | 'moderator' | 'admin' }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Acme Corp"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trialLimit">Trial Limit</Label>
                    <Input
                      id="trialLimit"
                      type="number"
                      value={formData.trialLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, trialLimit: parseInt(e.target.value) || 10 }))}
                      placeholder="10"
                      className="w-full md:w-1/2"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} className="w-full sm:w-auto">
                      Create User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts and their trial settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 min-h-[44px] text-base"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] min-h-[44px] text-base" id="users-role-filter">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] min-h-[44px] text-base" id="users-status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users List - Responsive */}
          </CardContent>
        </Card>

        {/* Users List - Responsive */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Manage user accounts and their trial settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Card View */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{user.displayName}</CardTitle>
                          <div className="text-xs space-y-1">
                            <div className="truncate">{user.email}</div>
                            <div className="text-muted-foreground truncate">{user.company}</div>
                          </div>
                      </div>
                      <Badge className={`flex-shrink-0 ${user.status === 'active' ? 'bg-green-100 text-green-800' : user.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status === 'active' ? (
                          <UserCheck className="w-3 h-3 mr-1" />
                        ) : (
                          <UserX className="w-3 h-3 mr-1" />
                        )}
                        {user.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(user.role)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Trial Usage</span>
                        <span>{user.trialUsed} / {user.trialLimit}</span>
                      </div>
                      <Progress value={(user.trialUsed / user.trialLimit) * 100} className="h-2" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        <div className="truncate">Company: {user.company}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="truncate">Last Login: {user.lastLogin}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 gap-2">
                      <div className="flex space-x-1 flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                          className="flex-1 min-w-0"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(user.id)}
                          className="flex-1 min-w-0"
                        >
                          {user.status === 'active' ? (
                            <UserX className="w-4 h-4 mr-1" />
                          ) : (
                            <UserCheck className="w-4 h-4 mr-1" />
                          )}
                          <span className="hidden sm:inline">{user.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                          <CardTitle className="text-lg">{user.displayName}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <span>{user.email}</span>
                            <span>•</span>
                            <span className="text-muted-foreground">{user.company}</span>
                          </CardDescription>
                        </div>
                      <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : user.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}>
                        {user.status === 'active' ? (
                          <UserCheck className="w-3 h-3 mr-1" />
                        ) : (
                          <UserX className="w-3 h-3 mr-1" />
                        )}
                        {user.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(user.role)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Trial Usage</span>
                        <span>{user.trialUsed} / {user.trialLimit}</span>
                      </div>
                      <Progress value={(user.trialUsed / user.trialLimit) * 100} className="h-2" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        <div className="truncate">Company: {user.company}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="truncate">Last Login: {user.lastLogin}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 gap-2">
                      <div className="flex space-x-1 flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                          className="flex-1 min-w-0"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(user.id)}
                          className="flex-1 min-w-0"
                        >
                          {user.status === 'active' ? (
                            <UserX className="w-4 h-4 mr-1" />
                          ) : (
                            <UserCheck className="w-4 h-4 mr-1" />
                          )}
                          <span className="hidden sm:inline">{user.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </CardContent>
        </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user account information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input
                id="edit-displayName"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value: string) => setFormData(prev => ({ ...prev, role: value as 'user' | 'moderator' | 'admin' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-trialLimit">Trial Limit</Label>
              <Input
                id="edit-trialLimit"
                type="number"
                value={formData.trialLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, trialLimit: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>
                Update User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      {deleteUserDialog.user && (
        <DeleteUserDialog
          isOpen={deleteUserDialog.isOpen}
          onClose={() => setDeleteUserDialog({
            isOpen: false,
            user: null,
            isLoading: false
          })}
          onConfirm={confirmDeleteUser}
          userName={deleteUserDialog.user.displayName}
          userEmail={deleteUserDialog.user.email}
          isLoading={deleteUserDialog.isLoading}
        />
      )}

      <DeleteAllUsersDialog
        isOpen={deleteAllUsersDialog.isOpen}
        onClose={() => setDeleteAllUsersDialog({
          isOpen: false,
          isLoading: false
        })}
        onConfirm={confirmDeleteAllUsers}
        userCount={users.length}
        isLoading={deleteAllUsersDialog.isLoading}
      />
    </div>
  );
}