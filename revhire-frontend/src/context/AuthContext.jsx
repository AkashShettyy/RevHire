import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("revhire-user")) || null,
  );
  const [token, setToken] = useState(
    localStorage.getItem("revhire-token") || null,
  );

  function login(userData, tokenData) {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("revhire-user", JSON.stringify(userData));
    localStorage.setItem("revhire-token", tokenData);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("revhire-user");
    localStorage.removeItem("revhire-token");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
