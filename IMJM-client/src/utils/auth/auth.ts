export const checkLogin = async (): Promise<"ok" | "notAgreed" | "unauthorized"> => {
  try {
    const response = await fetch("/api/user/check-login", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      return "ok";
    } else if (response.status === 404) {
      return "notAgreed";
    } else {
      return "unauthorized";
    }
  } catch (error) {
    console.error("Login check failed:", error);
    return "unauthorized";
  }
};