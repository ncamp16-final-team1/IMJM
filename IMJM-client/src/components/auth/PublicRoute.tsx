import React, { JSX, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkLogin } from "../../utils/auth/auth";

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<"ok" | "notAgreed" | "unauthorized" | null>(null);

  useEffect(() => {
    const verifyLogin = async () => {
      const loggedIn = await checkLogin();
      setIsAuthenticated(loggedIn);
    };
    verifyLogin();
  }, []);

  if (isAuthenticated === "ok") {
    return <div>Loading...</div>;
  }

  if (isAuthenticated === "notAgreed") {
    return <Navigate to="/user/register" replace />;
  }

  if (isAuthenticated === "unauthorized") {
    return <Navigate to="/" replace />;
  }

  // 비인증된 경우 자식 컴포넌트 렌더링
  return children;
};

export default PublicRoute;