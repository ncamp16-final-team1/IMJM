export const checkLogin = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/user/check-login", {
        method: "GET",
        credentials: "include", // 쿠키 포함
      });
      return response.ok;
    } catch (error) {
      console.error("Login check failed:", error);
      return false;
    }
  };