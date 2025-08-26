import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login, createAdmin, isLoginPending, isCreateAdminPending, loginError, createAdminError } = useAuth();
  const { toast } = useToast();
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showCreateAdmin) {
      createAdmin(credentials, {
        onSuccess: () => {
          toast({
            title: 'Admin Created',
            description: 'Admin user created successfully. You can now login.',
          });
          setShowCreateAdmin(false);
          setCredentials({ username: '', password: '' });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message || 'Failed to create admin user',
            variant: 'destructive',
          });
        },
      });
    } else {
      login(credentials, {
        onSuccess: () => {
          toast({
            title: 'Login Successful',
            description: 'Welcome to ATM Admin Panel!',
          });
          setLocation('/admin');
        },
        onError: (error) => {
          toast({
            title: 'Login Failed',
            description: error.message || 'Invalid credentials',
            variant: 'destructive',
          });
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {showCreateAdmin ? 'Create Admin User' : 'ATM Admin Login'}
          </CardTitle>
          <CardDescription className="text-center">
            {showCreateAdmin 
              ? 'Create the first administrator account'
              : 'Enter your credentials to access the admin panel'
            }
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(loginError || createAdminError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {showCreateAdmin ? createAdminError?.message : loginError?.message}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                required
                data-testid="input-username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
                data-testid="input-password"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoginPending || isCreateAdminPending}
              data-testid={showCreateAdmin ? "button-create-admin" : "button-login"}
            >
              {(showCreateAdmin ? isCreateAdminPending : isLoginPending) 
                ? 'Processing...' 
                : showCreateAdmin ? 'Create Admin' : 'Login'
              }
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreateAdmin(!showCreateAdmin);
                setCredentials({ username: '', password: '' });
              }}
              className="w-full"
              data-testid="button-toggle-mode"
            >
              {showCreateAdmin ? 'Already have an account? Login' : 'Create Admin Account'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}