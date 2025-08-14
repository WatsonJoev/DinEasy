import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { supabase } from '../lib/supabaseClient'; // adjust path

export const PhoneLogin = () => {
  const { dispatch, state } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Get tableNumber from route state if available
  const tableNumberFromState = location.state?.tableNumber;

  // Local states
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);

  // On mount, update context with tableNumber from props if available
  useEffect(() => {
    if (tableNumberFromState) {
      dispatch({
        type: "SET_TABLE_NUMBER",
        payload: String(tableNumberFromState),
      });
    }
  }, [tableNumberFromState, dispatch]);

  // Countdown timer for resend OTP
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
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: fullPhone, // use +91 + phone
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
        setTimer(30); // 30s cooldown

        toast({
          title: "OTP Sent",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone, // use +91 + phone
        token: enteredOtp,
        type: 'sms',
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
        dispatch({ type: "SET_PHONE_NUMBER", payload: phone });

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
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  async function verifyOtp(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: '+919080345945', // must match exactly
      token: '123456',        // the OTP code
      type: 'sms',
    });
    if (error) {
      // handle error
      console.error(error.message);
    } else {
      // User is now logged in
      console.log('User logged in:', data);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-xl text-center">
            Customer Login{" "}
            {state.tableNumber ? ` - Table ${state.tableNumber}` : ""}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1">
            Enter your phone number to receive a one-time password (OTP).
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black select-none">+91</span>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your 10-digit phone number"
              value={phone}
              maxLength={10}
              onChange={(e) => {
                // Only allow digits
                const val = e.target.value.replace(/\D/g, "");
                setPhone(val);
              }}
              className="pl-12" // Add left padding to make space for +91
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
    </div>
  );
};
