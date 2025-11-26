import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import SocketContext from "../../context/SocketContext";
import useApiPrivate from "../../hooks/useApiPrivate";
import useAuth from "../../hooks/useAuth";
import AuthorisedUser from "../../components/AuthorisedUser";
import useToast from "../../hooks/useToast";
import PermissionNotification from "../../components/PermissionNotification";
import NotificationModal from "../../components/NotificationModal";
import {
  primaryButtonClass as buttonClass,
  primaryTextClass,
  primaryBgClass,
} from "../../styles/tailwind_styles";
import { useBusinessType } from "../../hooks/useBusinessType";
import CustomerForm from "../../components/CustomerForm";
import QueueList from "../../components/QueueList";
import UpdateMaxQueuersModal from "../../components/UpdateMaxQueuersModal";

const ActiveOutlet = () => {
  const { socket, isConnected } = useContext(SocketContext);
  const { isAuthenticated, accountId, acctSlug } = useAuth();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();
  const toast = useToast();
  const { staffInfo } = location.state || {};
  const { config } = useBusinessType();

  const [activeQueue, setActiveQueue] = useState(true);

  const [queue, setQueue] = useState({});
  const [showPax, setShowPax] = useState(false);
  const [queueItems, setQueueItems] = useState([]);
  const [maxQueueItems, setMaxQueueItems] = useState(0);
  const [lg, setLg] = useState(false);
  const [createCustomerModal, setCreateCustomerModal] = useState(false);
  const [maxQueuersModal, setMaxQueuersModal] = useState(false);
  const [notification, setNotification] = useState(false);
  const [notice, setNotice] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [errors, setErrors] = useState("");
  const [currentTime, setCurrentTime] = useState(moment());
  const [highlightedItem, setHighlightedItem] = useState(null);

  const activeItems = useMemo(
    () => (queueItems || []).filter((item) => item.active === true),
    [queueItems]
  );

  const inactiveItems = useMemo(
    () =>
      (queueItems || []).filter(
        (item) => item.active === false && item.quit === false
      ),
    [queueItems]
  );

  const quitItems = useMemo(
    () =>
      (queueItems || []).filter(
        (item) => item.active === false && item.quit === true
      ),
    [queueItems]
  );

  const [updateMaxQueueItemsModal, setUpdateMaxQueueItemsModal] =
    useState(false);
  const [endQueueErrorModal, setEndQueueErrorModal] = useState(false);
  const [openNotifModal, setOpenNotifModal] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    Notification.permission
  );
  //HELPER FUNCTION
  const convertedTime = (date) => {
    const mDate = moment(date);
    const diffSeconds = currentTime.diff(mDate, "seconds");
    if (diffSeconds < 0 && Math.abs(diffSeconds) < 10) {
      return "just now";
    }
    return mDate.from(currentTime);
  };

  //TAILWIND CLASSES:
  const activeTableHeader = `text-xs text-primary-dark-green dark:text-primary-light-green md:mr-5 mr-3 ml-2`;
  const activeTableAnswer = `flex items-center justify-center text-sm `;
  const landscapeHeaderClass = `border-l-1 border-t-1 border-b-1 border-r-1 border-primary-green p-1 `;
  const buttonClassInModals = `mt-3 transition ease-in text-white bg-primary-green cursor-pointer font-light py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline min-w-20 hover:bg-primary-dark-green`;
  const errorButtonInModals = `mt-3 transition ease-in text-white bg-red-700 cursor-pointer font-light py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline min-w-20 hover:bg-red-900`;
  const horizontalHeaderClass = `bg-white dark:bg-stone-700 text-primary-dark-green dark:text-primary-light-green `;

  const getWaitingTimeClass = useCallback(
    (date) => {
      const createdAt = moment(date);
      const minutesWaited = currentTime.diff(createdAt, "minutes");
      if (minutesWaited >= 20) {
        return " text-red-500";
      } else if (minutesWaited >= 10) {
        return " text-orange-500";
      } else {
        return " ";
      }
    },
    [currentTime]
  );
  const getCalledTimeClass = useCallback(
    (date) => {
      if (date === null) {
        return "";
      } else {
        const calledAt = moment(date);
        const minutesCalled = currentTime.diff(calledAt, "minutes");
        if (minutesCalled >= 10) {
          return " text-red-500";
        } else if (minutesCalled >= 5) {
          return " text-orange-500";
        } else {
          return " ";
        }
      }
    },
    [currentTime]
  );

  //SETTING TIMER FOR UPDATING THE WAITING TIME
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(moment());
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  //INITIALIZE DATA
  useEffect(() => {
    if (!isAuthenticated) return;
    if (staffInfo) {
      console.log("Staff info has been set: ", staffInfo);
      setShowAuthModal(false);
    } else {
      //When user has left off
      navigate(`/db/${accountId}/outlet/${params.outletId}`, { replace: true });
    }
    setOpenNotifModal(true);
    const activeQueueItems = async () => {
      try {
        const res = await apiPrivate.get(
          `activeQueue/${params.accountId}/${params.queueId}/${params.outletId}`
        );
        if (res?.data) {
          console.log("Data from active queue fetch: ", res.data.queue);
          setQueueItems(res.data.queue.queueItems);
          setShowPax(res.data.showPax);
          setMaxQueueItems(res.data.queue.maxQueueItems);
          setQueue(res.data.queue);
        }
      } catch (error) {
        if (error.response.status === 406) {
          console.log("Max number of queue items allowed has been reached.");
        }
        console.error(error);
        console.log("Error in trying to fetch active queue data");
      }
    };
    activeQueueItems();
  }, [isAuthenticated, params.queueId, apiPrivate, params.outletId]);
  useEffect(() => {
    setShowPax(false); // Reset to default value
  }, [params.queueId, params.outletId]);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleMediaQueryChange = (e) => setLg(e.matches);
    setLg(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () =>
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  //HANDLE INTERACTION FOR NOTIFICATIONS
  //* HANDLE INTERACTION
  const handleUserInteraction = () => {
    if (!userInteracted) {
      const silentAudio = new Audio("/Ding.mp3");
      silentAudio.volume = 0;
      silentAudio
        .play()
        .catch((e) => console.error("Audio playback failed: ", e));
      setUserInteracted(true);
    }
  };
  //HANDLE USER INTERACTIONS
  useEffect(() => {
    setNotificationPermission(Notification.permission);
    document.addEventListener("click", handleUserInteraction, { once: true });
    document.addEventListener("touchstart", handleUserInteraction, {
      once: true,
    });
    document.addEventListener("keydown", handleUserInteraction, { once: true });
    document.addEventListener("scroll", handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleUserInteraction, {
        once: true,
      });
      document.removeEventListener("touchstart", handleUserInteraction, {
        once: true,
      });
      document.removeEventListener("keydown", handleUserInteraction, {
        once: true,
      });
      document.removeEventListener("scroll", handleUserInteraction, {
        once: true,
      });
    };
  }, [userInteracted]);
  //HANDLE NOTIFICATIONS
  useEffect(() => {
    if (!("Notification" in window)) {
      toast.open(
        "Your browser does not support notifications. We will not be able to notify you.",
        {
          type: "info",
          duration: null,
          sticky: true,
          id: "browser-notfi-unsupported",
        }
      );
    } else if (notificationPermission === "granted") {
      toast.open(
        "Notifications are active. We will notify you of your customers actions.",
        {
          type: "success",
          duration: 5000,
          sticky: false,
          id: "notif-perms-allowed",
        }
      );
    } else if (notificationPermission === "denied") {
      toast.open(PermissionNotification, {
        type: "info",
        duration: null,
        sticky: true,
        id: "notif-perms-denied",
      });
    } else if (notificationPermission === "default") {
      toast.open(PermissionNotification, {
        type: "info",
        duration: null,
        sticky: true,
        id: "notif-perms-default",
      });
    }
  }, [notificationPermission, toast.open]);
  //SOCKET HERE
  //EMIT
  useEffect(() => {
    if (socket && isConnected) {
      // socket.emit("join_queue", `queue_${params.queueId}`);
      const infoForSocket = {
        staffId: staffInfo.staffId,
        staffRole: staffInfo.staffRole,
        staffName: staffInfo.staffName,
        outletId: params.outletId,
        accountId: params.accountId,
        queueId: params.queueId,
      };
      socket.emit("set_staff_info", infoForSocket);
      socket.emit("join_host", `host_${params.queueId}`);
    }
  }, [socket, isConnected, params.outletId, params.accountId, params.queueId]);
  //LISTEN
  useEffect(() => {
    if (socket && isConnected) {
      const alert = (header, body, soundEffect) => {
        console.log("when alert: ", header, body);
        if ("Notification" in window && Notification.permission === "granted") {
          const audio = new Audio(soundEffect);
          audio
            .play()
            .catch((e) => console.error("Audio playback failed: ", e));
          new Notification(header, {
            body: body,
            vibrate: [200, 100],
          });
        }
      };

      const handleHostQueueUpdate = (data) => {
        if (data) {
          const newQueueItems = data.queueItems;
          setQueueItems(newQueueItems);
          console.log("Data notice: ", data.notice);

          if (data.notice && data.notice.action) {
            if (data.notice.action === "pax") {
              console.log(
                "Data notice action is pax: ",
                data.notice.queueItemId
              );
              const newQueueItem = newQueueItems.filter(
                (item) => item.id === data.notice.queueItemId
              );
              if (newQueueItem.length > 0) {
                alert(
                  "There is a pax change",
                  `${newQueueItem[0].name} has changed pax to ${newQueueItem[0].pax} `,
                  "/Ding.mp3"
                );
              } else {
                console.warn("Updated item not found in the new queue list.");
              }
              setHighlightedItem(data.notice.queueItemId);
              setTimeout(() => {
                setHighlightedItem(null);
              }, 120000);
            } else if (data.notice.action === "join") {
              console.log("someone joined queue", data.notice);
              const newQueueItem = newQueueItems.filter(
                (item) => item.id === data.notice.queueItemId
              );
              if (newQueueItem.length > 0) {
                alert(
                  "New Customer has Joined the Queue!",
                  `${newQueueItem[0].name} has joined with ${newQueueItem[0].pax} pax`,
                  "/Success.mp3"
                );
              }
            } else if (data.notice.action === "quit") {
              console.log("Someone quit the queue", data.notice);
              const newQueueItem = newQueueItems.filter(
                (item) => item.id === data.notice.queueItemId
              );
              if (newQueueItem) {
                alert(
                  "Customer has quit the queue.",
                  `${newQueueItem[0].name} has left the queue.`,
                  "/FailSound.mp3"
                );
              }
            } else if (data.notice.action === "noShow") {
              const newQueueItem = newQueueItems.filter(
                (item) => item.id === data.notice.queueItemId
              );
              console.log(`We set customer ${newQueueItem.name} as no show.`);
            } else if (data.notice.action === "updateMaxQueuers") {
              if (typeof data.notice.maxQueueItems === "number") {
                setMaxQueueItems(parseInt(data.notice.maxQueueItems));
                console.log("Prev queue: ", queue);
                setQueue((prev) => ({
                  ...prev,
                  maxQueueItems: data.notice.maxQueueItems,
                }));

                toast.open(
                  `Maximum number of queuers updated to ${data.notice.maxQueueItems}.`,
                  {
                    type: "info",
                    duration: 2000,
                    sticky: false,
                    id: "max-queue-items-updated",
                  }
                );
              }
            }
          }
        }
      };

      socket.on("host_queue_update", handleHostQueueUpdate);
      socket.on("host_update", handleHostQueueUpdate);
      return () => {
        socket.off("host_queue_update");
        socket.off("host_update");
      };
    }
  }, [socket, isConnected, params.outletId, params.accountId, params.queueId]);

  //HANDLES
  const handleAddCustomer = useCallback(
    (e) => {
      e.preventDefault();
      console.log(
        "Max queue items and queueitems length: ",
        maxQueueItems,
        queueItems ? queueItems.length : 0
      );
      if (queueItems && queueItems.length >= maxQueueItems) {
        setMaxQueuersModal(true);
      } else {
        setCreateCustomerModal(true);
      }
    },
    [maxQueueItems, queueItems]
  );
  const handleCalled = useCallback(
    async (e, id) => {
      const newCalledStatus = e.target.checked;
      setQueueItems((prevItems) =>
        prevItems.map((item) => {
          return item.id === id ? { ...item, called: newCalledStatus } : item;
        })
      );

      try {
        const res = await apiPrivate.patch(`/callQueueItem/${id}`, {
          called: newCalledStatus,
        });

        if (res?.status === 201) {
          console.log("Call status updated on backend.");
        } else {
          setQueueItems((prevItems) =>
            prevItems.map((item) => {
              return item.id === id
                ? { ...item, called: !newCalledStatus }
                : item;
            })
          );
          console.error("Failed to update call status on backend.");
        }
      } catch (error) {
        console.error(error);
        setQueueItems((prevItems) =>
          prevItems.map((item) => {
            return item.id === id
              ? { ...item, called: !newCalledStatus }
              : item;
          })
        );
        console.error("Error updating call status.");
      }
    },
    [apiPrivate, socket, params.queueId]
  );
  const handleSeated = useCallback(
    async (e, id) => {
      const newSeatedStatus = e.target.checked;
      setQueueItems((prevItems) =>
        prevItems.map((item) => {
          return item.id === id ? { ...item, seated: newSeatedStatus } : item;
        })
      );

      try {
        const res = await apiPrivate.patch(`/seatQueueItem/${id}`, {
          seated: newSeatedStatus,
        });

        // The patch here also calls the emit from the backend, we don't need to do socket emit from the front end.

        if (res?.status === 201) {
          console.log("Call status updated on backend.");
        } else {
          setQueueItems((prevItems) =>
            prevItems.map((item) => {
              return item.id === id
                ? { ...item, seated: !newSeatedStatus }
                : item;
            })
          );
          console.error("Failed to update call status on backend.");
        }
      } catch (error) {
        console.error(error);
        setQueueItems((prevItems) =>
          prevItems.map((item) => {
            return item.id === id
              ? { ...item, seated: !newSeatedStatus }
              : item;
          })
        );
        console.error("Error updating call status.");
      }
    },
    [apiPrivate, socket, params.queueId]
  );
  const handleAuthModalClose = () => {
    setErrors({ general: "Forbidden" });
    setShowAuthModal(false);
    //Navigate -1 ?
  };
  const handleEndQueue = () => {
    console.log("Trying to handle end queue", queueItems);
    queueItems.forEach((item) => {
      if (!item.seated && !item.noShow) {
        setEndQueueErrorModal(true);
        setShowAuthModal(false);
      } else {
        setEndQueueErrorModal(false);
        setShowAuthModal(true);
      }
    });
    setErrors("");
    if (maxQueuersModal === true) {
      setMaxQueuersModal(false);
    }
  };
  const endQueueAllowed = async () => {
    try {
      const res = await apiPrivate.post(
        `/endQueue/${accountId}/${params.outletId}/${params.queueId}`
      );
      console.log(res.data);
      if (res.status === 201) {
        setActiveQueue(false);
        //? Also, emit a socket event to inform others that the queue has ended. Do we want to do queue ended here, or should we do queue ended from the backend?
        socket.emit("queue_ended", res.data.queueId);
        navigate(`/db/${res.data.queueId}/outlet/${res.data.outletId}`, {
          replace: true,
        });
      } else {
        setErrors({ general: `Error ending queue ${params.queueId}` });
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: `Error ending queue ${params.queueId}` });
    } finally {
      setShowAuthModal(false);
    }
  };
  const handleRefresh = () => {
    socket.emit("queue_update", `${params.queueId}`);
  };
  const handleNoShow = useCallback(
    async (e, id) => {
      const newNoShowStatus = e.target.checked;

      try {
        const res = await apiPrivate.patch(`/noShowQueueItem/${id}`, {
          noShow: !!newNoShowStatus,
        });
        if (res?.status === 201) {
          console.log("no show status updated on backend.");
        } else {
          console.error("Failed to update no show status on backend.");
        }
      } catch (error) {
        console.error(error);
        console.error("Error updating no show status.");
      }
    },
    [apiPrivate, socket, params.queueId]
  );
  const handleUpdateMaxQueueItems = async (newMaxValue) => {
    try {
      const res = await apiPrivate.patch(`/maxQueueItems/${queue.id}`, {
        maxQueueItems: newMaxValue,
      });

      if (res?.status === 201) {
        setQueue((prev) => ({ ...prev, maxQueueItems: newMaxValue }));
        setUpdateMaxQueueItemsModal(false);
        toast.open(`Maximum number of queuers updated to ${newMaxValue}.`, {
          type: "success",
          duration: 2000,
          id: "max-queue-items-updated-success",
        });
      } else {
        console.error("Failed to update max queuers on backend.");
      }
    } catch (error) {
      console.error(error);
      toast.open("An unexpected error occurred.", { type: "error" });
    }
  };
  const handleMaxQueuers = () => {
    console.log("Maximum number of queuers have been created for this queue");
    setNotice(
      "You can no longer add queuers as the maximum number of queuers have been reached"
    );
    setNotification(true);
    setMaxQueuersModal(true);
  };
  const handleCreateCustomerSuccess = (data) => {
    handleRefresh(); // This emits a socket event to refresh the list
    setNotice(
      data.message ||
        `Successfully created new ${config.customerSingularLabel}.`
    );
    setNotification(true);
    setCreateCustomerModal(false);
  };

  const handleCreateCustomerFailure = (error) => {
    if (error.response?.status === 406) {
      handleMaxQueuers();
      setCreateCustomerModal(false);
    } else {
      // Optionally, show a generic error toast for other failures
      toast.open(
        error.response?.data?.message || "Failed to create customer.",
        { type: "error" }
      );
      console.error("Failed to create customer:", error);
    }
  };
  const handleNavKioskView = useCallback((e) => {
    e.preventDefault();
    console.log("This is the account slug", acctSlug);
    window.open(
      `${window.location.origin}/${acctSlug}/outlet/${params.outletId}/kiosk/${params.queueId}`
    );
  }, []);

  if (openNotifModal) {
    return (
      <NotificationModal
        title={`Hi ${staffInfo.staffName}!`}
        paragraph={`You have successfully logged in.`}
        onClose={() => {
          setOpenNotifModal(false);
        }}
      />
    );
  }

  if (endQueueErrorModal) {
    return (
      <NotificationModal
        title={`Error Ending Queue`}
        onClose={() => {
          setEndQueueErrorModal(false);
        }}
        content={
          <div className="text-center">
            <div className="font-semibold italic text-red-800 text-sm">
              Some {config.customerSingularLabel}/s are neither marked as No
              Show nor Seated.
            </div>
            <ul className="mt-2">
              {(queueItems || []).map((item) => {
                if (!item.noShow && !item.seated) {
                  return (
                    <li key={item.id} className="text-xs">
                      <span className="font-bold text-primary-green p-2 text-lg">
                        {item.name}
                      </span>{" "}
                      is NOT marked as No Show nor {config.status.SEATED}.
                    </li>
                  );
                }
              })}
            </ul>
          </div>
        }
        classNameDiv="max-w-md"
      />
    );
  }

  if (maxQueuersModal === true) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 ">
        <div
          className={`flex flex-col items-center ${primaryBgClass} dark:text-white p-10 rounded-3xl m-2 max-w-[460px] text-center`}
        >
          <h1 className="text-2xl font-semibold text-center">Max queuers</h1>
          <p className="mt-3 font-light">
            You have reached the <span className="font-bold">maximum</span>{" "}
            number of queuers allowed in this queue.
          </p>
          <br />
          <div className="flex gap-3">
            <button
              className={buttonClassInModals}
              onClick={() => {
                setUpdateMaxQueueItemsModal(true);
                setMaxQueuersModal(false);
              }}
            >
              Change Max Queuers Allowed
            </button>
            <button
              className={errorButtonInModals}
              onClick={() => setMaxQueuersModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {notification && (
        <p className="text-primary-green light text-xs">{notice}</p>
      )}
      {activeQueue && (
        <button
          className={
            buttonClass +
            " bg-red-700 border-1 border-red-500 hover:bg-red-900 fixed top-0 right-3  lg:block mr-3 max-w-[180px]"
          }
          onClick={handleEndQueue}
        >
          <i className="fa-solid fa-ban"></i>{" "}
          <span className="pl-3">End Queue</span>
        </button>
      )}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl relative max-w-sm w-full">
            <button
              onClick={handleAuthModalClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              &times;
            </button>
            <AuthorisedUser
              onSuccess={endQueueAllowed}
              onFailure={handleAuthModalClose}
              actionPurpose="QUEUE_CLOSED"
              minimumRole="TIER_3"
              outletId={params.outletId}
            />
          </div>
        </div>
      )}

      {updateMaxQueueItemsModal && (
        <UpdateMaxQueuersModal
          isOpen={updateMaxQueueItemsModal}
          onClose={() => setUpdateMaxQueueItemsModal(false)}
          onUpdate={handleUpdateMaxQueueItems}
          currentMax={queue.maxQueueItems}
          currentQueueSize={(queueItems || []).length}
        />
      )}
      {createCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div
            className={`relative ${primaryBgClass} ${primaryTextClass} p-6 rounded-lg shadow-xl max-w-md`}
          >
            <p
              className="absolute top-2 right-4 text-xl font-bold cursor-pointer hover:text-red-700"
              onClick={() => setCreateCustomerModal(false)}
            >
              &times;
            </p>
            <h1 className="text-2xl pb-4 text-center">
              Create New {config.customerSingularLabel}
            </h1>
            <CustomerForm
              apiClient={apiPrivate}
              apiEndpoint={`/newCustomer/${params.queueId}`}
              onSuccess={handleCreateCustomerSuccess}
              onFailure={handleCreateCustomerFailure}
              showPax={showPax}
              requirePdpa={false} // Staff are not required to check this
              submitButtonText={`Create ${config.customerSingularLabel}`}
              additionalData={{
                accountId: params.accountId,
                createdByStaffId: staffInfo?.staffId,
              }}
            />
          </div>
        </div>
      )}
      {!updateMaxQueueItemsModal && !createCustomerModal && (
        <div
          className={` ${primaryTextClass} lg:p-5 rounded-lg mb-5 md:ring-1 md:ring-primary-green/30`}
        >
          <div className="flex  justify-between items-center mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                {(queueItems || []).length}
                <span className="font-light"> / {queue.maxQueueItems}</span>
                <span className="block sm:inline sm:ml-2">
                  {config.customerLabel} in Queue
                </span>
              </div>
              <button
                className="text-xs hover:text-primary-green border-1 px-3 py-2 rounded"
                onClick={() => setUpdateMaxQueueItemsModal(true)}
              >
                Change Max
              </button>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                className={
                  "bg-primary-green hover:bg-primary-dark-green md:max-w-[200px] border-1 border-primary-light-green transition ease-in text-white font-light py-2 px-4 rounded focus:outline-none focus:shadow-outline text-center"
                }
                onClick={handleAddCustomer}
              >
                + Add {config.customerSingularLabel}
              </button>
              <button
                className={
                  "bg-primary-green hover:bg-primary-dark-green md:max-w-[200px] border-1 border-primary-light-green transition ease-in text-white font-light py-2 px-4 rounded focus:outline-none focus:shadow-outline text-center"
                }
                onClick={handleNavKioskView}
              >
                Kiosk View
              </button>
            </div>
          </div>

          {queueItems && queueItems.length > 0 ? (
            <QueueList
              activeItems={activeItems}
              inactiveItems={inactiveItems}
              quitItems={quitItems}
              isLandscape={lg}
              showPax={showPax}
              config={config}
              onCall={handleCalled}
              onSeat={handleSeated}
              onNoShow={handleNoShow}
              getWaitingTimeClass={getWaitingTimeClass}
              getCalledTimeClass={getCalledTimeClass}
              convertedTime={convertedTime}
              highlightedItem={highlightedItem}
              primaryTextClass={primaryTextClass}
              horizontalHeaderClass={horizontalHeaderClass}
              landscapeHeaderClass={landscapeHeaderClass}
              activeTableHeader={activeTableHeader}
              activeTableAnswer={activeTableAnswer}
            />
          ) : (
            <div className="mt-3 font-semibold italic text-primary-dark-green dark:text-primary-light-green">
              There are no {config.customerSingularLabel} in queue yet...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveOutlet;
