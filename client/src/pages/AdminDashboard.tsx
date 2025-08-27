import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  LogOut,
  Shield,
  Users,
  Download 
} from 'lucide-react';

type Shop = {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website?: string;
  categories: string[];
  mapImageUrl: string;
  googleMapsUrl: string;
  isVerified?: string;
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shops = [], isLoading } = useQuery<Shop[]>({
    queryKey: ['/api/shops'],
  });

  const deleteShopMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/shops/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete shop');
      }
      return { success: true };
    },
    onSuccess: async () => {
      // Force immediate refresh of the shop list
      await queryClient.invalidateQueries({ queryKey: ['/api/shops'] });
      await queryClient.refetchQueries({ queryKey: ['/api/shops'] });
      
      toast({
        title: '✅ Shop Deleted Successfully',
        description: 'The shop has been removed and the list has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Deletion Error',
        description: error.message || 'Failed to delete shop. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        setLocation('/admin/login');
        toast({
          title: 'Logged Out',
          description: 'You have been successfully logged out.',
        });
      },
    });
  };

  const handleDeleteShop = (shop: Shop) => {
    if (confirm(`Are you sure you want to delete "${shop.name}"? This action cannot be undone.`)) {
      deleteShopMutation.mutate(shop.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">ATM Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-shops">{shops.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Shops</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-verified-shops">
                {shops.filter(shop => shop.isVerified === 'true').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Badge variant="secondary">{new Set(shops.flatMap(s => s.categories)).size}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {Array.from(new Set(shops.flatMap(s => s.categories))).slice(0, 3).join(', ')}
                {new Set(shops.flatMap(s => s.categories)).size > 3 && '...'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shop Management</h2>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setLocation('/admin/backup')}
              data-testid="button-backup"
            >
              <Download className="h-4 w-4 mr-2" />
              Backup Data
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/admin/users')}
              data-testid="button-manage-admins"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Admins
            </Button>
            <Button
              onClick={() => setLocation('/admin/shops/new')}
              data-testid="button-add-shop"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Shop
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{shop.name}</CardTitle>
                    <CardDescription>{shop.city}, {shop.state}</CardDescription>
                  </div>
                  {shop.isVerified === 'true' && (
                    <Badge variant="default">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{shop.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {shop.address}
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <Phone className="h-4 w-4 mr-2" />
                    {shop.phone}
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <Mail className="h-4 w-4 mr-2" />
                    {shop.email}
                  </div>
                  
                  {shop.website && (
                    <div className="flex items-center text-gray-500">
                      <Globe className="h-4 w-4 mr-2" />
                      {shop.website}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {shop.categories.map((category) => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLocation(`/admin/shops/edit/${shop.id}`)}
                    data-testid={`button-edit-${shop.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteShop(shop)}
                    disabled={deleteShopMutation.isPending}
                    data-testid={`button-delete-${shop.id}`}
                  >
                    {deleteShopMutation.isPending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {shops.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No shops yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first shop to the directory.</p>
              <Button onClick={() => setLocation('/admin/shops/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Shop
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}