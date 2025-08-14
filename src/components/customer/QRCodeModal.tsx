import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Copy, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeModal({ open, onOpenChange }: QRCodeModalProps) {
  const { state } = useApp();

  const qrCodeUrl = `${window.location.origin}?table=${state.restaurant.table}&restaurant=${encodeURIComponent(state.restaurant.name)}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrCodeUrl);
    toast({
      title: "URL Copied",
      description: "QR code URL copied to clipboard"
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Menu - ${state.restaurant.name}`,
        url: qrCodeUrl
      });
    } else {
      handleCopyUrl();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>Table QR Code</DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-48 h-48 mx-auto bg-white border-2 border-charcoal/10 flex items-center justify-center mb-4 rounded-lg">
              <div className="text-center">
                <QrCode className="w-32 h-32 mx-auto mb-2 text-charcoal" />
                <p className="text-xs text-muted-foreground">
                  Table {state.restaurant.table}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Scan this QR code to access the menu for Table {state.restaurant.table}
            </p>
            
            <div className="flex gap-2">
              <Button onClick={handleCopyUrl} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
              
              <Button onClick={handleShare} variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
