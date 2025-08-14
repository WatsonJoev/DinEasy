import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  className?: string;
}

export const BackButton = ({ className }: BackButtonProps) => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleBack = () => {
    console.log("Back button clicked", {
      userType: state.userType,
      historyLength: window.history.length,
    });

    if (state.userType) {
      console.log("Logging out user");
      dispatch({ type: "SET_USER_TYPE", payload: null });
      dispatch({ type: "SET_AUTHENTICATED", payload: false });

      if (window.history.length > 2) {
        console.log("Navigating back after logout");
        navigate(-1);
      } else {
        console.log("Not enough history, redirecting to home");
        navigate("/");
      }
    } else {
      if (window.history.length > 2) {
        console.log("Navigating back");
        navigate(-1);
      } else {
        console.log("No history, navigating to home");
        navigate("/");
      }
    }
  };

  return (
    <Button
      onClick={handleBack}
      variant="ghost"
      size="sm"
      className={`${className ?? ""} flex items-center gap-2`}
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  );
};
