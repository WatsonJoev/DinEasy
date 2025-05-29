
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { CustomerDashboard } from '@/components/customer/CustomerDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { state, dispatch } = useApp();

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
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Chef Dashboard</h2>
          <p className="text-muted-foreground">Chef interface coming soon...</p>
        </div>
      </Layout>
    );
  }

  // Admin interface
  if (state.userType === 'admin') {
    return (
      <Layout title="Admin Dashboard">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
          <p className="text-muted-foreground">Admin interface coming soon...</p>
        </div>
      </Layout>
    );
  }

  return null;
};

export default Index;
