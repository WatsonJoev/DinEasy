import { ReactNode } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { BackButton } from "./BackButton";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showUserSwitch?: boolean;
  showBackButton?: boolean;
}

export function Layout({
  children,
  title,
  showUserSwitch = true,
  showBackButton = true,
}: LayoutProps) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleUserSwitch = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("authenticated");

    dispatch({ type: "SET_USER_TYPE", payload: null });
    dispatch({ type: "SET_AUTHENTICATED", payload: false });
    navigate("/");
  };

  const showBack = showBackButton && location.pathname !== "/";

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-gradient-to-r from-charcoal to-zomp shadow-md"
      >
        <div className="max-w-full mx-auto px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Back Button */}
            <div className="w-auto flex-shrink-0">
              {showBack && (
                <BackButton className="text-white hover:text-white hover:bg-white/20 p-1" />
              )}
            </div>

            {/* Center: Hotel Info */}
            <div className="flex-1 text-center min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-white drop-shadow truncate">
                {state.restaurant.name}
              </h1>
              {title && (
                <p className="text-xs md:text-sm text-white/80 truncate">
                  {title}
                </p>
              )}
            </div>

            {/* Right: Logout Button */}
            <div className="w-auto flex-shrink-0 flex justify-end">
              {showUserSwitch && state.userType && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 rounded-full p-1.5 flex-shrink-0"
                  onClick={handleUserSwitch}
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={18} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <main className="flex-grow container mx-auto px-3 py-4 w-full">
        {children}
      </main>
    </div>
  );
}
