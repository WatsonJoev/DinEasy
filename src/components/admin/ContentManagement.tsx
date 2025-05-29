
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

export function ContentManagement() {
  const { state, dispatch } = useApp();
  const [newDish, setNewDish] = useState('');
  const [newVideoId, setNewVideoId] = useState('');

  const handleAddDish = () => {
    if (!newDish.trim()) {
      toast({
        title: "Empty dish name",
        description: "Please enter a dish name",
        variant: "destructive"
      });
      return;
    }

    // In a real app, you'd dispatch an action to update top dishes
    toast({
      title: "Top dish added",
      description: `${newDish} has been added to top dishes`
    });
    setNewDish('');
  };

  const handleAddVideo = () => {
    if (!newVideoId.trim()) {
      toast({
        title: "Empty video ID",
        description: "Please enter a YouTube video ID",
        variant: "destructive"
      });
      return;
    }

    // In a real app, you'd dispatch an action to update video list
    toast({
      title: "Video added",
      description: "New customer feedback video has been added"
    });
    setNewVideoId('');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Content Management</h3>
      
      {/* Top Dishes Management */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Delicious Food</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter dish name"
              value={newDish}
              onChange={(e) => setNewDish(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddDish}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            {state.topDishes.map((dish, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">#{index + 1}</span>
                  <span>{dish}</span>
                </div>
                <Button size="sm" variant="ghost">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* YouTube Videos Management */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Feedback Videos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter YouTube video ID"
              value={newVideoId}
              onChange={(e) => setNewVideoId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddVideo}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="space-y-2">
            {state.youtubeVideos.map((videoId, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{videoId}</span>
                  <a 
                    href={`https://youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Video
                  </a>
                </div>
                <Button size="sm" variant="ghost">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="restaurantName">Restaurant Name</Label>
            <Input
              id="restaurantName"
              defaultValue={state.restaurant.name}
              placeholder="Enter restaurant name"
            />
          </div>
          
          <div>
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Textarea
              id="welcomeMessage"
              placeholder="Enter welcome message for customers"
              rows={3}
            />
          </div>
          
          <Button className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
