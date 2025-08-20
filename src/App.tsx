import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { AppProvider } from "@/contexts/AppContext";
import { NotificationSystem } from "@/components/NotificationSystem";
import { CustomerDashboard } from "@/components/customer/CustomerDashboard";
import { ChefDashboard } from "@/components/chef/ChefDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { MenuManagement } from "@/components/admin/MenuManagement";
import { Analytics } from "@/components/admin/Analytics";
import { FeedbackView } from "@/components/admin/FeedbackView";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { OrderMonitoring } from "@/components/admin/OrderMonitoring";
import { Settings } from "@/components/admin/Settings";

import { PhoneLogin } from "./pages/PhoneLogin";
import QRScanner from "./pages/QRScanner"; 
import NotFound from "./pages/NotFound";
import { Layout } from "@/components/Layout";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

const CustomerLayout = () => (
  <Layout title="Customer Portal">
    <Outlet />
  </Layout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <NotificationSystem />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <Layout title="Customer Login" showUserSwitch={true}>
                  <PhoneLogin />
                </Layout>
              }
            />
            <Route
              path="/admin-login"
              element={
                <Layout title="Admin Login" showUserSwitch={true}>
                  <AdminLogin />
                </Layout>
              }
            />

            {/* Customer Routes */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index element={<CustomerDashboard activeTab="menu" />} />
              <Route path="menu" element={<CustomerDashboard activeTab="menu" />} />
              <Route path="cart" element={<CustomerDashboard activeTab="cart" />} />
              <Route path="orders" element={<CustomerDashboard activeTab="orders" />} />
              <Route path="orders/:orderId" element={<CustomerDashboard activeTab="orders" />} />
            </Route>

            {/* Chef Route */}
            <Route
              path="/chef"
              element={
                <Layout title="Kitchen Dashboard">
                  <ChefDashboard />
                </Layout>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <Layout title="Admin Dashboard">
                  <AdminDashboard />
                </Layout>
              }
            >
              <Route path="orders" element={<OrderMonitoring />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="feedback" element={<FeedbackView />} />
              <Route path="content" element={<ContentManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;