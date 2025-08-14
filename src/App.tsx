import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { NotificationSystem } from "@/components/NotificationSystem";
import CustomerDashboard from "@/components/customer/CustomerDashboard";
import { ChefDashboard } from "@/components/chef/ChefDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { MenuManagement } from "@/components/admin/MenuManagement";
import { Analytics } from "@/components/admin/Analytics";
import { FeedbackView } from "@/components/admin/FeedbackView";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { OrderMonitoring } from "@/components/admin/OrderMonitoring";
import { Settings } from "@/components/admin/Settings";
import { PhoneLogin } from "./pages/PhoneLogin";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Layout } from "@/components/Layout";
import AdminLogin from "./pages/AdminLogin";
import TableEntry from "./pages/TableEntry";

const queryClient = new QueryClient();

const CustomerLayout = () => (
  <Layout title="Customer Portal">
    <Outlet />
  </Layout>
);

const App = () => (
  <AppProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NotificationSystem />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/entry" element={<TableEntry />} />
            <Route path="/login" element={<Layout title="Customer Login" showUserSwitch={true}><PhoneLogin /></Layout>} />

            {/* Customer Nested Routes */}
            <Route path="/customer" element={<Layout title="Customer Dashboard" showUserSwitch={true}><CustomerDashboard /></Layout>}>
              <Route index element={<CustomerDashboard activeTabProp ="menu" />} /> 
              <Route path="menu" element={<CustomerDashboard activeTabProp="menu" />} />
              <Route path="cart" element={<CustomerDashboard activeTabProp="cart" />} />
              <Route path="orders" element={<CustomerDashboard activeTabProp="orders" />} />
            </Route>

            <Route path="/chef" element={<Layout title="Kitchen Dashboard"><ChefDashboard /></Layout>} />
            <Route path="/admin-login" element={<Layout title="Admin Login" showUserSwitch={true}><AdminLogin /></Layout>} />

            {/* Admin Nested Routes */}
            <Route path="/admin" element={<Layout title="Admin Dashboard"><AdminDashboard /></Layout>}>
              <Route index element={<Navigate to="orders" />} />
              <Route path="orders" element={<OrderMonitoring />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="feedback" element={<FeedbackView />} />
              <Route path="content" element={<ContentManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AppProvider>
);

export default App;