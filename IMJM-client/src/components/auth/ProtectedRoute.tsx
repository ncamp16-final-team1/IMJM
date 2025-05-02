import React, { JSX, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkLogin } from "../../utils/auth/auth";
import LoginDialog from "../common/LonginDialog";
import RegisterDialog from "../common/RegisterDialog";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyLogin = async () => {
      const result = await checkLogin();
  
      if (result === "ok") {
        setIsAuthenticated(true);
      } else if (result === "notAgreed") {
        setIsAuthenticated(false);
        setShowRegisterDialog(true);
      } else {
        setIsAuthenticated(false);
        setShowLoginDialog(true);
      }
    };
  
    verifyLogin();
  }, [navigate]);
  
  const handleLogin = () => {
    setShowLoginDialog(false);
    navigate("/login", { state: { from: location } });
  };

  const handleRegister = () => {
    setShowRegisterDialog(false);
    navigate("/user/register");
  };

  const handleClose = () => {
    setShowLoginDialog(false);
    setShowRegisterDialog(false);
    navigate(-1);
  };


  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
        <>
          <LoginDialog
            open={showLoginDialog}
            onClose={handleClose}
            onLogin={handleLogin}
          />
          <RegisterDialog
            open={showRegisterDialog}
            onClose={handleClose}
            onLogin={handleRegister}
          />
        </>
      );
  }

  return children;
};

export default ProtectedRoute;