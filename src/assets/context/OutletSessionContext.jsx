import React, { createContext, useState, useEffect } from "react";

export const OutletSessionContext = createContext();

export const OutletSessionProvider = ({ children }) => {
  // Store authorized sessions: { outletId: { staffInfo, authorizedAt, outletName } }
  const [authorizedOutlets, setAuthorizedOutlets] = useState(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem("authorizedOutlets");
    return stored ? JSON.parse(stored) : {};
  });

  // Persist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "authorizedOutlets",
      JSON.stringify(authorizedOutlets)
    );
  }, [authorizedOutlets]);

  const addAuthorizedOutlet = (outletId, staffInfo, outletName = null) => {
    setAuthorizedOutlets((prev) => ({
      ...prev,
      [outletId]: {
        staffInfo,
        outletName, // <-- ADD THIS
        authorizedAt: new Date().toISOString(),
      },
    }));
  };

  const removeAuthorizedOutlet = (outletId) => {
    setAuthorizedOutlets((prev) => {
      const updated = { ...prev };
      delete updated[outletId];
      return updated;
    });
  };

  const isOutletAuthorized = (outletId) => {
    return !!authorizedOutlets[outletId];
  };

  const getOutletStaffInfo = (outletId) => {
    return authorizedOutlets[outletId]?.staffInfo || null;
  };

  const clearAllSessions = () => {
    setAuthorizedOutlets({});
    localStorage.removeItem("authorizedOutlets");
  };

  // Auto-expire sessions after a certain time (e.g., 8 hours)
  const isSessionValid = (outletId, maxAgeHours = 8) => {
    const session = authorizedOutlets[outletId];
    if (!session) return false;

    const authorizedAt = new Date(session.authorizedAt);
    const now = new Date();
    const hoursDiff = (now - authorizedAt) / (1000 * 60 * 60);

    return hoursDiff < maxAgeHours;
  };

  return (
    <OutletSessionContext.Provider
      value={{
        authorizedOutlets,
        addAuthorizedOutlet,
        removeAuthorizedOutlet,
        isOutletAuthorized,
        getOutletStaffInfo,
        clearAllSessions,
        isSessionValid,
      }}
    >
      {children}
    </OutletSessionContext.Provider>
  );
};
export default OutletSessionContext;
