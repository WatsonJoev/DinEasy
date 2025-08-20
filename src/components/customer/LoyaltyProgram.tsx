
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Gift, Star, Crown, Zap } from 'lucide-react';

export function LoyaltyProgram() {
  const { state, dispatch } = useApp();
  const [selectedReward, setSelectedReward] = useState<any>(null);

  const customerLoyalty = state.customerLoyalty || {
    points: 0,
    tier: 'Bronze',
    totalSpent: 0,
    rewardsRedeemed: 0
  };

  const rewards = [
    { id: 1, name: '10% Off Next Order', points: 100, type: 'discount', value: 10 },
    { id: 2, name: 'Free Appetizer', points: 150, type: 'item', value: 'appetizer' },
    { id: 3, name: 'Free Dessert', points: 200, type: 'item', value: 'dessert' },
    { id: 4, name: '20% Off Next Order', points: 300, type: 'discount', value: 20 },
    { id: 5, name: 'Free Main Course', points: 500, type: 'item', value: 'main' },
    { id: 6, name: 'Complimentary Meal for 2', points: 1000, type: 'special', value: 'meal_for_2' }
  ];

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'Bronze':
        return { color: 'bg-amber-600', icon: Star, nextTier: 'Silver', pointsNeeded: 500 };
      case 'Silver':
        return { color: 'bg-gray-400', icon: Crown, nextTier: 'Gold', pointsNeeded: 1000 };
      case 'Gold':
        return { color: 'bg-yellow-500', icon: Crown, nextTier: 'Platinum', pointsNeeded: 2000 };
      case 'Platinum':
        return { color: 'bg-purple-600', icon: Zap, nextTier: null, pointsNeeded: null };
      default:
        return { color: 'bg-amber-600', icon: Star, nextTier: 'Silver', pointsNeeded: 500 };
    }
  };

  const tierInfo = getTierInfo(customerLoyalty.tier);
  const progressToNextTier = tierInfo.pointsNeeded 
    ? (customerLoyalty.points / tierInfo.pointsNeeded) * 100 
    : 100;

  const handleRedeemReward = (reward: any) => {
    if (customerLoyalty.points >= reward.points) {
      dispatch({
        type: 'REDEEM_LOYALTY_REWARD',
        payload: {
          rewardId: reward.id,
          pointsUsed: reward.points
        }
      });

      toast({
        title: "Reward Redeemed!",
        description: `You've redeemed ${reward.name}. Check your cart for the discount.`
      });

      setSelectedReward(null);
    } else {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.points - customerLoyalty.points} more points to redeem this reward.`,
        variant: "destructive"
      });
    }
  };

  const tierMultiplier = {
    'Bronze': 1,
    'Silver': 1.2,
    'Gold': 1.5,
    'Platinum': 2
  }[customerLoyalty.tier] || 1;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-pumpkin/10 to-sunglow/10 border-pumpkin/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <tierInfo.icon className={`w-6 h-6 text-white p-1 rounded ${tierInfo.color}`} />
            Loyalty Program - {customerLoyalty.tier} Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Your Points:</span>
              <Badge variant="outline" className="text-lg px-3 py-1 bg-pumpkin text-white">
                {customerLoyalty.points} pts
              </Badge>
            </div>
            
            {tierInfo.nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to {tierInfo.nextTier}:</span>
                  <span>{customerLoyalty.points}/{tierInfo.pointsNeeded} pts</span>
                </div>
                <Progress value={progressToNextTier} className="w-full" />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Spent:</span>
                <div className="font-semibold">{state.restaurant.currency}{customerLoyalty.totalSpent.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Points Multiplier:</span>
                <div className="font-semibold">{tierMultiplier}x</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <Card 
                key={reward.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  customerLoyalty.points >= reward.points 
                    ? 'border-pumpkin/50 hover:border-pumpkin' 
                    : 'opacity-60'
                }`}
                onClick={() => setSelectedReward(reward)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{reward.name}</h4>
                    <Badge 
                      variant={customerLoyalty.points >= reward.points ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {reward.points} pts
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={customerLoyalty.points < reward.points}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRedeemReward(reward);
                    }}
                  >
                    {customerLoyalty.points >= reward.points ? 'Redeem' : 'Not Enough Points'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Every {state.restaurant.currency}1 spent:</span>
              <span className="font-semibold">{tierMultiplier} point(s)</span>
            </div>
            <div className="flex justify-between">
              <span>Write a review:</span>
              <span className="font-semibold">50 points</span>
            </div>
            <div className="flex justify-between">
              <span>Refer a friend:</span>
              <span className="font-semibold">100 points</span>
            </div>
            <div className="flex justify-between">
              <span>Birthday bonus:</span>
              <span className="font-semibold">200 points</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
