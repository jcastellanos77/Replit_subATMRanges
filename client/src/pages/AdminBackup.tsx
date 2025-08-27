import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  ArrowLeft,
  Download,
  Database,
  Images,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  HardDrive 
} from "lucide-react";

interface BackupStats {
  totalShops: number;
  imagesWithLogos: number;
  imagesWithMaps: number;
  estimatedSize: string;
}

export default function AdminBackup() {
  const [, setLocation] = useLocation();
  const [backupInProgress, setBackupInProgress] = useState<'full' | 'data' | null>(null);
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<BackupStats>({
    queryKey: ['/api/admin/backup/stats'],
  });

  const createFullBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/backup/full', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }
      
      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atm-tiendas-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onMutate: () => {
      setBackupInProgress('full');
    },
    onSuccess: () => {
      toast({
        title: "✅ Full Backup Created",
        description: "Complete backup with all shop data and images has been downloaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Backup Failed",
        description: error.message || "Failed to create full backup",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setBackupInProgress(null);
    },
  });

  const createDataBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/backup/data', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create data backup');
      }
      
      // Handle JSON download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atm-tiendas-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onMutate: () => {
      setBackupInProgress('data');
    },
    onSuccess: () => {
      toast({
        title: "✅ Data Backup Created",
        description: "Shop data has been exported to JSON format and downloaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Backup Failed",
        description: error.message || "Failed to create data backup",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setBackupInProgress(null);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading backup information...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Shop Data Backup</h1>
                <p className="text-gray-600">Export your shop directory data and images</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Backup Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-shops">
                {stats?.totalShops || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Logo Images</CardTitle>
              <Images className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-logo-images">
                {stats?.imagesWithLogos || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Map Images</CardTitle>
              <Images className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-map-images">
                {stats?.imagesWithMaps || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Size</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-estimated-size">
                {stats?.estimatedSize || "0KB"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backup Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Full Backup */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-blue-900">Complete Backup</CardTitle>
                </div>
                <Badge variant="default">Recommended</Badge>
              </div>
              <CardDescription className="text-blue-700">
                Downloads all shop data and images in a ZIP file. Perfect for quarterly backups.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete shop database (JSON format)
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  All logo images ({stats?.imagesWithLogos || 0} files)
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  All map images ({stats?.imagesWithMaps || 0} files)
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Organized folder structure
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Restoration instructions
                </div>
              </div>
              
              <Button
                onClick={() => createFullBackupMutation.mutate()}
                disabled={backupInProgress !== null}
                className="w-full"
                data-testid="button-full-backup"
              >
                {backupInProgress === 'full' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating ZIP...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Complete Backup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Data Only Backup */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <CardTitle>Data Only Backup</CardTitle>
              </div>
              <CardDescription>
                Downloads only the shop data as JSON. Smaller file size, no images included.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete shop database (JSON format)
                </div>
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  No logo images included
                </div>
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  No map images included
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Small file size
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Easy to import/process
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => createDataBackupMutation.mutate()}
                disabled={backupInProgress !== null}
                className="w-full"
                data-testid="button-data-backup"
              >
                {backupInProgress === 'data' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Creating JSON...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Data Only
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <CardTitle>Backup Best Practices</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended Schedule:</strong> Create a complete backup every 3 months or before major changes.
                Store backups in multiple locations (cloud storage, external drives) for maximum safety.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p><strong>What's included in backups:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Complete shop information (names, addresses, contacts, categories)</li>
                <li>Geographic data (coordinates, map links)</li>
                <li>Verification status and metadata</li>
                <li>Logo images (when available, excludes FontAwesome icons)</li>
                <li>Map images from all shops</li>
                <li>Backup metadata and restoration instructions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}