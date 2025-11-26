import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import useApiPrivate from "../../hooks/useApiPrivate";
import useOutletSession from "../../hooks/useOutletSession";
import AuthorisedUser from "../../components/AuthorisedUser";
import Loading from "../../components/Loading";
import {
  primaryButtonClass as buttonClass,
  primaryBgClass,
  primaryBgTransparentClass,
  primaryTextClass,
  xButtonClass,
} from "../../styles/tailwind_styles";

const IndividualOutlet = () => {
  const params = useParams();
  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();
  const {
    isOutletAuthorized,
    getOutletStaffInfo,
    addAuthorizedOutlet,
    isSessionValid,
    authorizedOutlets,
    removeAuthorizedOutlet,
    clearAllSessions,
  } = useOutletSession();

  const [loading, setLoading] = useState(false);
  const [outletName, setOutletName] = useState(null);
  const [errors, setErrors] = useState("");
  const [showAuthModalState, setShowAuthModalState] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const outletIds = Object.keys(authorizedOutlets);

  const handleNavigateToOutlet = (outletId) => {
    navigate(`/db/${params.accountId}/outlet/${outletId}`);
  };
  const handleRemoveSession = (outletId, e) => {
    e.stopPropagation(); // Prevent navigation when removing
    removeAuthorizedOutlet(outletId);

    // If no more sessions, close the panel
    if (outletIds.length === 1) {
      console.log("No active sessions");
    }
  };
  const handleAuthModalClose = () => {
    setErrors({ general: "Authorization cancelled." });
    setShowAuthModalState(null);
  };

  useEffect(() => {
    const checkQueueAndRedirect = async () => {
      setLoading(true);
      setErrors("");
      try {
        const res = await apiPrivate.get(
          `queueActivity/${params.accountId}/${params.outletId}`
        );

        if (res?.data?.outlet) {
          setOutletName(res.data.outlet.name);

          const currentOutletData = res.data.outlet;
          const currentQueueData = res.data.queue;

          if (currentQueueData) {
            // --- CHECK IF ALREADY AUTHORIZED ---
            if (
              isOutletAuthorized(params.outletId) &&
              isSessionValid(params.outletId)
            ) {
              // Already authorized - skip auth modal and go directly
              const staffInfo = getOutletStaffInfo(params.outletId);
              console.log("Using existing authorization for outlet");

              setLoading(false);
              navigate(
                `/db/${res.data.outlet.accountId}/outlet/${res.data.outlet.id}/active/${currentQueueData.id}`,
                {
                  replace: true,
                  state: {
                    staffInfo: staffInfo,
                    outletData: currentOutletData,
                    queueData: currentQueueData,
                  },
                }
              );
            } else {
              // Not authorized yet - show auth modal
              const handleAuthSuccess = (staffInfo) => {
                // Store the authorization
                addAuthorizedOutlet(
                  params.outletId,
                  staffInfo,
                  currentOutletData.name
                );

                setLoading(false);
                setShowAuthModalState(null);

                console.log("New authorization granted for outlet");
                navigate(
                  `/db/${res.data.outlet.accountId}/outlet/${res.data.outlet.id}/active/${currentQueueData.id}`,
                  {
                    replace: true,
                    state: {
                      staffInfo: staffInfo,
                      outletData: currentOutletData,
                      queueData: currentQueueData,
                    },
                  }
                );
              };
              setShowAuthModalState({ onSuccess: handleAuthSuccess });
            }
          } else {
            // No active queue - check if authorized before going to inactive
            if (
              isOutletAuthorized(params.outletId) &&
              isSessionValid(params.outletId)
            ) {
              navigate(
                `/db/${res.data.outlet.accountId}/outlet/${res.data.outlet.id}/inactive`,
                {
                  replace: true,
                  state: {
                    outletData: currentOutletData,
                    staffInfo: getOutletStaffInfo(params.outletId),
                  },
                }
              );
            } else {
              // Show auth modal before accessing inactive outlet
              const handleAuthSuccess = (staffInfo) => {
                addAuthorizedOutlet(
                  params.outletId,
                  staffInfo,
                  currentOutletData.name
                );
                setLoading(false);
                setShowAuthModalState(null);

                navigate(
                  `/db/${res.data.outlet.accountId}/outlet/${res.data.outlet.id}/inactive`,
                  {
                    replace: true,
                    state: {
                      outletData: currentOutletData,
                      staffInfo: staffInfo,
                    },
                  }
                );
              };
              setShowAuthModalState({ onSuccess: handleAuthSuccess });
            }
          }
        } else {
          setErrors({ general: "Received invalid outlet data from server." });
          navigate(`/db/${params.accountId}/error`, { replace: true });
        }
      } catch (error) {
        console.error(
          "Error checking queue activity:",
          error.response || error
        );
        // ... existing error handling ...
      } finally {
        setLoading(false);
      }
    };

    if (params.outletId) {
      checkQueueAndRedirect();
    }
  }, [params.accountId, params.outletId, refresh, apiPrivate, navigate]);

  if (loading) {
    return (
      <Loading title={"Loading..."} paragraph={"Please wait while it loads."} />
    );
  }
  if (errors) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${primaryBgTransparentClass} p-10 m-10 rounded-3xl border-5 border-red-800`}
      >
        <h1 className="text-3xl text-red-800 font-semibold ">Error </h1>
        <p className={`font-light text-xl mt-5 ${primaryTextClass}`}>
          Error Message: {errors.general}
        </p>
        <button className={buttonClass} onClick={() => setRefresh(!refresh)}>
          Retry
        </button>
      </div>
    );
  }
  const sessionCount = Object.keys(authorizedOutlets).length;
  return (
    <div className=" md:w-full flex flex-col items-center">
      <div
        className={` md:w-[90%] md:h-[90%]  justify-center rounded-2xl p-5 m-1 ${primaryBgClass} shadow-lg text-left relative my-8 `}
      >
        {sessionCount > 0 && (
          <div
            className={`bg-primary-green rounded-lg  max-w-auto hidden md:absolute md:top-0 md:right-3 md:flex items-center justify-center gap-2 text-xs py-1 px-5 z-10`}
          >
            <i className="fa-solid fa-users text-xs"></i>
            {outletIds.map((outletId) => {
              const session = authorizedOutlets[outletId];

              return (
                <div
                  key={outletId}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-cream dark:bg-stone-700 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-green "
                  onClick={() => handleNavigateToOutlet(outletId)}
                >
                  <span className="text-sm font-medium">
                    {session.outletName || `Outlet ${outletId.substring(0, 8)}`}
                  </span>
                  <button
                    onClick={(e) => handleRemoveSession(outletId, e)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                    title="Remove session"
                  >
                    ×
                  </button>
                </div>
              );
            })}

            <button onClick={clearAllSessions} className="ml-3 underline ">
              <i className="fa-solid fa-trash text-red-700"></i>
            </button>
          </div>
        )}
        {/* Header with outlet name and sessions button */}
        <div className="lg:mb-4 relative">
          <h1 className={`font-semibold text-2xl ${primaryTextClass} mb-2`}>
            {outletName}
          </h1>

          {/* Sessions Button - only show if there are active sessions */}
        </div>

        <Outlet />

        {/* Auth Modal */}
        {showAuthModalState &&
          typeof showAuthModalState === "object" &&
          showAuthModalState.onSuccess && (
            <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
              <div
                className={`${primaryBgClass} ${primaryTextClass} p-6 rounded-lg shadow-xl relative max-w-sm w-full`}
              >
                <button
                  onClick={handleAuthModalClose}
                  className={xButtonClass + " text-2xl"}
                >
                  &times;
                </button>
                <AuthorisedUser
                  onSuccess={showAuthModalState.onSuccess}
                  onFailure={handleAuthModalClose}
                  actionPurpose="STAFF_VERIFIED"
                  minimumRole="TIER_3"
                  outletId={params.outletId}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default IndividualOutlet;
