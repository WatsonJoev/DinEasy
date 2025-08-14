import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TableEntry = () => {
  const qrCodeRegionId = "qr-reader";
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();
  const { dispatch } = useApp();

  useEffect(() => {
    const scanner = new Html5Qrcode(qrCodeRegionId);
    qrScannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 230 },
        },
        (decodedText) => {
          console.log("✅ QR Code Detected:", decodedText);

          scanner.stop().then(() => {
            document.getElementById(qrCodeRegionId)?.remove();
          });

          try {
            const url = new URL(decodedText);
            const table = url.searchParams.get("table");

            if (table) {
              dispatch({ type: "SET_TABLE_NUMBER", payload: table });
              dispatch({ type: "SET_USER_TYPE", payload: "customer" });
              navigate("/login");
            } else {
              alert("QR code is missing the 'table' parameter.");
            }
          } catch (err) {
            console.error("❌ Invalid QR Code Format:", decodedText);
            alert("Invalid QR code. Please scan a valid table QR.");
          }
        },
        (errorMessage) => {
          if (errorMessage.includes("NotFoundException")) {
            // Optional: show silent warning only if needed
            // console.warn("No QR code detected. Keep scanning...");
          } else {
            console.warn("Scanner Error:", errorMessage);
          }
        }
      )
      .catch((err) => {
        console.error("❌ Unable to start scanner:", err);
        alert("Camera access failed. Please allow permission or refresh the page.");
      });

    return () => {
      scanner.stop().catch((err) => {
        console.warn("Scanner cleanup failed:", err);
      });
    };
  }, [dispatch, navigate]);

  const handleManualLogin = () => {
    const randomTableNumber = Math.floor(Math.random() * 10) + 1;
    dispatch({ type: "SET_TABLE_NUMBER", payload: String(randomTableNumber) });
    dispatch({ type: "SET_USER_TYPE", payload: "customer" });
    navigate("/login", { state: { tableNumber: randomTableNumber } });
  };

  return (
    <Layout title="Table Entry">
      <div className="min-h-screen flex flex-col items-center p-4 gap-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-lg">Scan QR Code to Login</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div
              id="qr-reader"
              className="w-[300px] h-[250px] "
            />
            <Button onClick={handleManualLogin} className="w-full">
              Scan the QR Code
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TableEntry;
