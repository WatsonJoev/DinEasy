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
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';

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
    "bill" | "scan" | "finalReceipt"
  >("bill");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | null>(
    null
  );
  const [rating, setRating] = useState<number>(0);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  const taxRate = state.restaurant.taxRate || 0;
  const ordersArray = Array.isArray(order) ? order : [order];

  const allItems = ordersArray.flatMap((o) => o.items);
  const tableNumber = ordersArray[0]?.tableNumber ?? "N/A";

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
  const total = subtotal + parcelCharges + taxAmount;

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
            total,
            parcelCharges,
            serviceRating: rating,
          },
        },
      });
    });

    stopScanner();

    setStep("finalReceipt");
  };

  const handleClose = () => {
    stopScanner();
    onOpenChange(false);
    if (onPaymentComplete && ordersArray.length > 0) {
      setTimeout(() => {
        onPaymentComplete(ordersArray[0].id);
      }, 300);
    }
    setStep("bill");
    setPaymentMethod(null);
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
        () => { }
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
        .catch(() => { });
    }
  };

  useEffect(() => {
    if (step === "scan") startScanner();
    return () => stopScanner();
  }, [step]);

  const generatePDFReceipt = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;
    const lineHeight = 7;

    // Add restaurant logo/name
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(state.restaurant.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += lineHeight * 1.5;

    // Add receipt title
    doc.setFontSize(18);
    doc.text('Payment Receipt', pageWidth / 2, yPos, { align: 'center' });
    yPos += lineHeight * 2;

    // Add table and date info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const dateTime = new Date(ordersArray[0]?.timestamp || Date.now());
    const displayDate = dateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
    const formattedTime = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    doc.text(`Table: ${tableNumber}`, margin, yPos);
    doc.text(`Date: ${displayDate}, ${formattedTime}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += lineHeight * 1.5;

    // Thin separator line
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += lineHeight;

    // Add orders
    ordersArray.forEach((order, orderIndex) => {
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

      // Add order number
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`Order #${order.id.slice(-4)}`, margin, yPos);
      yPos += lineHeight;

      // Add items
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      orderItems.forEach(item => {
        const itemName = `${item.menuItem.name} x${item.quantity} (${item.orderType})`;
        const itemPriceValue = (item.menuItem.price * item.quantity + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0)).toFixed(2);
        const itemPrice = `${state.restaurant.currency}${itemPriceValue}`;

        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          yPos = 20;
          doc.setFontSize(24);
          doc.setFont('helvetica', 'bold');
          doc.text(state.restaurant.name, pageWidth / 2, yPos, { align: 'center' });
          yPos += lineHeight * 1.5;
          doc.setFontSize(18);
          doc.text('Payment Receipt - Continued', pageWidth / 2, yPos, { align: 'center' });
          yPos += lineHeight * 2;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.2);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += lineHeight;
        }

        doc.text(itemName, margin, yPos);
        doc.text(itemPrice, pageWidth - margin, yPos, { align: 'right' });
        yPos += lineHeight;

        if (item.orderType === 'takeaway') {
          doc.setFontSize(10);
          doc.text(`(+${state.restaurant.currency}${PARCEL_CHARGE.toFixed(2)} parcel)`, margin + 10, yPos);
          doc.setFontSize(12);
          yPos += lineHeight;
        }
      });

      // Add order summary
      yPos += lineHeight * 0.8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Subtotal:', margin, yPos);
      doc.text(`${state.restaurant.currency}${orderSubtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += lineHeight;

      if (orderParcelCharges > 0) {
        doc.text('Parcel Charges:', margin, yPos);
        doc.text(`${state.restaurant.currency}${orderParcelCharges.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += lineHeight;
      }

      doc.text(`Tax (${taxRate}%):`, margin, yPos);
      doc.text(`${state.restaurant.currency}${orderTax.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += lineHeight;

      doc.text('Order Total:', margin, yPos);
      doc.text(`${state.restaurant.currency}${orderTotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += lineHeight * 1.5;

      // Bold separator line between orders
      if (orderIndex < ordersArray.length - 1) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += lineHeight;
      }
    });

    // Final thick separator line before total
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += lineHeight;

    // Add total amount
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount Paid:', margin, yPos);
    doc.text(`${state.restaurant.currency}${total.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += lineHeight * 2;

    // Add thank you message
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for dining with us!', pageWidth / 2, yPos, { align: 'center' });
    yPos += lineHeight;
    doc.text('We hope to see you again soon.', pageWidth / 2, yPos, { align: 'center' });

    // Save the PDF with custom filename
    const cleanHotelName = state.restaurant.name.replace(/[^a-zA-Z0-9]/g, '');
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}-${month}-${year}`; // dd-mm-yyyy
    const shortTable = tableNumber.replace('T-', ''); // Assuming format T-XXX
    doc.save(`Bill_${cleanHotelName}_T${shortTable}_${formattedDate}.pdf`);
  };

  const BillSummary = () => (
    <Card className="p-2">
      <div className="text-center pb-0.5 mb-0.5 border-b border-gray-200">
        <h3 className="text-l font-bold text-gray-800 tracking-tight">
          {state.restaurant.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">Combined Bill</p>
      </div>
      <div className="flex justify-between text-xs mb-0.5">
        <span>Table: {tableNumber}</span>
        <span>
          Orders: {ordersArray.map((o) => "#" + o.id.slice(-4)).join(", ")}
        </span>
      </div>
      <div className="text-xs text-gray-500 mb-0.5">
        {new Date(ordersArray[0]?.timestamp || Date.now()).toLocaleString()}
      </div>
      <Separator className="my-1.5" />
      <div className="space-y-0.5 pt-0.5">
        {allItems.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-start text-xs text-gray-800">
            <span className="flex-1 pr-1 leading-tight">
              {item.menuItem.name} x{item.quantity} ({item.orderType})
              {item.orderType === 'takeaway' && (
                <span className="text-orange-600 ml-0.5 font-medium">
                  (+₹{PARCEL_CHARGE.toFixed(2)} parcel)
                </span>
              )}
            </span>
            <span className="font-semibold flex-shrink-0 text-right">
              ₹
              {(item.menuItem.price * item.quantity + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0)).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <Separator className="my-2 bg-gray-300 h-0.5" />

      <div className="text-xs space-y-0.5">
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
        <div className="flex justify-between font-bold text-sm mt-1.5 pt-1.5 border-t border-gray-200">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );

  const DetailedBillAfterCash = () => (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <div className="text-center pb-2 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">
          {state.restaurant.name}
        </h3>
        <p className="text-sm text-gray-600 mt-1">Payment Receipt</p>
        <div className="text-xs text-gray-500 mt-1">
          <span>Table: {tableNumber}</span>
          <span className="mx-2">•</span>
          <span>{new Date(ordersArray[0]?.timestamp || Date.now()).toLocaleString()}</span>
        </div>
      </div>

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
          <Card key={order.id} className="mb-4 border border-gray-100">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center text-sm font-medium text-gray-700 pb-2 border-b border-gray-100">
                <span>Order #{order.id.slice(-4)}</span>
              </div>
              <Separator className="my-2" />
              <div className="space-y-1.5">
                {orderItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start text-sm text-gray-800">
                    <span className="flex-1 pr-2">
                      {item.menuItem.name} x{item.quantity} ({item.orderType})
                      {item.orderType === 'takeaway' && (
                        <span className="text-orange-600 ml-1 text-xs">
                          (+₹{PARCEL_CHARGE.toFixed(2)} parcel)
                        </span>
                      )}
                    </span>
                    <span className="font-medium text-right">
                      ₹
                      {(item.menuItem.price * item.quantity + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-3" />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{orderSubtotal.toFixed(2)}</span>
                </div>
                {orderParcelCharges > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Parcel Charges</span>
                    <span className="font-medium">₹{orderParcelCharges.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Tax ({taxRate}%)</span>
                  <span className="font-medium">₹{orderTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-100">
                  <span>Order Total</span>
                  <span>₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="text-center font-bold text-lg text-gray-800 mt-4 pt-4 border-t border-gray-200">
        <span>Amount Paid: </span>
        <span>₹{total.toFixed(2)}</span>
      </div>
      <p className="text-center text-sm text-gray-600 mt-2">Thank you for dining with us !! We hope to see you again soon.</p>

    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-sm mx-auto max-h-[95vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-800 md:text-xl">Payment & E-Bill</DialogTitle>
        </DialogHeader>

        {step === "bill" && (
          <div className="space-y-6 pt-6">
            <BillSummary />
            <div className="space-y-4 pt-6 border-t mt-6">
              <h3 className="font-bold text-center text-base">Choose Payment Method</h3>
              <Button
                onClick={() => completePayment("cash")}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-base"
                variant="outline"
              >
                <Banknote className="w-5 h-5" /> Pay with Cash
              </Button>
              <Button
                onClick={() => setStep("scan")}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-base"
              >
                <QrCode className="w-5 h-5" /> Pay with UPI
              </Button>
            </div>
          </div>
        )}

        {step === "scan" && (
          <div className="space-y-4 pt-4">
            <h4 className="text-center font-semibold text-lg">Scan UPI QR Code</h4>
            {/* <div
              id="qr-scanner"
              className="w-full h-[220px] rounded border border-muted"
            ></div> */}
            <div className="w-full h-[220px] bg-black rounded-md flex items-center justify-center text-white text-lg"></div>
            <div className="flex gap-3">
              <Button
                className="w-1/2 py-2.5 text-base"
                onClick={() => setStep("bill")}
                variant="outline"
              >
                Back
              </Button>
              <Button
                className="w-1/2 font-medium py-2.5 text-base"
                onClick={() => completePayment("upi")}
              >
                Scan
              </Button>
            </div>
          </div>
        )}

        {step === "finalReceipt" && (
          <div className="space-y-4">
            <DetailedBillAfterCash />
            <div className="space-y-4 text-center pt-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 py-2 text-base"
                  onClick={() => {
                    generatePDFReceipt();
                    toast({
                      title: "Downloaded",
                      description: "E-bill downloaded successfully",
                    });
                  }}
                >
                  <Download className="w-5 h-5 mr-2" /> Download
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 py-2 text-base"
                  onClick={() =>
                    toast({
                      title: "E-bill Sent",
                      description: "E-bill sent to email",
                    })
                  }
                >
                  <Mail className="w-5 h-5 mr-2" /> Email
                </Button>
              </div>
              <Button
                className="w-full bg-gradient-to-r font-bold py-2 text-base rounded-lg shadow-md transition-all duration-200 ease-in-out"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}