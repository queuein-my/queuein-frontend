import React, { useCallback, useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import api from "../../api/axios";
import useSocket from "../../hooks/useSocket";
import useToast from "../../hooks/useToast";
import useQueueSession from "../../hooks/useQueueSession";
import PermissionNotification from "../../components/PermissionNotification";
import useLSContext from "../../hooks/useLSContext";
import NotificationModal from "../../components/NotificationModal";
import {
  primaryBgClass,
  primaryTextClass,
  secondaryTextClass,
  primaryButtonClass as buttonClass,
} from "../../styles/tailwind_styles";
import { initializeApp } from "firebase/app";
import { onMessage, getToken, getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC88qAilHqJD0XdOlSvwtNZfNwtVq27FR8",
  authDomain: "queue-in-88.firebaseapp.com",
  projectId: "queue-in-88",
  storageBucket: "queue-in-88.firebasestorage.app",
  messagingSenderId: "838543402509",
  appId: "1:838543402509:web:49d93e3110439443961744",
  measurementId: "G-PL0TKQ8XLD",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const Waiting = () => {
  //* useStuff
  const navigate = useNavigate();
  const { queueData, isLoadingSession } = useQueueSession();
  const { socket, isConnected, reconnect } = useSocket();
  const { setActiveQueueSession } = useLSContext();
  const toast = useToast();

  const [accountInfo, setAccountInfo] = useState("");
  const [outlet, setOutlet] = useState("");
  const [queueItem, setQueueItem] = useState(null);
  const [queueItemSecret, setQueueItemSecret] = useState(null);
  const [customer, setCustomer] = useState("");
  const [pax, setPax] = useState("");
  const [newPax, setNewPax] = useState("");
  const [message, setMessage] = useState("");
  const [currentlyServing, setCurrentlyServing] = useState("");
  const [customerPosition, setCustomerPosition] = useState("");
  const [calledTimeElapsed, setCalledTimeElapsed] = useState("");
  const [reminderModal, setReminderModal] = useState(false);

  //ewt = estimated wait time
  const [ewt, setEwt] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dataLoaded, setDataLoaded] = useState(false);
  const [modalUpdate, setModalUpdate] = useState(false);
  const [modalLeave, setModalLeave] = useState(false);
  const [modalCalled, setModalCalled] = useState(false);
  const [calledSoundPlayed, setCalledSoundPlayed] = useState(false);
  const [barType, setBarType] = useState("");
  const [progressBar, setProgressBar] = useState("");
  const [partiesAhead, setPartiesAhead] = useState("");
  const [pendingAudioAlerts, setPendingAudioAlerts] = useState([]);
  const [positionNotification, setPositionNotification] = useState(null);

  //Queue Item Status
  const [thirdAlerted, setThirdAlerted] = useState(false);
  const [secondAlerted, setSecondAlerted] = useState(false);
  const [firstAlerted, setFirstAlerted] = useState(false);
  const [inactive, setInactive] = useState(false);
  const [seated, setSeated] = useState(false);
  const [quit, setQuit] = useState(false);
  const [noShow, setNoShow] = useState(false);

  //REF FOR AUDIO
  const audioRef = useRef(null);
  const audioQueueRef = useRef([]); // FIFO queue of soundFile strings
  const isPlayingRef = useRef(false);
  const lastPlayingSrcRef = useRef(null);

  //PERMISSION FOR NOTIFICATION
  const [openNotifModal, setOpenNotifModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    Notification.permission
  );
  const [userInteracted, setUserInteracted] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [subscriptionAttempted, setSubscriptionAttempted] = useState(false);

  //* Helper functions
  const formatLastUpdated = (date) => {
    return moment(date).fromNow();
  };
  const calculateEstWaitTime = (custPos, currServ, estWaitTime) => {
    const inMs = (custPos - currServ + 1) * estWaitTime;
    const inMins = inMs / 1000 / 60;
    return inMins;
  };

  //* Tailwind class
  const labelClass = `text-gray-500 text-sm `;
  const dotClass = "animate-pulse bg-stone-800 w-1 h-1 rounded-full";
  const youClass =
    "bg-primary-light-green text-white text-xs text-center min-w-10 h-full flex items-center justify-center border-r-1 border-stone-100";
  const dotBGClass = "bg-stone-200 flex rounded-r w-full items-center h-full";
  const progBarClass =
    "flex w-full max-w-md justify-self-center mt-3 items-center h-[25px]";

  //* INSTANTIATE
  useEffect(() => {
    if (queueData && !isLoadingSession) {
      setOpenNotifModal(true);
      setAccountInfo(queueData.accountInfo);
      setOutlet(queueData.outlet);
      setQueueItem(queueData.queueItem);
      setQueueItemSecret(queueData.queueItem.secretToken);
      setCustomer(queueData.customer);
      setCurrentlyServing(queueData.currentlyServing);
      if (queueData.queueItem.called) {
        setModalCalled(true);
        const calledAt = moment(queueData.queueItem.calledAt).format(
          "dddd, MMMM Do YYYY, h:mm:ss a"
        );
        setCalledTimeElapsed(calledAt);
        setPendingAudioAlerts(["/AlertSound.mp3"]);
      }
      setMessage(queueData.message);
      setCustomerPosition(queueData.queueItem.position);
      setLastUpdated(new Date());
      setPax(queueData.queueItem.pax);
      setEwt(queueData.outlet.defaultEstWaitTime);
      setProgressBar(queueData.queueList.arr);
      setBarType(queueData.queueList.type);
      setPartiesAhead(queueData.queueList.partiesAhead);
      setDataLoaded(true);
    }
  }, [queueData, isLoadingSession]);
  //* AUDIO SETUP
  useEffect(() => {
    const a = new Audio();
    audioRef.current = a;

    const onPlaying = () => {
      isPlayingRef.current = true;
      lastPlayingSrcRef.current = a.src || null;
    };
    const onEnded = () => {
      isPlayingRef.current = false;
      lastPlayingSrcRef.current = null;
      const next = audioQueueRef.current.shift();
      if (next && a) {
        setTimeout(() => {
          a.src = next;
          a.currentTime = 0;
          a.play().catch((e) => {
            console.error("Audio playback failed for queued item:", e);
            isPlayingRef.current = false;
            lastPlayingSrcRef.current = null;
          });
        }, 50);
      }
    };
    const onError = () => {
      isPlayingRef.current = false;
      lastPlayingSrcRef.current = null;
    };

    a.addEventListener("playing", onPlaying);
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);

    return () => {
      a.pause();
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
      audioRef.current = null;
      audioQueueRef.current = [];
    };
  }, []);

  //* PLAY SOUND FUNCTION
  const playSound = useCallback(
    (soundFile) => {
      console.log(
        "playSound called with:",
        soundFile,
        "userInteracted:",
        userInteracted
      );

      // If user hasn't interacted yet, keep in the pending list (append)
      if (!userInteracted) {
        console.log("User not interacted, queueing pending alert:", soundFile);
        setPendingAudioAlerts((prev) => {
          // avoid duplicates in pending list
          if (prev.includes(soundFile)) return prev;
          return [...prev, soundFile];
        });
        return;
      }

      // If we have an audio instance, use it (serialized). Otherwise fallback to one-shot.
      const a = audioRef.current;
      if (!a) {
        const tmp = new Audio(soundFile);
        tmp
          .play()
          .catch((e) => console.error("Audio playback failed (fallback): ", e));
        return;
      }

      const currentlyPlayingSrc = lastPlayingSrcRef.current || a.src || "";
      const sameAsPlaying =
        currentlyPlayingSrc && currentlyPlayingSrc.includes(soundFile);

      if (isPlayingRef.current) {
        if (sameAsPlaying) {
          console.log("Skipping duplicate audio (already playing):", soundFile);
          return;
        }
        // Different audio is playing -> enqueue (avoid duplicate enqueues)
        if (!audioQueueRef.current.includes(soundFile)) {
          audioQueueRef.current.push(soundFile);
          console.log("Enqueued audio:", soundFile);
        } else {
          console.log("Audio already queued, not adding:", soundFile);
        }
        return;
      }

      // Nothing is playing -> play immediately
      try {
        a.src = soundFile;
        a.currentTime = 0;
        a.play().catch((e) => {
          console.error("Audio playback failed: ", e);
          isPlayingRef.current = false;
          lastPlayingSrcRef.current = null;
        });
      } catch (e) {
        console.error("Error starting audio playback: ", e);
      }
    },
    [userInteracted]
  );

  //* REQUEST AND SEND FCM TOKEN
  const requestAndSendFCMToken = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/",
        }
      );
      if (registration) {
        console.log("Service worker registered: ", registration.scope);
      }
      await navigator.serviceWorker.ready;

      const vapidKey = import.meta.env.VITE_VAPID_KEY;
      const token = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log("FCM Token received:", token);
        setFcmToken(token);
        if (!queueItemSecret) {
          console.error("Cannot subscribe as secret token is MISSING");
          return;
        }
        console.log("Q item ", queueItem.id, " secret: ", queueItemSecret);
        const subscribeResponse = await api.post("notifications/subscribe", {
          token: token,
          queueItemId: queueItem.id,
          secretToken: queueItemSecret,
        });
        if (subscribeResponse.status === 200) {
          console.log("Successfully subscribed FCM token to backend.");
          // Optional: Show a success toast
        } else {
          console.error(
            "Failed to subscribe FCM token:",
            subscribeResponse.data
          );
        }
      } else {
        console.log("no fcm token received");
      }
      onMessage(messaging, (payload) => {
        console.log("Message received. ", payload);
        new Notification(payload.notification?.title || "Notification", {
          body: payload.notification?.body,
          icon: "/Q-logo.svg",
        });
      });
    } catch (err) {
      console.error(err);
    }
  };

  //* HANDLE INTERACTION
  const handleUserInteraction = useCallback(() => {
    console.log(
      "Handling user interaction, ",
      JSON.stringify(pendingAudioAlerts)
    );
    if (!userInteracted) {
      const silent = new Audio("/SilentSound.mp3");
      silent.volume = 0.0;

      silent
        .play()
        .then(() => {
          setUserInteracted(true);
          const a = audioRef.current;
          pendingAudioAlerts.forEach((s) => {
            if (a && a.src && a.src.includes(s)) return;
            if (!audioQueueRef.current.includes(s))
              audioQueueRef.current.push(s);
          });
          setPendingAudioAlerts([]);

          if (a && !isPlayingRef.current) {
            const next = audioQueueRef.current.shift();
            if (next) {
              a.src = next;
              a.currentTime = 0;
              a.play().catch((e) =>
                console.error("Audio playback failed: ", e)
              );
            }
          }
        })
        .catch((e) => {
          console.warn("Silent playback failed, marking userInteracted:", e);
          setUserInteracted(true);
          const a = audioRef.current;
          pendingAudioAlerts.forEach((s) => {
            if (a && a.src && a.src.includes(s)) return;
            if (!audioQueueRef.current.includes(s))
              audioQueueRef.current.push(s);
          });
          setPendingAudioAlerts([]);
        });
    } else {
      pendingAudioAlerts.forEach((soundFile) => {
        console.log("Playing pending audio alerts: ", soundFile);
        playSound(soundFile);
      });
      setPendingAudioAlerts([]);
    }
  }, [userInteracted, pendingAudioAlerts, playSound]);

  useEffect(() => {
    if (userInteracted) return;
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
  }, [handleUserInteraction]);

  //* CUSTOMER POSITION IN LINE ALERTS
  useEffect(() => {
    if (
      dataLoaded &&
      customerPosition !== "N/A" &&
      !inactive &&
      !isNaN(partiesAhead) &&
      !modalCalled
    ) {
      const tempPosition = parseInt(partiesAhead, 10) + 1;
      if (tempPosition === 3 && !thirdAlerted) {
        playSound("/3rdEng.mp3");
        setThirdAlerted(true);
        setPositionNotification("You are now third in line! Please get ready.");
        toast.open("You are now THIRD in line! Please get ready.", {
          type: "info",
          duration: 5000,
        });
      } else if (tempPosition === 2 && !secondAlerted) {
        playSound("/2ndEng.mp3");
        setSecondAlerted(true);
        setPositionNotification(
          "You are now SECOND in line! Please get ready."
        );
        toast.open("You are second in line! Please prepare to approach.", {
          type: "info",
          duration: 5000,
        });
      } else if (tempPosition === 1 && !firstAlerted) {
        console.log("Sound is being played");
        playSound("/1stEng.mp3");
        setPositionNotification("You are now NEXT in line! Please get ready.");
        setFirstAlerted(true);
        toast.open("You are next in line! Please prepare to approach.", {
          type: "warning",
          duration: 5000,
        });
      }
    }
  }, [
    partiesAhead,
    dataLoaded,
    inactive,
    thirdAlerted,
    secondAlerted,
    firstAlerted,
    modalCalled,
    userInteracted,
    playSound,
  ]);

  //* UPDATE CURRENT TIME FOR EST WAIT TIME CALCULATION
  useEffect(() => {
    const updateInterval = () => {
      const timeDiff = Date.now() - lastUpdated.getTime();
      if (timeDiff < 60000) return 5000; // Every 5 seconds for first minute
      if (timeDiff < 300000) return 30000; // Every 30 seconds for first 5 minutes
      return 60000; // Every minute after that
    };

    const timer = setInterval(() => {
      console.log("Updating current time for interval check");
      setCurrentTime(new Date());
    }, updateInterval());

    return () => clearInterval(timer);
  }, [lastUpdated]);

  //* NOTIFICATION
  useEffect(() => {
    if (!("Notification" in window)) {
      toast.open(
        "Your browser does not support notifications. We will not be able to notify you.",
        {
          type: "info",
          duration: null,
          sticky: true,
          id: "browser-notif-unsupported",
        }
      );
    } else if (
      notificationPermission === "denied" ||
      notificationPermission === "default"
    ) {
      toast.open(PermissionNotification, {
        type: "info",
        duration: null,
        sticky: true,
        id: "notif-perms-denied",
      });
    }
  }, [dataLoaded, notificationPermission, toast.open]);

  //* SOCKET HERE
  useEffect(() => {
    if (socket && isConnected && queueItem) {
      socket.emit("join_queue", `queue_${queueItem.queueId}`);
      socket.emit("join_queue_item_id", `queueitem_${queueItem.id}`);
      socket.emit("customer_in_waiting", {
        queueItemId: queueItem.id,
      });
      socket.emit("cust_update_host", {
        queueId: queueItem.queueId,
        queueItemId: queueItem.id,
        action: "join",
      });
    } else if (socket && !isConnected) {
      console.log(
        "Socket not connected, attempting to reconnect in 5 seconds..."
      );
      const timer = setTimeout(reconnect, 5000); // Retry every 5 seconds
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [socket, isConnected, queueItem?.queueId, queueItem?.customerId]);

  useEffect(() => {
    if (dataLoaded && queueItem !== null && !!socket && isConnected) {
      const handleCalledUpdate = (data) => {
        console.log("Handling called update: ", data);
        console.log("Current queue item id: ", queueItem.id);
        if (data.alert && data.action === "called") {
          const calledAt = moment(data.calledAt).format(
            "dddd, MMMM Do YYYY, h:mm:ss a"
          );
          console.log("Patient is being called!");
          setCalledTimeElapsed(calledAt);
          setModalCalled(true);

          // Reset position alerts when called
          setThirdAlerted(false);
          setSecondAlerted(false);
          setFirstAlerted(false);

          // Play the alert sound using the queue system
          if (!calledSoundPlayed) {
            console.log("Playing alert sound for called patient");
            playSound("/AlertSound.mp3");
            setCalledSoundPlayed(true);
          }

          // Show notification if permission granted
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("It's Your Turn!", {
              body: "Please approach.",
              vibrate: [200, 100, 200, 100, 200],
            });
          }
        } else if (data.alert === false && data.action === "called") {
          setModalCalled(false);
          setCalledSoundPlayed(false); // Reset flag when modal closes
        }
      };
      const handleSeatedUpdate = (data) => {
        if (
          data.alert &&
          queueItem.id === data.queueItemId &&
          data.action === "seated"
        ) {
          setSeated(true);
          setInactive(true);
        } else if (data.alert === false && data.action === "seated") {
          setSeated(false);
          setInactive(false);
        }
      };
      const handleNoShowUpdate = (data) => {
        if (
          data.alert &&
          queueItem.id === data.queueItemId &&
          data.action === "noShow"
        ) {
          setNoShow(true);
          setInactive(true);
        } else if (data.alert === false && data.action === "noShow") {
          setSeated(false);
          setInactive(false);
        }
      };

      socket.on("queueitem_update", (data) => {
        if (data.action === "seated") {
          handleSeatedUpdate(data);
        } else if (data.action === "called") {
          handleCalledUpdate(data);
        } else if (data.action === "noShow") {
          handleNoShowUpdate(data);
        }
      });
      socket.on("queue_update", (data) => {
        if (data.queueList) {
          setProgressBar(data.queueList.arr);
          setBarType(data.queueList.type);
          setPartiesAhead(data.queueList.partiesAhead);
        }
        setLastUpdated(new Date());
        setCurrentlyServing(data.currentlyServing);
        setCustomerPosition(data.yourPosition);
        setPax(data.pax);

        if (data.inactive) {
          setInactive(true);
          if (data.seated) {
            setSeated(true);
          } else if (data.quit) {
            setQuit(true);
          } else if (data.noShow) {
            setNoShow(true);
          }
        }
      });
      socket.on("res_queue_refresh", (data) => {
        if (data.inactive) {
          setInactive(data.inactive);
          setSeated(data.seated);
          setQuit(data.quit);
          setNoShow(data.noShow);
        } else if (!inactive) {
          try {
            setLastUpdated(new Date());
            setProgressBar(data.queueList.arr);
            setCurrentlyServing(data.currentlyServing);
            setCustomerPosition(data.yourPosition);
            setBarType(data.queueList.type);
            setPartiesAhead(data.queueList.partiesAhead);
            setPax(data.pax);
          } catch (error) {
            console.error("Error in res_queue_refresh handler:", error);
          }
        } else if (inactive) {
          console.log("Inactive");
        }
      });
      //need to trigger update of host page when leave queue and join queue happens

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("queue_update");
        socket.off("res_queue_refresh");
        socket.off("queueitem_update");
      };
    }
  }, [
    dataLoaded,
    queueItem?.queueId,
    queueItem?.id,
    customer?.id,
    socket,
    isConnected,
    playSound,
    calledSoundPlayed,
  ]);

  //* FUNCTIONS
  const leaveQueue = async (e) => {
    e.preventDefault();
    setModalLeave(true);
  };
  const handleLeaveQueue = async (e) => {
    e.preventDefault();

    try {
      const acctSlug = accountInfo.slug;
      const queueId = queueItem.queueId;
      const queueItemId = queueItem.id;
      const res = await api.post(
        `/customerQuit/${acctSlug}/${queueId}/${queueItemId}`
      );

      if (res?.status === 201) {
        setActiveQueueSession(false);
        socket.emit("queue_update", queueId);
        const navStateData = { ...res?.data };
        localStorage.removeItem("queueItemLS");
        setTimeout(() => {
          navigate(`/${acctSlug}/leftQueue/${queueItemId}`, navStateData);
        }, 100);
      }
    } catch (error) {
      //* If error, we need to kick user out of queue and redirect to left queue page still.
      // as long as user hits this button, we kick them out
      console.error(JSON.stringify(error));
    } finally {
      setModalLeave(false);
    }
  };
  const paxUpdate = (e) => {
    e.preventDefault();
    setModalUpdate(true);
  };
  const handlePaxUpdate = async (e) => {
    e.preventDefault();

    if (parseInt(newPax) === parseInt(pax)) {
      setNewPax("");
      setModalUpdate(false);
      return;
    }

    try {
      const acctSlug = accountInfo.slug;
      const queueId = queueItem.queueId;
      const queueItemId = queueItem.id;
      const dataToSend = { pax: newPax };
      const res = await api.post(
        `/customerUpdatePax/${acctSlug}/${queueId}/${queueItemId}`,
        dataToSend
      );

      if (res?.data) {
        if (socket && socket.connected && queueItem?.queueId) {
          socket.emit("cust_req_queue_refresh", queueItem.queueId);
          socket.emit("cust_update_host", {
            queueId: queueItem.queueId,
            action: "pax",
          });
          //should socket.emit("update_to_host", queueItem.queueId)
        }
      }
    } catch (error) {
      console.error(error);
    }

    setModalUpdate(false);
    setNewPax("");
  };
  const requestQueueRefresh = () => {
    if (socket && socket.connected && queueItem) {
      socket.emit("cust_req_queue_refresh", queueItem.queueId, queueItem.id);
    } else {
      console.log("Socket not connected, cannot request queue refresh.");
    }
  };

  if (openNotifModal) {
    return (
      <div>
        <NotificationModal
          title={`Hi ${queueItem.name}!`}
          paragraph={`You are at position ${customerPosition}.`}
          content={
            <div className="max-w-[250px] my-3">
              <p className="italic font-light text-sm">
                <i className="fa-solid fa-bell pr-3"></i>Please keep this{" "}
                <span className="font-bold text-lg">PAGE OPEN</span> and check
                back regularly to stay updated on your queue status.
              </p>
              <p className="italic font-light text-sm pt-3">
                <i className="fa-solid fa-volume-high pr-3"></i>Please keep your
                audio <span className="font-bold text-lg">UP</span> so that you
                can hear when we notify your turn!
              </p>
            </div>
          }
          onClose={() => {
            handleUserInteraction();
            setOpenNotifModal(false);
            if (!subscriptionAttempted) {
              requestAndSendFCMToken();
              setSubscriptionAttempted(true);
            }
          }}
        />
      </div>
    );
  }
  return (
    <div className="flex-row items-center justify-center p-3 sm:p-5 md:pt-8 h-full">
      {reminderModal && (
        <div className="bg-primary-ultra-dark-green/95 min-w-[100%] min-h-[100%] absolute top-0 left-0 z-5 ">
          <div
            className={`text-sm font-medium italic text-primary-green dark:text-primary-light-green col-span-2 top-1/2 -translate-y-1/2 left-1/2 transform absolute -translate-x-1/2 w-full text-center dark:bg-stone-700 bg-primary-cream py-10 px-4 rounded-lg max-w-[300px] `}
          >
            <p
              className="absolute top-0 right-0 text-red-700 pr-5 pt-2 text-lg hover:text-red-950 transition ease-in active:text-red-950 font-bold cursor-pointer"
              onClick={() => setReminderModal(false)}
            >
              X
            </p>
            <p className="italic font-light text-sm">
              <i className="fa-solid fa-bell pr-3"></i>Keep this{" "}
              <span className="font-bold text-lg">PAGE OPEN</span>
            </p>
            <p className="italic font-light text-sm">
              <i className="fa-solid fa-bell pr-3"></i>Check back{" "}
              <span className="font-bold text-lg">OFTEN</span>
            </p>
            <p className="italic font-light text-sm ">
              <i className="fa-solid fa-volume-high pr-3"></i>Keep your audio{" "}
              <span className="font-bold text-lg">UP</span>
            </p>
            <p className="italic font-light text-sm ">
              <i className="fa-solid fa-volume-high pr-3"></i>Ensure you have Do
              Not Disturb <span className="font-bold text-lg">OFF</span>
            </p>{" "}
          </div>
        </div>
      )}
      {modalLeave && (
        <div className="bg-primary-ultra-dark-green/85 min-w-[100%] min-h-[100%] absolute top-0 left-0 z-5 ">
          <div
            className={`${primaryBgClass} z-10 min-w-sm rounded-3xl text-center text-stone-700 dark:text-white absolute top-1/2 left-1/2 -translate-1/2 p-10 md:min-w-md`}
          >
            <h1 className="text-red-900 font-semibold text-2xl">Warning:</h1>

            <p className="font-bold">
              Are you sure you want to leave the queue?
            </p>

            <br />

            <p className="text-xs/4 lg:text-sm italic font-light">
              Agreeing to do so will <span className="font-semibold">kick</span>{" "}
              you out of the queue and you will lose your spot{" "}
              <span className="font-semibold">permanently.</span>
            </p>

            <p
              className="absolute top-0 right-0 text-red-700 pr-5 pt-2 hover:text-red-950 transition ease-in active:text-red-950 font-bold cursor-pointer"
              onClick={() => setModalLeave(false)}
            >
              X
            </p>

            <br />

            <div className="flex">
              {" "}
              <button
                className={`${buttonClass} bg-primary-green hover:bg-primary-dark-green mr-3`}
                onClick={(e) => handleLeaveQueue(e)}
              >
                Yes
              </button>
              <button
                className={`${buttonClass} bg-red-700 hover:bg-red-900`}
                onClick={() => setModalLeave(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {modalCalled && (
        <div className="bg-primary-ultra-dark-green/85 min-w-full min-h-full absolute top-0 left-0 z-5">
          <div className="bg-primary-cream z-10 min-w-sm rounded-3xl text-center text-stone-700 absolute top-1/2 left-1/2 -translate-1/2 p-10 md:min-w-md">
            <h1 className="text-primary-light-green font-semibold text-4xl">
              It is your turn!
            </h1>
            <br />
            <p className="text-2xl">
              {queueItem.name || customer.name || "N/A"}: {queueItem.pax} pax
            </p>
            <p>Called since: {calledTimeElapsed}</p>
            <br />
            <p>Please approach immediately.</p>
            <br />
          </div>
        </div>
      )}
      {modalUpdate && (
        <div className="bg-primary-ultra-dark-green/85 min-w-full min-h-full absolute top-0 left-0 z-5">
          <div
            className={`${primaryBgClass} z-10 min-w-sm rounded-3xl text-center text-stone-700 dark:text-white absolute top-1/2 left-1/2 -translate-1/2 p-10 md:min-w-md`}
          >
            <h1 className="text-red-900 font-semibold text-2xl">Warning:</h1>

            <p>
              Do you want to update the{" "}
              <span className="font-semibold">PAX?</span>
            </p>

            <br />

            <p className="text-xs/4 italic font-light">
              Agreeing to do so will permanently change your pax count and may
              lead to <span className="font-semibold">longer wait time. </span>
            </p>

            <form>
              <div className="mb-1">
                <label htmlFor="customer-pax" className={labelClass}>
                  New PAX
                </label>

                <input
                  className={`border-1 border-gray-400 rounded-lg bg-transparent appearance-none block w-full py-3 px-4 text-gray-700 dark:text-white text-xs leading-tight focus:outline-none focus:border-black peer active:border-black`}
                  id="customer-pax"
                  type="number"
                  min="1"
                  max="12"
                  onChange={(e) => {
                    setNewPax(e.target.value);
                  }}
                  required
                />
              </div>
            </form>

            <p
              className="absolute top-0 right-0 text-red-700 pr-5 pt-2 hover:text-red-950 transition ease-in active:text-red-950 font-bold cursor-pointer"
              onClick={() => setModalUpdate(false)}
            >
              X
            </p>

            <br />

            <button
              className={`${buttonClass} bg-primary-green hover:bg-primary-dark-green mr-3`}
              onClick={(e) => handlePaxUpdate(e)}
            >
              Yes
            </button>

            <button
              className={`${buttonClass} bg-red-700 hover:bg-red-900`}
              onClick={() => setModalUpdate(false)}
            >
              No
            </button>
          </div>
        </div>
      )}
      <Link
        to={`/${accountInfo.slug}`}
        className={`flex items-center pb-3 border-b-2 ${secondaryTextClass} justify-center`}
      >
        <img
          src={accountInfo.logo || null}
          alt={`${accountInfo.companyName || null} logo`}
          className="w-10 sm:w-15 md:w-20"
        />

        <h1 className="font-bold pl-3 text-2xl sm:text-4xl sm:pl-6 lg:text-6xl ">
          {accountInfo.companyName || null}
        </h1>
      </Link>
      {inactive && seated && (
        <div className="bg-primary-ultra-dark-green/35 min-w-full min-h-full absolute top-0 left-0 z-5">
          <div
            className={`${primaryBgClass} z-10 min-w-sm rounded-3xl text-center ${primaryTextClass} absolute top-1/2 left-1/2 -translate-1/2 p-10 md:min-w-md`}
          >
            <h1 className="text-primary-light-green font-semibold text-4xl">
              {/* MAKE SWITCH CODE FOR HERE */}
              You are Seated!
            </h1>
            <br />
            <p className="text-2xl">
              {queueItem.name || customer.name}: {queueItem.pax} pax
            </p>
            <br />
            <p>{`You have been seated at ${outlet.name}`} </p>
            <br />
          </div>
        </div>
      )}
      {inactive && quit && (
        <div className="text-center max-w-[300px] mx-auto">
          <h1 className="text-3xl font-light pt-3 text-stone-600">
            {outlet.name}
          </h1>
          <br />
          <div className="bg-primary-ultra-dark-green/80 p-5 rounded-2xl m-3">
            <h4 className=" font-lg font-semibold py-3 text-primary-light-green">
              {`You have left the queue, ${queueItem.name || customer.name}.`}
            </h4>
            <div className="text-primary-cream">
              We are <span className="font-semibold">sorry</span> for the long
              wait. We hope to see you next time!{" "}
            </div>
          </div>
        </div>
      )}
      {inactive && noShow && (
        <div className="bg-primary-ultra-dark-green/35 min-w-full min-h-full absolute top-0 left-0 z-5">
          <div
            className={`${primaryBgClass} z-10 min-w-sm rounded-3xl text-center ${primaryTextClass} absolute top-1/2 left-1/2 -translate-1/2 p-10 md:min-w-md`}
          >
            <h1 className="text-primary-light-green font-semibold text-4xl">
              {`Sorry, ${queueItem.name || customer.name}`}
            </h1>
            <br />
            <p className="text-2xl">
              {queueItem.name || customer.name}: {queueItem.pax} pax
            </p>
            <br />
            <p>{`You have been removed from the queue at ${outlet.name}`} </p>
            <br />
            <p className={`italic ${secondaryTextClass}`}>
              We could not reach you since {calledTimeElapsed}. We had to give
              up your spot for another waiting customer. Please rejoin the queue
              if you are still hungry!
            </p>
          </div>
        </div>
      )}
      {!inactive && (
        <div className="text-center ">
          <h1 className={`text-3xl font-light pt-3 ${primaryTextClass}`}>
            {outlet.name}
          </h1>
          <h4 className=" font-lg font-semibold pt-3 pb-1 text-primary-dark-green dark:text-primary-light-green">
            {message ||
              `Welcome back, ${
                customer?.name !== queueItem?.name
                  ? `${customer?.name || "N/A"} or ${queueItem?.name || "N/A"}`
                  : customer?.name || queueItem?.name || "N/A"
              }`}
          </h4>
          <div
            className={`bg-orange-400 text-white cursor-pointer text-center px-3 py-2 max-w-[200px] rounded-lg mx-auto mb-4 hover:bg-primary-dark-green transition ease-in-out duration-600`}
            onClick={() => setReminderModal(!reminderModal)}
          >
            <i className="fa-solid fa-triangle-exclamation"></i> REMINDERS
          </div>

          {positionNotification !== null && (
            <div className="mb-2 text-orange-400 font-bold">
              {positionNotification}
            </div>
          )}
          {/* GRID FOR QUEUE INFO */}
          {!dataLoaded && <div>Loading...</div>}
          <div
            className={`grid grid-cols-2 w-full max-w-md ${primaryBgClass} ${primaryTextClass} rounded-lg shadow justify-self-center `}
          >
            <div className="p-4 grid grid-rows-3 text-center border-b-1 border-r-1 border-stone-300 ">
              <div className={`text-sm `}>Currently Serving</div>
              <div className="text-5xl row-span-2 font-bold text-primary-green">
                {currentlyServing || "N/A"}
              </div>
            </div>

            <div className="grid grid-cols-3 text-center border-b-1 border-stone-300">
              {!outlet.showPax && (
                <div className="col-span-5 grid-rows-3 p-4">
                  <div className={`text-sm ${primaryTextClass}`}>
                    Your Number
                  </div>

                  <div className="text-5xl row-span-2 font-bold">
                    {customerPosition || "N/A"}
                  </div>
                </div>
              )}

              {outlet.showPax && (
                <>
                  <div className="col-span-2 grid-rows-3 p-4">
                    <div
                      className={`text-sm flex items-center justify-center ${primaryTextClass}`}
                    >
                      Your <span className={`lg:hidden block pl-1`}> #</span>{" "}
                      <span className={`lg:block hidden pl-1`}>number</span>
                    </div>

                    <div className="text-5xl row-span-2 font-bold text-primary-light-green pt-1">
                      {customerPosition || "N/A"}
                    </div>
                  </div>
                  <div
                    className=" grid grid-rows-3 border-stone-300 border-l-1 p-4 cursor-pointer "
                    onClick={paxUpdate}
                  >
                    <div className={`text-sm ${primaryTextClass}`}>PAX</div>

                    <div className="text-5xl row-span-2 font-bold text-primary-light-green hover:text-primary-dark-green transition ease-in-out duration-600">
                      {pax}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Estimated Wait Time */}

            <div className="p-4 text-center border-r-1 border-b-1 border-stone-300 grid grid-rows-3">
              <div className={`row-span-1 text-sm ${primaryTextClass}`}>
                Estimated Wait Time
              </div>

              <div className="row-span-1 items-center justify-center text-2xl">
                <div className="">
                  {calculateEstWaitTime(
                    customerPosition,
                    currentlyServing,
                    ewt
                  ) > 30 ? (
                    <span className={`text-sm text-balance font-semibold`}>
                      More than 30 minutes
                    </span>
                  ) : (
                    <span className="font-semibold">
                      {calculateEstWaitTime(
                        customerPosition,
                        currentlyServing,
                        ewt
                      )}{" "}
                      minutes
                    </span>
                  )}
                </div>
              </div>
              <div className={`row-span-1 text-xs ${secondaryTextClass} mt-1`}>
                Maybe inaccurate due to new account*
              </div>
            </div>

            {/* Last Updated Time */}

            <div className="p-4 text-center border-b-1 border-stone-300 grid grid-rows-3">
              <div className={`text-sm ${primaryTextClass}`}>
                Last Updated Time
              </div>

              <div className=" font-semibold items-center justify-center row-span-1 ">
                <div className="flex justify-center items-center">
                  <span
                    className="cursor-pointer text-primary-light-green hover:text-primary-green active:text-primary-dark-green transition ease-in text-xl"
                    onClick={requestQueueRefresh}
                  >
                    <i className="fa-solid fa-arrow-rotate-right"></i>
                  </span>

                  <span
                    className={`pl-2 text-balance ${
                      formatLastUpdated(lastUpdated).length > 13
                        ? "text-sm"
                        : formatLastUpdated(lastUpdated).length > 8
                        ? "text-md"
                        : "text-lg"
                    }`}
                  >
                    {formatLastUpdated(lastUpdated)}
                  </span>
                </div>
              </div>
              <div className="row-span-1 mt-2">
                <div className="text-xs font-light text-stone-400 flex justify-center items-center ">
                  Press <i className="fa-solid fa-arrow-rotate-right px-2"></i>{" "}
                  to refresh
                </div>
                <div className={`text-[10px] font-light ${secondaryTextClass}`}>
                  {isConnected ? (
                    <span className="text-primary-dark-green dark:text-primary-light-green">
                      <i className="fa-solid fa-wifi"></i> Live updates
                    </span>
                  ) : (
                    <span className="text-yellow-600">
                      <i className="fa-solid fa-exclamation-triangle"></i>{" "}
                      Connection issues
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {barType === "large-bar" && (
            <div className="grid grid-cols-6 w-full max-w-md justify-self-center mt-2">
              <div className="col-span-4 bg-primary-green text-white text-xs py-1 px-2 rounded-l text-start border-r-1 border-stone-100">
                {partiesAhead} parties ahead...
              </div>

              <div className={youClass}>YOU</div>

              <div className={dotBGClass + " justify-center"}>
                <div className={dotClass}></div>

                <div
                  className={dotClass + " ml-1 [animation-delay:-0.3s]"}
                ></div>

                <div
                  className={dotClass + " ml-1 [animation-delay:-0.5s]"}
                ></div>
              </div>
            </div>
          )}
          {barType === "short-bar" && (
            <div
              className="mt-3 h-7 justify-self-center w-full md:w-md grid"
              style={{
                gridTemplateColumns: `repeat(${
                  progressBar.length
                }, minmax(0, 1fr)) ${8 - progressBar.length}fr`,
              }}
            >
              {progressBar.map((party, index) => (
                <div key={index} className="flex h-full">
                  {party === customerPosition ? (
                    <span className="bg-primary-light-green text-white text-xs text-center w-full flex items-center justify-center border-r-1 border-stone-100">
                      YOU
                    </span>
                  ) : (
                    <span className="bg-primary-green text-white text-xs text-center w-full flex items-center justify-center border-r-1 border-stone-100">
                      {party}
                    </span>
                  )}
                </div>
              ))}
              <div className={dotBGClass}>
                <div className={dotClass + " ml-1"}></div>

                <div
                  className={dotClass + " ml-1 [animation-delay:-0.3s]"}
                ></div>

                <div
                  className={dotClass + " ml-1 [animation-delay:-0.5s]"}
                ></div>
              </div>
            </div>
          )}
          {barType === "serving-you-bar" && (
            <div className={progBarClass}>
              <div className={youClass}>
                <span>YOU</span>
              </div>

              <div className={dotBGClass}>
                <div className={dotClass + " ml-1"}></div>

                <div
                  className={dotClass + " ml-1 [animation-delay:-0.3s]"}
                ></div>

                <div
                  className={dotClass + " ml-1 [animation-delay:-0.5s]"}
                ></div>
              </div>
            </div>
          )}
          <div className="p-4 text-center col-span-2">
            <div className="mb-3">
              <button
                onClick={leaveQueue}
                className="px-5 py-2 bg-red-700 rounded-full text-primary-cream font-light hover:bg-red-800 cursor-pointer transition ease-in"
              >
                <span className="font-semibold">LEAVE</span> Queue{" "}
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
              </button>
            </div>

            <div className={`text-xs font-medium italic ${secondaryTextClass}`}>
              *Clicking this button will kick you out of the queue. <br />
              You will lose your spot and have to rejoin the queue again.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Waiting;
