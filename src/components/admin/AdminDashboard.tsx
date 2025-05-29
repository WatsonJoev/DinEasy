
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { MenuManagement } from './MenuManagement';
import { Analytics } from './Analytics';
import { FeedbackView } from './FeedbackView';
import { ContentManagement } from './ContentManagement';
import { OrderMonitoring } from './OrderMonitoring';

export function AdminDashboard() {
  const { state } = useApp();

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-sage-green">Menu Items</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-sage-green">{state.menuItems.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-warm-orange">Active Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-warm-orange">
              {state.orders.filter(o => o.status !== 'completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-earth-brown">Daily Sales</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-earth-brown">
              ${state.analytics.dailySales.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-soft-red">Feedback Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-soft-red">4.5</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="orders">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrderMonitoring />
        </TabsContent>

        <TabsContent value="menu">
          <MenuManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackView />
        </TabsContent>

        <TabsContent value="content">
          <ContentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
