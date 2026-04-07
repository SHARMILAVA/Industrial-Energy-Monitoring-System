import api from "./api";

const TOKEN_KEY = "iot_token";
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export const login = async (payload) => {
  if (DEMO_MODE) {
    localStorage.setItem(TOKEN_KEY, "demo-token");
    return { token: "demo-token", role: "admin", email: payload?.email };
  }
  const { data } = await api.post("/api/auth/login", payload);
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "/login";
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
