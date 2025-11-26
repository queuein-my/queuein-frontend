import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiPrivate } from "../api/axios";
import Loading from "../components/Loading";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [businessType, setBusinessType] = useState(""); //Kinda useless but let's just keep it for now
  const [acctSlug, setAcctSlug] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [reloadNav, setReloadNav] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const refresh = useCallback(async () => {
    console.log("Trying to refresh within auth context: ", location.pathname);

    if (location.pathname.includes("/register")) {
      return null;
    }

    try {
      const response = await apiPrivate.post("/refresh");
      setAuthLoading(true);
      console.log(
        "Response in refresh: ",
        JSON.stringify(response.data.message)
      );
      if (response.data.accessToken) {
        setBusinessType(response.data.businessType);
        setAccessToken(response.data.accessToken);
        setAcctSlug(response.data.acctSlug);
        setIsAuthenticated(true);
        setAccountId(response.data.accountId);
        return response.data.accessToken;
      } else {
        console.log(
          "Positive response of data but no access token, so logout "
        );
        logout();
        navigate("/db/login", { replace: true });
        return null;
      }
    } catch (error) {
      console.log("No access token");
      console.error("Error during refresh token request:", error);
      logout();
      navigate("/db/login", { replace: true });
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const login = useCallback(
    (data) => {
      setAccessToken(data.accessToken);
      setBusinessType(data.businessType);
      setAccountId(data.accountId);
      setAcctSlug(data.acctSlug);
      setIsAuthenticated(true);
      navigate(`/db/${data.accountId}/outlets/all`, { replace: true });
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      const response = await apiPrivate.post(`/logout/${accountId}`);
      if (response.status === 200 || response.status === 204) {
        console.log("Logout successfully.");
      }
    } catch (error) {
      console.error("Error logging out: ", JSON.stringify(error));
    } finally {
      setIsAuthenticated(false);
      setAccessToken(null);
      setBusinessType("");
      setAccountId(null);
    }
  }, [navigate]);

  useEffect(() => {
    console.log("There are changes in the reload nav! ", reloadNav);
  }, [reloadNav]);

  useEffect(() => {
    console.log("Business type changed to: ", businessType);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refresh();
      } catch (error) {
        console.log("Initial auth check failed", error);
        setIsAuthenticated(false);
        setAccessToken(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [refresh]);

  const contextValue = useMemo(
    () => ({
      accessToken,
      acctSlug,
      businessType,
      login,
      logout,
      refresh,
      isAuthenticated,
      accountId,
      updateAccessToken: setAccessToken,
      updateIsAuthenticated: setIsAuthenticated,
      updateAccount: setAccountId,
      reloadNav,
      setReloadNav: () => setReloadNav((prev) => !prev),
    }),
    [
      accessToken,
      isAuthenticated,
      login,
      logout,
      accountId,
      reloadNav,
      acctSlug,
      businessType,
    ]
  );
  if (authLoading) {
    return (
      <Loading
        title={"Previous login"}
        paragraph={"Please wait for the loading to end."}
      />
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
