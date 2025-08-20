import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "../lib/supabaseClient";
import QRScanner from "./QRScanner";

export const PhoneLogin = () => {
  const { dispatch, state } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [scanned, setScanned] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [showAdminOptions, setShowAdminOptions] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);

  const tableNumberFromState = location.state?.tableNumber;

  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);

  // Update context with table number
  useEffect(() => {
    if (tableNumberFromState) {
      dispatch({
        type: "SET_TABLE_NUMBER",
        payload: String(tableNumberFromState),
      });
    }
  }, [tableNumberFromState, dispatch]);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpSent) {
      setCanResend(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, otpSent]);

  const fullPhone = `+91${phone}`;

  const handleSendOtp = async () => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setOtpSent(true);
        setCanResend(false);
        setTimer(30);

        toast({ title: "OTP Sent to your p  " });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: enteredOtp,
        type: "sms",
      });
      if (error) {
        toast({
          title: "Incorrect OTP",
          description: error.message,
          variant: "destructive",
        });
      } else {
        dispatch({ type: "SET_USER_TYPE", payload: "customer" });
        dispatch({ type: "SET_AUTHENTICATED", payload: true });

        toast({
          title: "Login Successful",
          description: state.tableNumber
            ? `Welcome to Table ${state.tableNumber}`
            : "Welcome to the customer dashboard!",
        });

        navigate("/customer");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleQrScanned = (scannedText: string) => {
    const match = scannedText.match(/table-(\d{1,2})/i);
    const extracted = match?.[1];
    if (extracted) {
      setTableNumber(extracted);
      dispatch({ type: "SET_TABLE_NUMBER", payload: extracted });
      setQrScanned(true);
      toast({
        title: "Table Number Scanned",
        description: `Table number ${extracted} detected.`,
      });
    } else {
      toast({
        title: "Invalid QR Code",
        description: "QR must be in format: table-7",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      {!scanned ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-center">
              Scan QR Code
            </CardTitle>
            <p className="text-xs text-muted-foreground text-center mt-0.5">
              Align the QR code inside the box or click below to continue manually.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col items-center">
            <div className="w-[200px] h-[200px] bg-black rounded-lg border-2 border-dashed border-blue-400" />
            <Button
              className="w-200 "
              onClick={() => {
                if (!tableNumber) {
                  const randomTable = Math.floor(Math.random() * 30) + 1;
                  setTableNumber(randomTable.toString());
                }
                setScanned(true);
              }}
            >
              Start Scanning
            </Button>
            <br />            
            <p className="text-xs text-muted-foreground text-center mt-0.5">
              Staff access only
            </p>

            <div className="w-full flex flex-col items-center mt-4">
              {!showAdminOptions ? (
                <Button
                  variant="outline"
                  className="w-32 mb-2"
                  onClick={() => setShowAdminOptions(true)}
                >
                  Staff Access
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    className="bg-orange-300 text-black"
                    onClick={() => navigate("/chef")}
                  >
                    Chef
                  </Button>
                  <Button
                    className="bg-yellow-400 text-black"
                    onClick={() => navigate("/admin-login")}
                  >
                    Admin
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Customer Login {tableNumber ? ` - Table ${tableNumber}` : ""}
            </CardTitle>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Enter your phone number to receive a one-time password (OTP).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="table-number">Table Number</Label>
              <Input
                id="table-number"
                type="text"
                placeholder="Table Number"
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value.replace(/\D/g, ""))}
                className="mt-1 text-center"
                maxLength={2}
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black select-none">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your 10-digit phone number"
                value={phone}
                maxLength={10}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
                className="pl-12"
              />
            </div>

            {otpSent && (
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter the OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                />
                <Button
                  onClick={handleSendOtp}
                  className="w-full"
                  variant="outline"
                  disabled={!canResend}
                >
                  {canResend ? "Resend OTP" : `Resend in ${timer}s`}
                </Button>
              </div>
            )}

            {!otpSent ? (
              <Button onClick={handleSendOtp} className="w-full">
                Send OTP
              </Button>
            ) : (
              <Button onClick={handleVerifyOtp} className="w-full">
                Verify OTP
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
