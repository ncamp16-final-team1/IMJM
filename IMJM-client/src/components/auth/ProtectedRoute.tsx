import React, { JSX, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkLogin } from "../../utils/auth/auth";
import LoginDialog from "../common/LonginDialog"

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyLogin = async () => {
      const loggedIn = await checkLogin();
      setIsAuthenticated(loggedIn);
      if (!loggedIn) {
        setShowDialog(true);
      }
    };
    verifyLogin();
  }, []);
  
  const handleLogin = () => {
    setShowDialog(false);
    navigate("/login", { state: { from: location } });
  };

  const handleClose = () => {
    setShowDialog(false);
    navigate(-1);
  };


  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
        <>
          <LoginDialog
            open={showDialog}
            onClose={handleClose}
            onLogin={handleLogin}
          />
        </>
      );
  }

  return children;
};

export default ProtectedRoute;