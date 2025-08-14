import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ChefHat, UtensilsCrossed, Settings } from 'lucide-react';

const Index = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch({ type: 'SET_USER_TYPE', payload: null });
  }, [dispatch]);

  if (state.userType) return null;

  // Map roles to icons from lucide-react for consistent UI icons
  const roleIcons = {
    customer: <UtensilsCrossed className="w-8 h-8 text-sage-green" />,
    chef: <ChefHat className="w-8 h-8 text-warm-orange" />,
    admin: <Settings className="w-8 h-8 text-earth-brown" />,
  };

  const selectRole = (role: 'customer' | 'chef' | 'admin') => {
    dispatch({ type: 'SET_USER_TYPE', payload: role });

    if (role === 'chef') {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      navigate('/chef');
    } else if (role === 'customer') {
      navigate('/entry');
    } else if (role === 'admin') {
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      navigate('/admin-login');
    }
  };

  return (
    <Layout title="Welcome" showUserSwitch={false}>
      <div className="flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-xl md:text-5xl mb-3 text-earth-brown">
              Welcome to {state.restaurant.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose your role to continue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(['customer', 'chef', 'admin'] as const).map((role) => (
              <button
                key={role}
                onClick={() => selectRole(role)}
                className={`group p-8 rounded-2xl shadow-md bg-white 
                  flex flex-col items-center text-center
                  transition-all duration-300 hover:scale-[1.00]`}
                type="button"
              >
                <div
                  className={`w-16 h-16 mb-5 rounded-full flex items-center justify-center
                  transition-transform duration-300 group-hover:scale-110
                  `}
                >
                  {roleIcons[role]}
                </div>
                <h2 className="text-xl font-semibold mb-1 capitalize">{role}</h2>
                <p className="text-muted-foreground text-sm">
                  {role === 'customer'
                    ? 'Browse menu & order'
                    : role === 'chef'
                    ? 'Manage kitchen orders'
                    : 'Restaurant management'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
