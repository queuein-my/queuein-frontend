import React, { useEffect, useRef, useState } from "react";
import { interceptedApiPrivate } from "../api/axios";
import { msToMins, minsToMs } from "../utils/timeConverter";
import Loading from "./Loading";
import QRCode from "./QRCodeButton";

import AuthorisedUser from "./AuthorisedUser";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useBusinessType } from "../hooks/useBusinessType";
import { replaceEscaped } from "../utils/replaceRegex";
import {
  primaryButtonClass as buttonClass,
  primaryBgTransparentClass,
  primaryTextClass,
  primaryBgClass,
  primaryInputClass,
  labelClass,
  errorClass,
  xButtonClass,
  secondaryBgClass,
} from "../styles/tailwind_styles";

const OutletUpdateModal = ({
  show,
  onClose,
  outletData,
  accountId,
  onUpdateSuccess,
  view,
}) => {
  // --- ALL useState declarations must be at the top level, unconditionally ---
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [googleMaps, setGoogleMaps] = useState("");
  const [wazeMaps, setWazeMaps] = useState("");
  const [defaultEstWaitTimeMS, setDefaultEstWaitTimeMS] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [showPax, setShowPax] = useState(false);
  const [showImgUploadModal, setShowImgUploadModal] = useState(true);

  //State for displaying data only
  const [imgUrl, setImgUrl] = useState("");
  const [defaultEstWaitTime, setDefaultEstWaitTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [changesExist, setChangesExist] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [nameChanged, setNameChanged] = useState(false);

  const bottomRef = useRef(null);
  const bottomRefForModal = useRef(null);
  const navigate = useNavigate();
  const { reloadNav, setReloadNav } = useAuth();
  const { config } = useBusinessType();

  // Errors
  const [errors, setErrors] = useState({});
  const [defaultEstWaitTimeError, setDefaultEstWaitTimeError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [hoursError, setHoursError] = useState(false);
  const [imgUrlError, setImgUrlError] = useState(false);
  const [imgFileError, setImgFileError] = useState(false);

  // Tailwind Classes

  const inputDivClass = `px-3 py-1`;
  const inputClass = (hasError) =>
    `${primaryInputClass} ${hasError ? "border-red-500" : ""}`;
  const buttonGroupClass = `flex overflow-hidden `;
  const buttonOptionClass = (isActive) =>
    `px-4 py-2 text-sm font-medium focus:outline-none transition-colors duration-300 ${
      isActive
        ? "bg-primary-light-green text-white"
        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
    }`;

  useEffect(() => {
    console.log("There is outlet data? ", outletData);
    if (outletData) {
      setChangesExist(false);
      setName(outletData.name || "");
      setShowPax(outletData.showPax || false);
      setLocation(outletData.location || "");
      setGoogleMaps(outletData.googleMaps || "");
      setWazeMaps(outletData.wazeMaps || "");
      setDefaultEstWaitTime(msToMins(outletData.defaultEstWaitTime) || "");
      setImgUrl(outletData.imgUrl || "");
      setPhone(outletData.phone || "");
      setHours(outletData.hours || "");
      setErrors({});
      setDefaultEstWaitTimeError(false);
      setNameError(false);
      setLocationError(false);
      setPhoneError(false);
      setHoursError(false);
      setImgUrlError(false);
      setImgFileError(false);
      setNameChanged(false);
    }
  }, [outletData]);

  const checkChange = () => {
    if (outletData === null || outletData === undefined) {
      return;
    }
    const nameChanged = outletData.name !== name;
    const locationChanged = outletData.location !== location;
    const googleMapsChanged =
      outletData.googleMaps !== googleMaps && outletData.googleMaps !== null;
    const wazeMapsChanged =
      outletData.wazeMaps !== wazeMaps && outletData.wazeMaps !== null;
    const phoneChanged = outletData.phone !== phone;
    const hoursChanged = outletData.hours !== hours;
    const showPaxChanged = outletData.showPax !== !!showPax;
    const defaultWaitTimeInMinutes = msToMins(outletData.defaultEstWaitTime);
    const parsedWaitTime = parseFloat(defaultEstWaitTime);
    const waitTimeChanged = defaultWaitTimeInMinutes !== parsedWaitTime;
    const imageChanged = imgFile !== null;

    const anyChanges =
      nameChanged ||
      showPaxChanged ||
      locationChanged ||
      googleMapsChanged ||
      wazeMapsChanged ||
      phoneChanged ||
      hoursChanged ||
      waitTimeChanged ||
      imageChanged;

    setChangesExist(anyChanges);
  };
  useEffect(() => {
    if (
      name ||
      showPax ||
      location ||
      googleMaps ||
      wazeMaps ||
      defaultEstWaitTime ||
      imgFile ||
      phone ||
      hours ||
      showImgUploadModal
    ) {
      checkChange();
    }
  }, [
    name,
    location,
    googleMaps,
    wazeMaps,
    defaultEstWaitTime,
    imgFile,
    phone,
    hours,
    showImgUploadModal,
    showPax,
  ]);
  if (!show || !outletData) {
    return null;
  }
  // New handleUpdate function with validation
  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
    setDefaultEstWaitTimeError(false);
    setNameError(false);
    setLocationError(false);
    setPhoneError(false);
    setHoursError(false);
    setImgUrlError(false);

    let hasError = false;
    let currentErrors = {};

    // Validation
    if (name.length < 2) {
      currentErrors.name = "Name must be longer than 2 characters";
      setNameError(true);
      hasError = true;
    }
    if (location.length === 0) {
      currentErrors.general = "Address can't be empty";
      setLocationError(true);
      hasError = true;
    }
    if (phone.length < 10) {
      currentErrors.general = "Contact number must be at least 10 numbers long";
      setPhoneError(true);
      hasError = true;
    }
    if (hours.length < 1) {
      currentErrors.general = "Hours must be entered";
      setHoursError(true);
      hasError = true;
    }

    const parsedDefaultEstWaitTime = parseFloat(defaultEstWaitTime);
    if (isNaN(parsedDefaultEstWaitTime)) {
      currentErrors.general = "Estimated wait time must be a number";
      setDefaultEstWaitTimeError(true);
      hasError = true;
    } else if (parsedDefaultEstWaitTime < 0) {
      currentErrors.general = "Estimated wait time cannot be negative";
      setDefaultEstWaitTimeError(true);
      hasError = true;
    } else {
      const time = minsToMs(parsedDefaultEstWaitTime);
      setDefaultEstWaitTimeMS(time);
    }

    if (hasError) {
      setErrors(currentErrors);
      return;
    }

    // If validation passes, show the auth modal
    setShowAuthModal(true);
  };
  const handleAuthModalClose = () => {
    setErrors({ general: "Forbidden" });
    setShowAuthModal(false);
  };
  // Updated updateOutletAllowed function (validation removed)
  const updateOutletAllowed = async (staffInfo) => {
    console.log("Update allowed! ", staffInfo);

    let payload = {};
    const hasFileToUpload = imgFile !== null;
    let dataToSubmit;

    if (hasFileToUpload) {
      dataToSubmit = new FormData();
      dataToSubmit.append("outletImage", imgFile);
      if (outletData.name !== name) {
        dataToSubmit.append("name", name);
      }
      if (outletData.showPax !== showPax) {
        dataToSubmit.append("showPax", !!showPax);
      }
      console.log("Show Pax value to submit: ", showPax);
      if (outletData.location !== location) {
        dataToSubmit.append("location", location);
      }
      if (outletData.googleMaps !== googleMaps) {
        if (wazeMaps.trim() !== "") {
          dataToSubmit.append("googleMaps", googleMaps);
        }
      }
      if (outletData.wazeMaps !== wazeMaps) {
        if (wazeMaps.trim() !== "") {
          dataToSubmit.append("wazeMaps", wazeMaps);
        }
      }
      const parsedDefaultEstWaitTime = parseFloat(defaultEstWaitTime);
      if (
        msToMins(outletData.defaultEstWaitTime) !== parsedDefaultEstWaitTime
      ) {
        dataToSubmit.append("defaultEstWaitTime", defaultEstWaitTimeMS);
      }
      if (outletData.hours !== hours) {
        dataToSubmit.append("hours", hours);
      }
      if (outletData.phone !== phone) {
        dataToSubmit.append("phone", phone);
      }
    } else {
      if (outletData.name !== name) {
        payload.name = name;
      }
      if (outletData.showPax !== showPax) {
        payload.showPax = showPax;
      }
      if (outletData.location !== location) {
        payload.location = location;
      }
      if (outletData.googleMaps !== googleMaps) {
        if (wazeMaps.trim() !== "") {
          payload.googleMaps = googleMaps;
        }
      }
      if (outletData.wazeMaps !== wazeMaps) {
        if (wazeMaps.trim() !== "") {
          payload.wazeMaps = wazeMaps;
        }
      }
      const parsedDefaultEstWaitTime = parseFloat(defaultEstWaitTime);
      if (
        msToMins(outletData.defaultEstWaitTime) !== parsedDefaultEstWaitTime
      ) {
        payload.defaultEstWaitTime = defaultEstWaitTimeMS;
      }
      if (outletData.hours !== hours) {
        payload.hours = hours;
      }
      if (outletData.phone !== phone) {
        payload.phone = phone;
      }
    }

    const hasContent = hasFileToUpload
      ? [...dataToSubmit.entries()].length > 0
      : Object.keys(payload).length > 0;

    if (!hasContent) {
      setErrors({ general: "No changes detected to update." });
      return;
    }

    try {
      setIsLoading(true);
      setShowImgUploadModal(false);
      let res;
      if (hasFileToUpload) {
        res = await interceptedApiPrivate.patch(
          `/updateOutlet/${accountId}/${outletData.id}/outlet_image`,
          dataToSubmit,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        res = await interceptedApiPrivate.patch(
          `/updateOutlet/${accountId}/${outletData.id}/outlet_image`,
          payload
        );
      }

      if (res?.status === 201 || res?.status === 200) {
        console.log("Outlet updated successfully:", res.data);
        setIsLoading(false);
        setShowAuthModal(false);
        if (nameChanged) {
          setReloadNav(!reloadNav);
        }
        onUpdateSuccess(res.data);
      } else {
        setIsLoading(false);
        setErrors({ general: "Failed to update outlet. Please try again." });
      }
    } catch (error) {
      console.error("Error updating outlet:", error);
      setIsLoading(false);
      setErrors({
        general:
          error?.response?.data?.message ||
          "An unexpected error occurred during update.",
      });
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setImgFile(file);
      setImgUrl(newUrl);
      console.log("This is new url: ", newUrl);
    } else {
      setImgFile(null);
      setImgUrl(null);
    }
  };
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (view === "modal") {
      bottomRefForModal.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleReset = (e) => {
    e.preventDefault();
    console.log("Trying to reset");
    setName(outletData.name || "");
    setLocation(outletData.location || "");
    setGoogleMaps(outletData.googleMaps || "");
    setWazeMaps(outletData.wazeMaps || "");
    setDefaultEstWaitTime(msToMins(outletData.defaultEstWaitTime) || "");
    setImgUrl(outletData.imgUrl || "");
    setImgFile(null);
    setPhone(outletData.phone || "");
    setHours(outletData.hours || "");
    setErrors({});
    setDefaultEstWaitTimeError(false);
    setNameError(false);
    setLocationError(false);
    setPhoneError(false);
    setHoursError(false);
    setImgUrlError(false);
    setImgFileError(false);
    setChangesExist(false);
    setNameChanged(false);
  };
  const toggleModal = () => {
    setShowImgUploadModal(!showImgUploadModal);
  };
  const handleNavigateAuditLog = () => {
    navigate(`/db/${accountId}/settings/outlet/${outletData.id}/auditlogs`, {
      replace: true,
    });
  };

  //TODO: ADD A CTRL-S HANDLES UPDATE

  if (view === "modal" && !isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div
          className={`relative w-[90%] md:w-md my-10 ${primaryBgClass} ${primaryTextClass} rounded-3xl p-5 max-h-[90vh] overflow-y-auto `}
        >
          {changesExist && (
            <div className="fixed top-1/9 left-1/4">
              <div className="absolute -inset-2 red-800 text-white rounded-2xl z-0 opacity-75 blur-sm animate-pulse"></div>
              <div
                className="relative p-2 rounded-xl shadow-red-900 max-w-[150px] cursor-pointer bg-primary-cream z-10"
                onClick={scrollToBottom}
              >
                <div className="animate-ping bg-red-700 w-3 h-3 rounded-2xl absolute top-0 right-0"></div>
                <p className="text-black">Changes Exist</p>
              </div>
            </div>
          )}

          <div className="sticky top-0 -mr-2 flex justify-end ">
            <button
              className="text-red-700 font-semibold px-5 py-3.5 hover:text-red-900 transition ease-in cursor-pointer bg-transparent border-1 rounded-full hover:border-red-900 border-transparent hover:bg-primary-cream"
              onClick={onClose}
            >
              X
            </button>
          </div>

          <h1 className="text-2xl font-light text-center">
            Updating Your {config.label} Details
          </h1>
          {showAuthModal && (
            <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
              <div
                className={`${primaryBgClass} p-6 rounded-lg shadow-xl relative max-w-sm w-full`}
              >
                <button
                  onClick={handleAuthModalClose}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
                >
                  &times;
                </button>
                <AuthorisedUser
                  onSuccess={updateOutletAllowed}
                  onFailure={handleAuthModalClose}
                  actionPurpose="OUTLET_UPDATED"
                  minimumRole="TIER_2"
                  outletId={outletData.id}
                />
              </div>
            </div>
          )}

          <form className="mt-5 " onSubmit={handleUpdate}>
            <div className={inputDivClass}>
              <label htmlFor="name" className={labelClass}>
                Name:*
              </label>
              <input
                id="name"
                type="text"
                className={inputClass(nameError) + " w-full "}
                value={name || config.queueName}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameChanged(true);
                }}
                required
              />
              {nameError && errors.name && (
                <p className={errorClass}>{errors.name}</p>
              )}
            </div>
            <div className={inputDivClass}>
              <div className={labelClass + " mb-2"}>
                Do you need PAX at your {config.label}?
              </div>
              <div className={buttonGroupClass}>
                <button
                  type="button"
                  className={buttonOptionClass(showPax)}
                  onClick={() => setShowPax(true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={buttonOptionClass(!showPax)}
                  onClick={() => setShowPax(false)}
                >
                  No
                </button>
              </div>
            </div>
            <div className={inputDivClass}>
              <label htmlFor="location" className={labelClass}>
                Location:
              </label>
              <input
                id="location"
                type="text"
                className={inputClass(locationError) + " w-full "}
                value={replaceEscaped(location)}
                onChange={(e) => setLocation(e.target.value)}
              />
              {locationError && errors.location && (
                <p className={errorClass}>{errors.location}</p>
              )}
            </div>
            <div className={inputDivClass}>
              <label htmlFor="googleMaps" className={labelClass}>
                Google Maps URL:
              </label>
              <input
                id="googleMaps"
                type="text"
                className={inputClass() + " w-full "}
                value={googleMaps}
                onChange={(e) => setGoogleMaps(e.target.value)}
              />
              {errors.googleMaps && (
                <p className={errorClass}>{errors.googleMaps}</p>
              )}
              <p className="text-xs">
                Not sure how to find your google maps url?{" "}
                <span>Click This For Guide</span>
              </p>
            </div>
            <div className={inputDivClass}>
              <label htmlFor="wazeMaps" className={labelClass}>
                Waze Maps URL:
              </label>
              <input
                id="wazeMaps"
                type="text"
                className={inputClass() + " w-full "}
                value={wazeMaps}
                onChange={(e) => setWazeMaps(e.target.value)}
              />
              {errors.wazeMaps && (
                <p className={errorClass}>{errors.wazeMaps}</p>
              )}
              <p className="text-xs">
                Not sure how to find your waze maps url?{" "}
                <span>Click This For Guide</span>
              </p>
            </div>
            <div className={inputDivClass}>
              <label htmlFor="imgFile" className={labelClass}>
                Image of your {config.label}:
              </label>
              <div
                className={labelClass + " text-center p-2 "}
                onClick={toggleModal}
              >
                <i
                  className={`fa-solid fa-upload text-primary-light-green cursor-pointer`}
                ></i>{" "}
                <span className=" cursor-pointer">
                  Click To Upload New Image
                </span>
              </div>
              {showImgUploadModal && (
                <div className="border-1 p-3 border-primary-light-green rounded-2xl shadow-xl/30">
                  <p className={labelClass}>To Change Your Image: </p>

                  <small className="text-xs font-light">
                    Click the following to upload your image
                  </small>
                  <input
                    id="imgFile"
                    type="file"
                    className={inputClass(imgUrlError) + " w-full "}
                    onChange={handleFileChange}
                  />
                </div>
              )}
              <div>
                <p className="text-xs font-light mt-3">A sample of the image</p>
                <img
                  src={
                    imgUrl ||
                    "https://placehold.co/150x100/eeeeee/333333?text=Image+Error"
                  }
                  alt="Sample of image"
                  className="object-cover w-full h-32 rounded-md my-2"
                  onError={(e) =>
                    (e.target.src =
                      "https://placehold.co/150x100/eeeeee/333333?text=Image+Error")
                  }
                />
              </div>
              {imgUrlError ||
                (imgFileError && errors.imgUrl) ||
                (errors.imgFile && (
                  <p className={errorClass}>
                    {errors.imgUrl || errors.imgFile}
                  </p>
                ))}

              <p className="text-xs">
                Not sure how to upload your image?{" "}
                <span>Click This For Guide</span>
              </p>
            </div>
            <div className={inputDivClass}>
              <label htmlFor="defaultEstWaitTime" className={labelClass}>
                An estimate wait time in minutes:*
              </label>
              <span className="flex items-center text-center">
                <input
                  id="defaultEstWaitTime"
                  type="text"
                  className={
                    inputClass(defaultEstWaitTimeError) + " w-20 mr-[10px]"
                  }
                  value={defaultEstWaitTime}
                  onChange={(e) => setDefaultEstWaitTime(e.target.value)}
                  required
                />{" "}
                minutes
              </span>
              {defaultEstWaitTimeError && errors.defaultEstWaitTime && (
                <p className={errorClass}>{errors.defaultEstWaitTime}</p>
              )}
            </div>
            <div className={inputDivClass}>
              <label htmlFor="phone" className={labelClass}>
                Phone Number:
              </label>
              <input
                id="phone"
                type="text"
                className={inputClass(phoneError) + " w-full "}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {phoneError && errors.phone && (
                <p className={errorClass}>{errors.phone}</p>
              )}
            </div>
            <div className={inputDivClass}>
              <label htmlFor="hours" className={labelClass}>
                Opening Hours:
              </label>
              <input
                id="hours"
                type="text"
                className={inputClass(hoursError) + " w-full "}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
              {hoursError && errors.hours && (
                <p className={errorClass}>{errors.hours}</p>
              )}
            </div>

            {errors.general && (
              <p className={errorClass + " mt-3"}>{errors.general}</p>
            )}
            <p>* indicate required fields</p>

            <div className="flex justify-center mt-5" ref={bottomRefForModal}>
              <button
                onClick={(e) => handleUpdate(e)}
                className={
                  buttonClass +
                  " bg-primary-green hover:bg-primary-dark-green mr-3"
                }
              >
                Submit Update
              </button>
              <button
                type="button"
                className={buttonClass + " bg-red-700 hover:bg-red-900"}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <Loading
        title={`Update ${config.label} Information`}
        paragraph={"Do Not Navigate Away. Please Wait. "}
      />
    );
  }
  if (view === "full" && !isLoading) {
    return (
      <div className="relative">
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div
              className={`${primaryBgClass} p-6 rounded-lg shadow-xl relative max-w-sm w-full`}
            >
              <button onClick={handleAuthModalClose} className={xButtonClass}>
                &times;
              </button>
              <AuthorisedUser
                onSuccess={updateOutletAllowed}
                onFailure={handleAuthModalClose}
                actionPurpose="OUTLET_UPDATED"
                minimumRole="TIER_2"
                outletId={outletData.id}
              />
            </div>
          </div>
        )}
        <h1 className="text-2xl font-light text-center">{name || "N/A"}</h1>

        {changesExist && (
          <div
            className={`fixed p-2 bg-red-800 text-white top-1/5 right-1/10 lg:right-1/5 lg:top-1/4  rounded-xl shadow-red-900 shadow-lg/30 cursor-pointer z-20`}
            onClick={scrollToBottom}
          >
            <div className="animate-ping bg-red-700 w-3 h-3 rounded-2xl absolute top-0 right-0"></div>
            Changes Exist
          </div>
        )}
        <div className="flex justify-center gap-3">
          <div
            className={`p-2 text-sm font-light ${primaryTextClass} border-1 border-primary-cream hover:border-primary-green hover:text-primary-dark-green transition ease-in text-center cursor-pointer ${primaryBgClass}`}
          >
            <button
              onClick={handleNavigateAuditLog}
              className="hover:text-primary-green transition ease-in cursor-pointer"
            >
              <i className="fa-solid fa-clipboard pr-2"></i>
              {config.label} Audit Logs
            </button>
          </div>

          <QRCode
            value={outletData.id}
            text={"View QR Code"}
            cssDiv={`p-2 text-sm font-light ${primaryTextClass} border-1 border-primary-cream hover:border-primary-green hover:text-primary-dark-green transition ease-in text-center cursor-pointer ${primaryBgClass}`}
            cssSpan={
              "hover:text-primary-green transition ease-in cursor-pointer"
            }
            location={window.location.pathname}
          />
        </div>
        <form className="mt-2 mb-5">
          <div className={inputDivClass}>
            <label htmlFor="outletName" className={labelClass}>
              Name:*
            </label>
            <input
              id="outletNames"
              type="text"
              className={inputClass(nameError) + " w-full "}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {nameError && errors.name && (
              <p className={errorClass}>{errors.name}</p>
            )}
          </div>
          <div className={inputDivClass}>
            <div className={labelClass + " mb-2"}>
              Do you need PAX at your {config.label}?
            </div>
            <div className={buttonGroupClass}>
              <button
                type="button"
                className={buttonOptionClass(showPax)}
                onClick={() => setShowPax(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={buttonOptionClass(!showPax)}
                onClick={() => setShowPax(false)}
              >
                No
              </button>
            </div>
          </div>
          <div className={inputDivClass}>
            <label htmlFor="location" className={labelClass}>
              Location:
            </label>
            <input
              id="location"
              type="text"
              className={inputClass(locationError) + " w-full "}
              value={replaceEscaped(location)}
              onChange={(e) => setLocation(e.target.value)}
            />
            {locationError && errors.location && (
              <p className={errorClass}>{errors.location}</p>
            )}
          </div>
          <div className={inputDivClass}>
            <label htmlFor="googleMaps" className={labelClass}>
              Google Maps URL:
            </label>
            <input
              id="googleMaps"
              type="text"
              className={inputClass() + " w-full "}
              value={googleMaps}
              onChange={(e) => setGoogleMaps(e.target.value)}
            />
            {errors.googleMaps && (
              <p className={errorClass}>{errors.googleMaps}</p>
            )}
            <p className="text-xs">
              Not sure how to find your google maps url?{" "}
              <span>Click This For Guide</span>
            </p>
          </div>
          <div className={inputDivClass}>
            <label htmlFor="wazeMaps" className={labelClass}>
              Waze Maps URL:
            </label>
            <input
              id="wazeMaps"
              type="text"
              className={inputClass() + " w-full "}
              value={wazeMaps || ""}
              onChange={(e) => setWazeMaps(e.target.value)}
            />
            {errors.wazeMaps && <p className={errorClass}>{errors.wazeMaps}</p>}
            <p className="text-xs">
              Not sure how to find your waze maps url?{" "}
              <span>Click This For Guide</span>
            </p>
          </div>
          <div className={inputDivClass}>
            <label htmlFor="imgFile" className={labelClass}>
              Image of your {config.label}:
            </label>
            <div
              className={labelClass + " text-center p-2 "}
              onClick={toggleModal}
            >
              <i
                className={`fa-solid fa-upload text-primary-light-green cursor-pointer`}
              ></i>{" "}
              <span className=" cursor-pointer">Click To Upload New Image</span>
            </div>
            {showImgUploadModal && (
              <div className="border-1 p-3 border-primary-light-green rounded-2xl shadow-xl/30">
                <p className={labelClass}>To Change Your Image: </p>

                <small className="text-xs font-light">
                  Click the following to upload your image
                </small>
                <input
                  id="imgFile"
                  type="file"
                  className={inputClass(imgUrlError) + " w-full "}
                  onChange={handleFileChange}
                />
              </div>
            )}
            <div>
              <p className="text-xs font-light mt-3">
                Your existing image looks like the following
              </p>
              <img
                src={
                  imgUrl ||
                  "https://placehold.co/150x100/eeeeee/333333?text=Image+Error"
                }
                alt="Sample of image"
                className="object-cover w-full rounded-md my-2"
                onError={(e) =>
                  (e.target.src =
                    "https://placehold.co/150x100/eeeeee/333333?text=Image+Error")
                }
              />
            </div>
            {imgUrlError ||
              (imgFileError && errors.imgUrl) ||
              (errors.imgFile && (
                <p className={errorClass}>{errors.imgUrl || errors.imgFile}</p>
              ))}
          </div>
          <div className={inputDivClass}>
            <label htmlFor="defaultEstWaitTime" className={labelClass}>
              An estimate wait time in minutes:*
            </label>
            <span className="flex items-center text-center">
              <input
                id="defaultEstWaitTime"
                type="text"
                className={
                  inputClass(defaultEstWaitTimeError) + " w-20 mr-[10px]"
                }
                value={defaultEstWaitTime}
                onChange={(e) => setDefaultEstWaitTime(e.target.value)}
                required
              />{" "}
              minutes
            </span>
            {defaultEstWaitTimeError && errors.defaultEstWaitTime && (
              <p className={errorClass}>{errors.defaultEstWaitTime}</p>
            )}
          </div>
          <div className={inputDivClass}>
            <label htmlFor="phone" className={labelClass}>
              Phone Number:
            </label>
            <input
              id="phone"
              type="text"
              className={inputClass(phoneError) + " w-full "}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {phoneError && errors.phone && (
              <p className={errorClass}>{errors.phone}</p>
            )}
          </div>
          <div className={inputDivClass}>
            <label htmlFor="hours" className={labelClass}>
              Opening Hours:
            </label>
            <input
              id="hours"
              type="text"
              className={inputClass(hoursError) + " w-full "}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
            {hoursError && errors.hours && (
              <p className={errorClass}>{errors.hours}</p>
            )}
          </div>

          {errors.general && (
            <p className={errorClass + " mt-3"}>{errors.general}</p>
          )}
          <p>* indicate required fields</p>
        </form>
        <div
          className={`flex justify-center pb-2 ${primaryBgClass} pt-3 lg:text-md text-xs `}
          ref={bottomRef}
        >
          <button
            onClick={(e) => handleUpdate(e)}
            className={
              buttonClass + " bg-primary-green hover:bg-primary-dark-green mr-3"
            }
          >
            Submit Update
          </button>
          <button
            className={buttonClass + " bg-red-700 hover:bg-red-900"}
            onClick={handleReset}
          >
            Reset Form
          </button>
        </div>
      </div>
    );
  }
};

export default OutletUpdateModal;
