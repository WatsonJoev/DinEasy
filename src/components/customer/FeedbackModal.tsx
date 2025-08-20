import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

interface FeedbackModalProps {
  open: boolean;
  onClose: (skipped: boolean) => void;
  orderId: string;
}

export function FeedbackModal({ open, onClose, orderId }: FeedbackModalProps) {
  const { dispatch } = useApp();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast({
        title: "Please provide a rating",
        description: "Please select at least 1 star",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Attempting to submit feedback...",
      description: "Dispatching ADD_FEEDBACK action.",
    });

    dispatch({
      type: 'ADD_FEEDBACK',
      payload: { orderId, rating, comment }
    });

    setTimeout(() => {
      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback helps us improve our service"
      });

      setRating(0);
      setComment('');
      onClose(false);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        toast({
          title: "Feedback Modal Closed",
          description: "onOpenChange triggered with false. Calling onClose(true).",
        });
        onClose(true);
      }
    }}>
      <DialogContent className="max-w-xs sm:max-w-md p-4">
        <DialogHeader>
          <DialogTitle className="text-lg text-center">Share Your Experience</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="font-semibold mb-3 text-base">How was your dining experience?</h4>
            
            <div className="flex justify-center gap-1.5 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-colors"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground">
              {rating === 0 && 'Click to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Comments (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  title: "Thank you!",
                  description: "We hope to see you again soon!",
                });
                onClose(true);
              }}
              className="flex-1 h-9 text-sm"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              className="flex-1 bg-sage-green hover:bg-sage-green/90 text-earth-brown h-9 text-sm"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
