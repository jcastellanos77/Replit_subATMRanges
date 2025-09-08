import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  UserPlus,
  ArrowLeft,
  KeyRound,
  RotateCcw 
} from "lucide-react";
import { useLocation } from "wouter";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { ResetPasswordDialog } from "@/components/ResetPasswordDialog";
import { useAuth } from "@/hooks/useAuth";

const createUserSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateUserForm = z.infer<typeof createUserSchema>;

interface AdminUser {
  id: string;
  username: string;
}

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/admin/users', userData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      await queryClient.refetchQueries({ queryKey: ['/api/admin/users'] });
      
      toast({
        title: "✅ Admin Created Successfully",
        description: "The new admin user has been added and can now access the system.",
      });
      
      setShowAddForm(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Creation Error",
        description: error.message || 'Failed to create admin user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/users/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      return { success: true };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      await queryClient.refetchQueries({ queryKey: ['/api/admin/users'] });
      
      toast({
        title: "✅ Admin Deleted Successfully",
        description: "The admin user has been removed and the list has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion Error",
        description: error.message || 'Failed to delete admin user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteUser = (user: AdminUser) => {
    if (confirm(`Are you sure you want to delete admin "${user.username}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const onSubmit = (data: CreateUserForm) => {
    const { confirmPassword, ...userData } = data;
    createUserMutation.mutate(userData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading admin users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/admin')}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin User Management</h1>
                <p className="text-gray-600">Manage administrator access to the shooting range directory</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ChangePasswordDialog>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  data-testid="button-change-my-password"
                >
                  <KeyRound className="h-4 w-4" />
                  Change My Password
                </Button>
              </ChangePasswordDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-admins">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <div className="text-xs text-muted-foreground">Current logged in admins</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Status</CardTitle>
              <Badge variant="default">Secure</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                All admin accounts protected with encrypted passwords
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Admin Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Administrator</CardTitle>
              <CardDescription>Create a new admin account to manage the shop directory</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter username" 
                              {...field} 
                              data-testid="input-username"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter password" 
                              {...field} 
                              data-testid="input-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm password" 
                              {...field} 
                              data-testid="input-confirm-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddForm(false);
                        form.reset();
                      }}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createUserMutation.isPending}
                      data-testid="button-create-admin"
                    >
                      {createUserMutation.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {createUserMutation.isPending ? 'Creating...' : 'Create Admin'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Administrator Accounts</h2>
          <Button
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
            data-testid="button-add-admin"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Admin
          </Button>
        </div>

        {/* Admin Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {user.username}
                      {currentUser?.id === user.id && (
                        <Badge variant="secondary" className="ml-2">You</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Administrator</CardDescription>
                  </div>
                  <Badge variant="default">
                    <Shield className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    Full Admin Access
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <Shield className="h-4 w-4 mr-2" />
                    Can manage shooting ranges and users
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  {currentUser?.id !== user.id && (
                    <ResetPasswordDialog userId={user.id} username={user.username}>
                      <Button
                        size="sm"
                        variant="secondary"
                        data-testid={`button-reset-password-${user.id}`}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </ResetPasswordDialog>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteUser(user)}
                    disabled={deleteUserMutation.isPending || users.length <= 1}
                    data-testid={`button-delete-user-${user.id}`}
                  >
                    {deleteUserMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {users.length <= 1 && (
                  <p className="text-xs text-gray-500 text-center">
                    Cannot delete the last admin user
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No admin users yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first admin user.</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Admin
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}