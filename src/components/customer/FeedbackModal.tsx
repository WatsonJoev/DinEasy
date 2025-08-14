import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}

export function FeedbackModal({ open, onOpenChange, orderId }: FeedbackModalProps) {
  const { dispatch } = useApp();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const navigate = useNavigate();

  const handleFeedbackCompletion = () => {
    dispatch({ type: 'CLEAR_ALL_ORDERS' });
    navigate('/'); // Navigate to home page
    onOpenChange(false); // Close the modal
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast({
        title: "Please provide a rating",
        description: "Please select at least 1 star",
        variant: "destructive"
      });
      return;
    }

    dispatch({
      type: 'ADD_FEEDBACK',
      payload: { orderId, rating, comment }
    });

    toast({
      title: "Thank you for your feedback!",
      description: "Your feedback helps us improve our service"
    });

    setRating(0);
    setComment('');
    handleFeedbackCompletion();
  };

  const handleSkip = () => {
    handleFeedbackCompletion();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Experience</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <h4 className="font-semibold mb-4">How was your dining experience?</h4>

            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              {rating === 0 && 'Click to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Comments (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              className="flex-1 bg-sage-green hover:bg-sage-green/90 text-earth-brown"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
