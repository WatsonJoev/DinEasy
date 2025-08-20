import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Banknote, QrCode, Download, Mail, Star } from 'lucide-react';

interface EnhancedPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onPaymentComplete?: (orderId: string) => void;
}

export function EnhancedPaymentModal({ open, onOpenChange, order, onPaymentComplete }: EnhancedPaymentModalProps) {
  const { state, dispatch } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | null>(null);
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [tipPercentage, setTipPercentage] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [serviceRating, setServiceRating] = useState(5);

  const subtotal = order.total;
  const tax = subtotal * (state.restaurant.taxRate / 100);
  const tipAmount = tipPercentage > 0 ? subtotal * (tipPercentage / 100) : parseFloat(customTip) || 0;
  const finalTotal = subtotal + tax + tipAmount;

  const handleTipSelect = (percentage: number) => {
    setTipPercentage(percentage);
    setCustomTip('');
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    setTipPercentage(0);
  };

  const handlePaymentMethodSelect = (method: 'cash' | 'upi') => {
    setPaymentMethod(method);
    
    if (method === 'upi') {
      setShowUpiQr(true);
      toast({
        title: "UPI QR Generated",
        description: "Please scan the QR code with your UPI app"
      });
    } else {
      handlePaymentComplete();
    }
  };

  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    
    // Update order with payment details
    dispatch({
      type: 'COMPLETE_ORDER_PAYMENT',
      payload: {
        orderId: order.id,
        paymentDetails: {
          method: paymentMethod,
          subtotal,
          tax,
          tip: tipAmount,
          total: finalTotal,
          serviceRating
        }
      }
    });
    
    toast({
      title: "Payment Successful!",
      description: "Thank you for your payment. Your e-bill is ready."
    });
  };

  const handleCloseModal = () => {
    onOpenChange(false);
    if (paymentCompleted && onPaymentComplete) {
      setTimeout(() => {
        onPaymentComplete(order.id);
      }, 500);
    }
  };

  const generateBillContent = () => (
    <div className="space-y-4 p-4 bg-white text-black rounded-lg">
      <div className="text-center border-b pb-2">
        <h3 className="text-lg font-bold">{state.restaurant.name}</h3>
        <p className="text-sm">Digital Receipt</p>
      </div>
      
      <div className="flex justify-between text-sm">
        <span>Table: {order.tableNumber}</span>
        <span>Order: #{order.id.slice(-4)}</span>
      </div>
      
      <div className="text-sm">
        <span>Date: {new Date(order.timestamp).toLocaleDateString()}</span><br/>
        <span>Time: {new Date(order.timestamp).toLocaleTimeString()}</span>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        {order.items.map((item: any, index: number) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{item.menuItem.name} x{item.quantity} ({item.orderType})</span>
            <span>{state.restaurant.currency}{(item.menuItem.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <Separator />
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{state.restaurant.currency}{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({state.restaurant.taxRate}%):</span>
          <span>{state.restaurant.currency}{tax.toFixed(2)}</span>
        </div>
        {tipAmount > 0 && (
          <div className="flex justify-between">
            <span>Tip:</span>
            <span>{state.restaurant.currency}{tipAmount.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <Separator />
      
      <div className="flex justify-between font-bold">
        <span>Total:</span>
        <span>{state.restaurant.currency}{finalTotal.toFixed(2)}</span>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        Payment Method: {paymentMethod === 'cash' ? 'Cash' : 'UPI'}
        <br />
        Service Rating: {Array(serviceRating).fill('⭐').join('')}
      </div>
      
      <div className="text-center text-xs text-muted-foreground">
        Thank you for dining with us!
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment & E-Bill</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!paymentMethod && (
            <Card>
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <h4 className="font-semibold">Total Amount</h4>
                  <div className="text-2xl font-bold text-sage-green">
                    {state.restaurant.currency}{finalTotal.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handlePaymentMethodSelect('cash')}
                    className="w-full flex items-center justify-center gap-2"
                    variant="outline"
                  >
                    <Banknote className="w-5 h-5" />
                    Pay with Cash
                  </Button>

                  <Button
                    onClick={() => handlePaymentMethodSelect('upi')}
                    className="w-full flex items-center justify-center gap-2 bg-warm-orange hover:bg-warm-orange/90 text-earth-brown"
                  >
                    <QrCode className="w-5 h-5" />
                    Pay with UPI
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {paymentMethod === 'upi' && showUpiQr && !paymentCompleted && (
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="font-semibold mb-4">Scan UPI QR Code</h4>
                
                <div className="w-48 h-48 mx-auto bg-gray-200 flex items-center justify-center mb-4 rounded-lg">
                  <div className="text-center">
                    <QrCode className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">UPI QR Code</p>
                    <p className="text-xs text-muted-foreground">
                      Amount: {state.restaurant.currency}{finalTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Open your UPI app and scan this QR code to pay
                </p>
                
                <Button onClick={handlePaymentComplete} className="w-full">
                  Payment Complete
                </Button>
              </CardContent>
            </Card>
          )}
          
          {paymentCompleted && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-olivine rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl text-white">✓</span>
                </div>
                <h4 className="font-semibold text-olivine">Payment Successful!</h4>
              </div>
              
              {generateBillContent()}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => toast({ title: "Bill Downloaded", description: "E-bill saved to downloads" })}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                
                <Button
                  onClick={() => toast({ title: "Bill Sent", description: "E-bill sent to email" })}
                  variant="outline"
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
              
              <Button
                onClick={handleCloseModal}
                className="w-full bg-olivine hover:bg-olivine/90 text-white"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}