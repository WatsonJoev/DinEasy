import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

interface BackButtonProps {
  className?: string;
}

export const BackButton = ({ className }: BackButtonProps) => {
  const { state, dispatch } = useApp();

  const handleBack = () => {
    console.log("Back button clicked", {
      userType: state.userType,
      historyLength: window.history.length,
    });

    if (state.userType) {
      console.log("Logging out user");
      dispatch({ type: "SET_USER_TYPE", payload: null });
      dispatch({ type: "SET_AUTHENTICATED", payload: false });
    } else if (window.history.length > 1) {
      console.log("Going back in history");
      window.history.back();
    } else {
      console.log("No history to go back to");
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
