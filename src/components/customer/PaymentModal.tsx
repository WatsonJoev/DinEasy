import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import { Banknote, QrCode, Download, Mail, Smile } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { PARCEL_CHARGE } from "@/contexts/AppContext";
import jsPDF from "jspdf";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any | any[];
  onPaymentComplete?: (orderId: string) => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  order,
  onPaymentComplete,
}: PaymentModalProps) {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<
    "bill" | "pay" | "scan" | "thankyou" | "billAfterCash"
  >("bill");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | null>(
    null
  );
  const [tip, setTip] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const taxRate = state.restaurant.taxRate || 0;
  const ordersArray = Array.isArray(order) ? order : [order];

  const allItems = ordersArray.flatMap((o) => o.items);
  const tableNumber = state.tableNumber ?? "N/A";

  const subtotal = allItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const parcelCharges = allItems.reduce(
    (sum, item) =>
      sum + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0),
    0
  );

  const taxAmount = (subtotal + parcelCharges) * (taxRate / 100);
  const total = subtotal + parcelCharges + taxAmount + tip;

  const completePayment = (method: "cash" | "upi") => {
    setPaymentMethod(method);

    ordersArray.forEach((order) => {
      dispatch({
        type: "COMPLETE_ORDER_PAYMENT",
        payload: {
          ...order,
          paymentDetails: {
            method,
            subtotal,
            tax: taxAmount,
            tip,
            total,
            parcelCharges,
            serviceRating: rating,
          },
        },
      });
    });

    stopScanner();

    if (method === "cash") {
      setStep("billAfterCash"); // Show detailed bill after cash payment
    } else {
      setStep("thankyou");
    }
  };

  const handleClose = () => {
    stopScanner();
    onOpenChange(false);
    if (onPaymentComplete && ordersArray.length > 0) {
      onPaymentComplete(ordersArray[0].id);
    }
    setStep("bill");
    setPaymentMethod(null);
    setTip(0);
    setRating(0);
  };

  const startScanner = async () => {
    const scannerId = "qr-scanner";
    const config = { fps: 10, qrbox: 250 };

    try {
      scannerRef.current = new Html5Qrcode(scannerId);
      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          toast({ title: "QR Scanned", description: decodedText });
          completePayment("upi");
        },
        () => {}
      );
    } catch (err: any) {
      toast({
        title: "Camera Error",
        description: err.message || "Unable to access camera",
      });
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (step === "scan") startScanner();
    return () => stopScanner();
  }, [step]);

  const BillSummary = () => (
    <div className="space-y-2">
      <Card>
        <CardContent className="p-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Table: {tableNumber}</span>
            <span>
              Orders: {ordersArray.map((o) => "#" + String(o.id).slice(-4)).join(", ")}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(ordersArray[0]?.timestamp || Date.now()).toLocaleString()}
          </div>
          <Separator className="my-2" />
          {allItems.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                {item.menuItem.name} x{item.quantity} ({item.orderType})
              </span>
              <span>
                ₹
                {(
                  item.menuItem.price * item.quantity +
                  (item.orderType === "takeaway"
                    ? PARCEL_CHARGE * item.quantity
                    : 0)
                ).toFixed(2)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-sm space-y-1 pt-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        {parcelCharges > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Parcel Charges</span>
            <span>₹{parcelCharges.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax ({taxRate}%)</span>
          <span>₹{taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tip</span>
          <span>₹{tip.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-2 mt-2">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  const DetailedBillAfterCash = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-center">Detailed Payment Receipt</h3>
  
      {ordersArray.map((order, index) => {
        const orderItems = order.items;
        const orderSubtotal = orderItems.reduce(
          (sum, item) => sum + item.menuItem.price * item.quantity,
          0
        );
        const orderParcelCharges = orderItems.reduce(
          (sum, item) =>
            sum + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0),
          0
        );
        const orderTax = (orderSubtotal + orderParcelCharges) * (taxRate / 100);
        const orderTotal = orderSubtotal + orderParcelCharges + orderTax;
  
        return (
          <Card key={order.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Order #{String(order.id).slice(-4)}</span>
                <span>Table: {order.tableNumber ?? "N/A"}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(order.timestamp || Date.now()).toLocaleString()}
              </div>
              <Separator className="my-2" />
              {orderItems.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.menuItem.name} x{item.quantity} ({item.orderType})
                  </span>
                  <span>
                    ₹
                    {(
                      item.menuItem.price * item.quantity +
                      (item.orderType === "takeaway"
                        ? PARCEL_CHARGE * item.quantity
                        : 0)
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
  
              <div className="pt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{orderSubtotal.toFixed(2)}</span>
                </div>
                {orderParcelCharges > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Parcel Charges</span>
                    <span>₹{orderParcelCharges.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%)</span>
                  <span>₹{orderTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
  
      <div className="text-sm border-t pt-2">
        <div className="flex justify-between">
          <span>Overall Tip</span>
          <span>₹{tip.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base mt-2">
          <span>Grand Total Paid</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
  
      <Button
        className="w-full bg-gradient-to-r from-charcoal to-zomp text-white"
        onClick={() => setStep("thankyou")}
      >
        Continue
      </Button>
    </div>
  );  

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Add company logo placeholder with gradient effect
    doc.setFillColor(40, 40, 40);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(state.restaurant.name || "Restaurant", pageWidth / 2, yPos + 12, { align: "center" });
    yPos += 30;

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Company Details with fallback values
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("COMPANY DETAILS", margin, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    doc.text("Address: 123 Restaurant Street, City", margin, yPos);
    yPos += 5;
    doc.text("Phone: +91 1234567890", margin, yPos);
    yPos += 5;
    doc.text("Email: contact@restaurant.com", margin, yPos);
    yPos += 5;
    doc.text("GSTIN: GSTIN123456789", margin, yPos);
    yPos += 10;

    // Bill Details
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("BILL DETAILS", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    // Date and Time with better formatting
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = currentDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    doc.text(`Date: ${formattedDate}`, margin, yPos);
    doc.text(`Time: ${formattedTime}`, pageWidth - margin, yPos, { align: "right" });
    yPos += 7;

    // Table Number and Order IDs
    doc.text(`Table: ${tableNumber}`, margin, yPos);
    doc.text(`Orders: ${ordersArray.map((o) => "#" + o.id.slice(-4)).join(", ")}`, pageWidth - margin, yPos, { align: "right" });
    yPos += 10;

    // Items Header with better formatting
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("ITEMS", margin, yPos);
    doc.text("AMOUNT", pageWidth - margin, yPos, { align: "right" });
    yPos += 7;

    // Items List with better number formatting
    doc.setFont(undefined, 'normal');
    allItems.forEach((item: any) => {
      const itemText = `${item.menuItem.name} x${item.quantity} (${item.orderType})`;
      const itemPrice = (item.menuItem.price * item.quantity + 
        (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0));
      const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(itemPrice);
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(itemText, margin, yPos);
      doc.text(formattedPrice, pageWidth - margin, yPos, { align: "right" });
      yPos += 7;
    });

    yPos += 5;

    // Summary with better formatting and number style
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text("SUMMARY", margin, yPos);
    yPos += 7;

    const summaryItems = [
      { label: "Subtotal", value: subtotal },
      ...(parcelCharges > 0 ? [{ label: "Parcel Charges", value: parcelCharges }] : []),
      { label: `Tax (${taxRate}%)`, value: taxAmount },
      { label: "Tip", value: tip },
      { label: "Total", value: total }
    ];

    doc.setFont(undefined, 'normal');
    summaryItems.forEach(({ label, value }) => {
      const formattedValue = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);

      doc.text(label, margin, yPos);
      doc.text(formattedValue, pageWidth - margin, yPos, { align: "right" });
      yPos += 7;
    });

    // Payment Method
    yPos += 5;
    doc.setFont(undefined, 'bold');
    doc.text(`Payment Method: ${paymentMethod?.toUpperCase() || "N/A"}`, margin, yPos);
    yPos += 10;

    // Thank you message with better styling
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Thank you for dining with us!", pageWidth / 2, yPos, { align: "center" });
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("We hope to serve you again soon!", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    // Additional Information
    doc.setFontSize(9);
    doc.text("Additional Information:", margin, yPos);
    yPos += 5;
    doc.text("• This bill serves as a tax invoice", margin, yPos);
    yPos += 4;
    doc.text("• For any queries, please contact us within 7 days", margin, yPos);
    yPos += 4;
    doc.text("• We value your feedback - please rate your experience", margin, yPos);
    yPos += 10;

    // Terms and Conditions with better formatting
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'bold');
    doc.text("Terms & Conditions:", margin, yPos);
    yPos += 5;
    doc.setFont(undefined, 'normal');
    doc.text("1. This is a computer-generated bill and does not require a signature.", margin, yPos);
    yPos += 4;
    doc.text("2. All prices include applicable taxes.", margin, yPos);
    yPos += 4;
    doc.text("3. Please keep this bill for your records.", margin, yPos);
    yPos += 4;
    doc.text("4. Valid for 7 days from the date of issue.", margin, yPos);
    yPos += 4;
    doc.text("5. For any discrepancies, please contact us immediately.", margin, yPos);

    // Save the PDF with a more professional filename
    const dateStr = currentDate.toISOString().split('T')[0];
    const timeStr = currentDate.toTimeString().split(' ')[0].replace(/:/g, '-');
    doc.save(`${state.restaurant.name || 'Restaurant'}-Bill-${tableNumber}-${dateStr}-${timeStr}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md mx-auto max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment & E-Bill</DialogTitle>
        </DialogHeader>

        {step === "bill" && (
          <div className="space-y-4">
            <BillSummary />
            <div className="flex items-center gap-2">
              <span className="text-sm w-14">Tip ₹</span>
              <Input
                type="number"
                value={tip}
                onChange={(e) => setTip(Math.max(+e.target.value, 0))}
              />
            </div>
            <Button className="w-full" onClick={() => setStep("pay")}>
              Proceed to Pay ₹{total.toFixed(2)}
            </Button>
          </div>
        )}

        {step === "pay" && (
          <div className="space-y-3">
            <h3 className="font-semibold text-center">Choose Payment Method</h3>
            <Button
              onClick={() => completePayment("cash")}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Banknote className="w-5 h-5" /> Pay with Cash
            </Button>
            <Button
              onClick={() => setStep("scan")}
              className="w-full flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" /> Pay with UPI (Scan QR)
            </Button>
          </div>
        )}

        {step === "scan" && (
          <div className="space-y-4">
            <h4 className="text-center font-semibold">Scan UPI QR Code</h4>
            <div
              id="qr-scanner"
              className="w-full h-[300px] rounded border border-muted"
            ></div>
            <Button className="w-1/2" onClick={() => setStep("pay")}>
              Back
            </Button>
            <Button className="w-1/2 bg-gray-50 border-gray-700 text-black rounded-lg border" onClick={() => setStep("billAfterCash")}>
              Scan
            </Button> 
          </div>
        )}

        {step === "billAfterCash" && <DetailedBillAfterCash />}

        {step === "thankyou" && (
          <div className="space-y-4 text-center">
            <Smile className="mx-auto w-10 h-10 text-emerald-600" />
            <h4 className="text-xl font-semibold text-emerald-700">
              Thank you for dining with us!
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  generatePDF();
                  toast({
                    title: "Downloaded",
                    description: "E-bill downloaded successfully",
                  });
                }}
              >
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  toast({
                    title: "E-bill Sent",
                    description: "E-bill sent to email",
                  })
                }
              >
                <Mail className="w-4 h-4 mr-2" /> Email
              </Button>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-charcoal to-zomp text-white"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
