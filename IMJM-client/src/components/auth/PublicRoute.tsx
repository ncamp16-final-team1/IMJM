import React, { JSX, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkLogin } from "../../utils/auth/auth";

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyLogin = async () => {
      const loggedIn = await checkLogin();
      setIsAuthenticated(loggedIn);
    };
    verifyLogin();
  }, []);

  if (isAuthenticated === null) {
    // 로딩 중 표시
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    // 로그인된 경우 홈 페이지로 리디렉션
    return <Navigate to="/" replace />;
  }

  // 비인증된 경우 자식 컴포넌트 렌더링
  return children;
};

export default PublicRoute;