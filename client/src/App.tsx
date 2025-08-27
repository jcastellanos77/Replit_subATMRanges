import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import ShopsPage from "@/pages/shops";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminShopNew from "@/pages/AdminShopNew";
import AdminShopEdit from "@/pages/AdminShopEdit";
import AdminUsers from "@/pages/AdminUsers";
import AdminBackup from "@/pages/AdminBackup";
import NotFound from "@/pages/not-found";

function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <AdminLogin />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={ShopsPage} />
      <Route path="/shops" component={ShopsPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={() => <ProtectedAdminRoute component={AdminDashboard} />} />
      <Route path="/admin/shops/new" component={() => <ProtectedAdminRoute component={AdminShopNew} />} />
      <Route path="/admin/shops/edit/:id" component={() => <ProtectedAdminRoute component={AdminShopEdit} />} />
      <Route path="/admin/users" component={() => <ProtectedAdminRoute component={AdminUsers} />} />
      <Route path="/admin/backup" component={() => <ProtectedAdminRoute component={AdminBackup} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Router />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
