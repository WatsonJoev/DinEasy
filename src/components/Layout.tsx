import { ReactNode } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BackButton } from "@/components/ui/BackButton";
import { MobileHeader } from "./MobileHeader";
import { LogOut } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showUserSwitch?: boolean;
  showBackButton?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Layout({
  children,
  title,
  showUserSwitch = true,
  showBackButton = true,
  activeTab = "",
  onTabChange = () => {},
}: LayoutProps) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch({ type: "SET_USER_TYPE", payload: null });
    dispatch({ type: "SET_AUTHENTICATED", payload: false });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-gradient-to-r from-charcoal to-zomp text-white shadow-lg p-3">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop Header */}
          <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex justify-between items-center md:w-2/3">
              {/* Back button */}
              <div
                className={`flex items-center justify-start ${
                  !showBackButton || location.pathname === "/" ? "p-8" : ""
                }`}
              >
                {showBackButton && location.pathname !== "/" && (
                  <BackButton className="text-white hover:text-white hover:bg-white/20" />
                )}
              </div>

              {/* Title */}
              <div className="flex flex-col items-center text-center ml-4 md:ml-0 md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:my-4">
                <h1 className="text-2xl font-bold text-white">
                  {state.restaurant.name}
                </h1>
                {title && (
                  <p className="text-sm opacity-90 text-white">{title}</p>
                )}
              </div>
            </div>

            {/* User Switch Buttons */}
            {showUserSwitch && (
              <div className="flex justify-center md:justify-end">
                <Card className="w-full max-w-md p-2">
                  <div className="flex items-center justify-center md:justify-end bg-white gap-2 px-2">
                    {state.userType === "customer" && (
                      <>
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="text-xs text-black rounded-r-none bg-white"
                        >
                          <p>Customer</p>
                        </Button>
                        <div className="rounded-l-none">
                          <MobileHeader
                            activeTab={activeTab}
                            onTabChange={onTabChange}
                          />
                        </div>
                      </>
                    )}

                    {state.userType === "chef" && (
                      <>
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="text-xs text-black bg-white"
                        >
                          <Link to="/chef">Chef</Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleLogout}
                          className="text-black hover:bg-black/10"
                          title="Logout"
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {state.userType === "admin" && (
                      <>
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="text-xs text-black bg-white"
                        >
                          <Link to="/admin-login">Admin</Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleLogout}
                          className="text-black hover:bg-black/10"
                          title="Logout"
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Mobile Header */}
          <div className="flex items-center justify-between md:hidden">
            {/* Back button on left */}
            <div
              className={`flex items-center justify-start ${
                !showBackButton || location.pathname === "/" ? "p-8" : ""
              }`}
            >
              {showBackButton && location.pathname !== "/" && (
                <BackButton className="text-white hover:text-white hover:bg-white/20" />
              )}
            </div>

            {/* Title centered */}
            <div className="flex-1 mx-4">
              <h1 className="text-lg font-bold text-white truncate">
                {state.restaurant.name}
              </h1>
              {title && (
                <p className="text-xs opacity-90 text-white truncate">
                  {title}
                </p>
              )}
            </div>

            {/* Right: MobileHeader (customer) or empty for others */}
            <div className="flex-shrink-0">
              {state.userType === "customer" ? (
                <div
                  style={{
                    padding: "0.25rem",
                    borderRadius: "0.25rem",
                    minWidth: "40px",
                    minHeight: "40px",
                  }}
                  className="sm:text-white"
                >
                  <MobileHeader
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                  />
                </div>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-white hover:bg-white/20"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
