import { useContext } from "react";
import { OutletSessionContext } from "../context/OutletSessionContext";

const useOutletSession = () => {
  const context = useContext(OutletSessionContext);
  if (!context) {
    throw new Error(
      "useOutletSession must be used within OutletSessionProvider"
    );
  }
  return context;
};

export default useOutletSession;
