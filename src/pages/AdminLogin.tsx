import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const { dispatch } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter both username and password.',
        variant: 'destructive',
      });
      return;
    }

    if (username === 'admin' && password === 'admin123') {
      dispatch({ type: 'SET_USER_TYPE', payload: 'admin' });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      toast({
        title: 'Login Successful',
        description: 'Welcome to the admin dashboard!',
      });
      navigate('/admin'); // Navigate to /admin as per your request
    } else {
      toast({
        title: 'Invalid Credentials',
        description: 'Please check your username and password.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your username and password to log in as admin.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        
          <Button onClick={handleAdminLogin} className="w-full">
            Login as Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
