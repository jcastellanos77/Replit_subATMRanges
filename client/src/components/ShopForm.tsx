import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { insertShopSchema, type InsertShop } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { ArrowLeft, Upload, X } from 'lucide-react';

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
  logoUrl: string;
  mapImageUrl: string;
  googleMapsUrl: string;
  isVerified: string;
};

type ShopFormProps = {
  shop?: Shop;
  onSuccess?: () => void;
};

const availableCategories = [
  'Armería',
  'Accesorios',
  'Municiones',
  'Capacitación',
  'Mantenimiento',
  'Seguridad',
  'Caza',
  'Deportivo',
  'Coleccionismo'
];

export default function ShopForm({ shop, onSuccess }: ShopFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(shop?.categories || []);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [mapFile, setMapFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<InsertShop>({
    resolver: zodResolver(insertShopSchema),
    defaultValues: {
      name: shop?.name || '',
      description: shop?.description || '',
      address: shop?.address || '',
      city: shop?.city || '',
      state: shop?.state || '',
      phone: shop?.phone || '',
      email: shop?.email || '',
      website: shop?.website || '',
      categories: shop?.categories || [],
      logo: shop?.logoUrl || 'https://via.placeholder.com/200x100?text=Logo',
      mapImageUrl: shop?.mapImageUrl || 'https://via.placeholder.com/400x300?text=Map',
      googleMapsUrl: shop?.googleMapsUrl || '',
      isVerified: shop?.isVerified || 'false',
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertShop) => {
      if (shop?.id) {
        // Update existing shop
        const response = await apiRequest('PUT', `/api/admin/shops/${shop.id}`, data);
        return response.json();
      } else {
        // Create new shop
        const response = await apiRequest('POST', `/api/admin/shops`, data);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shops'] });
      toast({
        title: shop?.id ? 'Shooting Range Updated' : 'Shooting Range Created',
        description: `Shooting range has been successfully ${shop?.id ? 'updated' : 'created'}.`,
      });
      onSuccess?.();
      setLocation('/admin');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${shop?.id ? 'update' : 'create'} shooting range`,
        variant: 'destructive',
      });
    },
  });

  const handleCategoryChange = (category: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category);

    setSelectedCategories(updatedCategories);
    form.setValue('categories', updatedCategories);
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'map') => {
    try {
      setIsUploading(true);

      // Get upload URL
      const uploadResponse = await apiRequest('POST', '/api/admin/upload', { type });
      const { uploadURL } = await uploadResponse.json();

      // Upload file to storage
      const fileResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!fileResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Get the object path from the upload URL
      const objectPath = uploadURL.split('?')[0].replace('https://storage.googleapis.com', '');
      const imageUrl = `/objects${objectPath}`;

      // Update form
      if (type === 'logo') {
        form.setValue('logo', imageUrl);
        setLogoFile(file);
      } else {
        form.setValue('mapImageUrl', imageUrl);
        setMapFile(file);
      }

      toast({
        title: 'Upload Successful',
        description: `${type === 'logo' ? 'Logo' : 'Map'} uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: `Failed to upload ${type}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: any) => {
    data.categories = selectedCategories;
    saveMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/admin')}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-gray-900">
            {shop?.id ? 'Edit Shooting Range' : 'Add New Shooting Range'}
          </h1>
          <p className="text-gray-600">
            {shop?.id ? 'Update shooting range information' : 'Enter shooting range details to add to the directory'}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic shooting range details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Shooting Range Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter shooting range name"
                    {...form.register('name')}
                    data-testid="input-name"
                  />
                  {form.formState.errors.name && (
                    <Alert variant="destructive">
                      <AlertDescription>{form.formState.errors.name.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="shop@example.com"
                    {...form.register('email')}
                    data-testid="input-email"
                  />
                  {form.formState.errors.email && (
                    <Alert variant="destructive">
                      <AlertDescription>{form.formState.errors.email.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    placeholder="+52 55 1234 5678"
                    {...form.register('phone')}
                    data-testid="input-phone"
                  />
                  {form.formState.errors.phone && (
                    <Alert variant="destructive">
                      <AlertDescription>{form.formState.errors.phone.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    {...form.register('website')}
                    data-testid="input-website"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the shooting range and its services"
                  className="min-h-[100px]"
                  {...form.register('description')}
                  data-testid="input-description"
                />
                {form.formState.errors.description && (
                  <Alert variant="destructive">
                    <AlertDescription>{form.formState.errors.description.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Shooting range address and location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  {...form.register('address')}
                  data-testid="input-address"
                />
                {form.formState.errors.address && (
                  <Alert variant="destructive">
                    <AlertDescription>{form.formState.errors.address.message}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="City name"
                    {...form.register('city')}
                    data-testid="input-city"
                  />
                  {form.formState.errors.city && (
                    <Alert variant="destructive">
                      <AlertDescription>{form.formState.errors.city.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="State name"
                    {...form.register('state')}
                    data-testid="input-state"
                  />
                  {form.formState.errors.state && (
                    <Alert variant="destructive">
                      <AlertDescription>{form.formState.errors.state.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleMapsUrl">Google Maps URL *</Label>
                <Input
                  id="googleMapsUrl"
                  placeholder="https://maps.google.com/..."
                  {...form.register('googleMapsUrl')}
                  data-testid="input-google-maps"
                />
                {form.formState.errors.googleMapsUrl && (
                  <Alert variant="destructive">
                    <AlertDescription>{form.formState.errors.googleMapsUrl.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Select all applicable categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, !!checked)}
                      data-testid={`checkbox-${category.toLowerCase()}`}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <Alert className="mt-4">
                  <AlertDescription>Please select at least one category</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Upload logo and map images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Shooting Range Logo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {logoFile ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(logoFile)}
                          alt="Logo preview"
                          className="mx-auto h-20 w-auto object-contain"
                        />
                        <p className="text-sm text-gray-500">{logoFile.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLogoFile(null)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isUploading}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleFileUpload(file, 'logo');
                              };
                              input.click();
                            }}
                            data-testid="button-upload-logo"
                          >
                            {isUploading ? 'Uploading...' : 'Upload Logo'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Shooting Range Map/Photo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {mapFile ? (
                      <div className="space-y-2">
                        <img
                          src={URL.createObjectURL(mapFile)}
                          alt="Map preview"
                          className="mx-auto h-20 w-auto object-contain"
                        />
                        <p className="text-sm text-gray-500">{mapFile.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setMapFile(null)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isUploading}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleFileUpload(file, 'map');
                              };
                              input.click();
                            }}
                            data-testid="button-upload-map"
                          >
                            {isUploading ? 'Uploading...' : 'Upload Map'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
              <CardDescription>Shooting range verification status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVerified"
                  checked={form.watch('isVerified') === 'true'}
                  onCheckedChange={(checked) => form.setValue('isVerified', checked ? 'true' : 'false')}
                  data-testid="checkbox-verified"
                />
                <Label
                  htmlFor="isVerified"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mark as verified shooting range
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/admin')}
              data-testid="button-cancel"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saveMutation.isPending || selectedCategories.length === 0}
              data-testid="button-save"
            >
              {saveMutation.isPending
                ? 'Saving...'
                : shop?.id ? 'Update Shooting Range' : 'Create Shooting Range'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}