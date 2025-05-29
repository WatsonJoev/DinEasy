
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { CustomerDashboard } from '@/components/customer/CustomerDashboard';
import { ChefDashboard } from '@/components/chef/ChefDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { state, dispatch } = useApp();
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });

  // Home page - user type selection
  if (!state.userType) {
    return (
      <Layout title="Welcome" showUserSwitch={false}>
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">
                Welcome to {state.restaurant.name}
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                Choose your role to continue
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => {
                    dispatch({ type: 'SET_USER_TYPE', payload: 'customer' });
                    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
                  }}
                  className="h-24 flex flex-col gap-2 bg-sage-green hover:bg-sage-green/90 text-earth-brown"
                  size="lg"
                >
                  <span className="text-2xl">🍽️</span>
                  <span>Customer</span>
                </Button>
                
                <Button
                  onClick={() => {
                    dispatch({ type: 'SET_USER_TYPE', payload: 'chef' });
                    dispatch({ type: 'SET_AUTHENTICATED', payload: true });
                  }}
                  className="h-24 flex flex-col gap-2 bg-warm-orange hover:bg-warm-orange/90 text-earth-brown"
                  size="lg"
                >
                  <span className="text-2xl">👨‍🍳</span>
                  <span>Chef</span>
                </Button>
                
                <Button
                  onClick={() => {
                    dispatch({ type: 'SET_USER_TYPE', payload: 'admin' });
                    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
                  }}
                  className="h-24 flex flex-col gap-2 bg-earth-brown hover:bg-earth-brown/90"
                  size="lg"
                >
                  <span className="text-2xl">⚙️</span>
                  <span>Admin</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Customer interface
  if (state.userType === 'customer') {
    return (
      <Layout title="Customer Portal">
        <CustomerDashboard />
      </Layout>
    );
  }

  // Chef interface
  if (state.userType === 'chef') {
    return (
      <Layout title="Kitchen Dashboard">
        <ChefDashboard />
      </Layout>
    );
  }

  // Admin interface - with authentication
  if (state.userType === 'admin') {
    if (!state.isAuthenticated) {
      const handleAdminLogin = () => {
        // Static authentication check
        if (adminCredentials.username === 'admin' && adminCredentials.password === 'password') {
          dispatch({ type: 'SET_AUTHENTICATED', payload: true });
          toast({
            title: "Welcome Admin!",
            description: "Successfully logged into admin dashboard"
          });
        } else {
          toast({
            title: "Invalid credentials",
            description: "Please check your username and password",
            variant: "destructive"
          });
        }
      };

      return (
        <Layout title="Admin Login" showUserSwitch={true}>
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Demo credentials: admin / password
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials({
                      ...adminCredentials,
                      username: e.target.value
                    })}
                    placeholder="Enter username"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials({
                      ...adminCredentials,
                      password: e.target.value
                    })}
                    placeholder="Enter password"
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  />
                </div>
                
                <Button onClick={handleAdminLogin} className="w-full">
                  Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </Layout>
      );
    }

    return (
      <Layout title="Admin Dashboard">
        <AdminDashboard />
      </Layout>
    );
  }

  return null;
};

export default Index;
