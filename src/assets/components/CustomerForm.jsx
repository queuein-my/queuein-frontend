import React, { useState, useEffect } from "react";
import {
  primaryButtonClass as buttonClass,
  primaryInputClass,
  primaryBgClass,
  primaryTextClass,
  labelClass,
  errorClass,
  checkBoxClass,
} from "../styles/tailwind_styles";
import NotificationModal from "./NotificationModal";
import { useBusinessType } from "../hooks/useBusinessType";

const CustomerForm = ({
  apiClient,
  apiEndpoint,
  onSuccess,
  onFailure,
  showPax = false,
  requirePdpa = false,
  submitButtonText = "Submit",
  additionalData = {},
}) => {
  // --- All form state is managed here ---
  const [customerName, setCustomerName] = useState("");
  const [number, setNumber] = useState("");
  const [customerPax, setCustomerPax] = useState(showPax ? "" : 1);
  const [vip, setVIP] = useState(false);
  const [pdpa, setPDPA] = useState(false);

  // --- All error and UI state is managed here ---
  const [validationError, setValidationError] = useState("");
  const [nameError, setNameError] = useState(false);
  const [numberError, setNumberError] = useState(false);
  const [paxError, setPaxError] = useState(false);
  const [pdpaError, setPDPAError] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const { config } = useBusinessType();

  // --- All helper functions are here ---
  const extractNumerals = (s) => s.replace(/\D/g, "");
  const validMalaysianNumber = (num) => {
    const numeralsOnly = extractNumerals(num);
    const regex = /^(\+?6?01)[02-46-9]-*[0-9]{7}$|^(\+?6?01)[1]-*[0-9]{8}$/gm;
    return regex.test(numeralsOnly);
  };

  const inputClass = (hasError) =>
    `${primaryInputClass} ${hasError ? "border-red-500" : ""}`;

  // --- All validation logic is here ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reset errors
    setValidationError("");
    setNameError(false);
    setNumberError(false);
    setPaxError(false);
    setPDPAError(false);

    // --- Validation Checks ---
    if (requirePdpa && !pdpa) {
      setPDPAError(true);
      return setValidationError(
        "Please consent to the Privacy Notice to proceed."
      );
    }
    if (!customerName) {
      setNameError(true);
      return setValidationError("Please enter a name.");
    }
    if (!validMalaysianNumber(number)) {
      setNumberError(true);
      return setValidationError("Please enter a valid Malaysian phone number.");
    }
    if (showPax && (!customerPax || customerPax <= 0)) {
      setPaxError(true);
      return setValidationError("Please enter a valid party size.");
    }

    // --- API Call ---
    const formattedNumber = extractNumerals(number);
    const dataToSubmit = {
      customerName,
      customerNumber: formattedNumber,
      VIP: vip,
      pax: showPax ? parseInt(customerPax) : 1,
      ...(requirePdpa && { pdpaConsent: pdpa }),
      ...additionalData, // Merge any extra data from props
    };

    try {
      const res = await apiClient.post(apiEndpoint, dataToSubmit);
      if (res.status === 201 || res.status === 200) {
        onSuccess(res.data); // Trigger success callback from parent
      }
    } catch (err) {
      if (onFailure) {
        onFailure(err); // Trigger failure callback if provided
      } else {
        setValidationError(
          err.response?.data?.message || "An unexpected error occurred."
        );
      }
    }
  };

  return (
    <>
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <NotificationModal
            title={"Privacy Policy"}
            paragraph={"Your privacy is important to us."}
            onClose={() => setShowPolicyModal(false)}
            content={
              <div className={`${primaryBgClass} ${primaryTextClass}`}>
                <h2 className="mb-4 mt-4 text-xl font-bold">
                  Privacy Notice for {config.customerLabel}
                </h2>
                <div className="overflow-y-auto pr-4 text-sm max-h-[60vh]">
                  <p className="mb-2 font-semibold">
                    Last Updated:{" "}
                    {import.meta.env.VITE_CUSTOMER_POLICY_LAST_UPDATED}
                  </p>
                  <p className="mb-3">
                    This establishment uses <strong>queuein</strong> to manage
                    its queue. We respect your privacy and handle your data in
                    accordance with the Malaysian Personal Data Protection Act
                    2010 (PDPA).
                  </p>

                  <h3 className="font-semibold mb-1">What We Collect & Why</h3>
                  <ul className="list-disc pl-5 mb-3">
                    <li>
                      <strong>Your Name & Party Size:</strong> To identify you
                      in the queue.
                    </li>
                    <li>
                      <strong>Your Contact Number:</strong> To notify you when
                      it's your turn.
                    </li>
                  </ul>
                  <h3 className="font-semibold mb-1">Data Retention</h3>
                  <p className="mb-3">
                    Your personal data is <strong>automatically deleted</strong>{" "}
                    from our systems within 24 hours after the queue ends,
                    unless you consent to join this establishment's VIP list.
                  </p>
                  <h3 className="font-semibold mb-1">Your Rights</h3>
                  <p>
                    You have the right to request access to or deletion of your
                    data. Please contact the staff or email our developer at{" "}
                    {import.meta.env.VITE_FEEDBACK_EMAIL_ADDRESS}.
                  </p>
                </div>
              </div>
            }
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <div className="mb-2">
          <label htmlFor="customer-name" className={labelClass}>
            Name
          </label>
          <input
            id="customer-name"
            type="text"
            placeholder="Enter name"
            className={inputClass(nameError)}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>

        <div className="mb-2">
          <label htmlFor="contact-number" className={labelClass}>
            Contact Number
          </label>
          <input
            id="contact-number"
            type="text"
            placeholder="Enter contact number"
            className={inputClass(numberError)}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
        </div>

        {showPax && (
          <div className="mb-2">
            <label htmlFor="customer-pax" className={labelClass}>
              PAX
            </label>
            <input
              id="customer-pax"
              type="number"
              placeholder="Party size"
              className={inputClass(paxError)}
              onChange={(e) => setCustomerPax(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex items-center rounded-md p-2">
          <input
            id="vip"
            type="checkbox"
            className={checkBoxClass}
            onChange={() => setVIP(!vip)}
            checked={vip}
          />
          <label htmlFor="vip" className="ms-2 text-xs font-light pl-1">
            Join VIP list for future offers.
          </label>
        </div>

        {requirePdpa && (
          <div
            className={`flex items-center mb-3 rounded-md p-2 ${
              pdpaError ? "border border-red-500" : ""
            }`}
          >
            <input
              id="pdpa"
              type="checkbox"
              className={checkBoxClass}
              onChange={() => {
                setPDPA(!pdpa);
                setPDPAError(false);
              }}
              checked={pdpa}
            />
            <label htmlFor="pdpa" className="ms-2 text-xs font-light pl-1">
              I consent to the{" "}
              <span
                onClick={(e) => {
                  e.preventDefault();
                  setShowPolicyModal(true);
                }}
                className={`underline cursor-pointer font-bold ${
                  pdpaError ? "text-red-700" : "text-primary-green"
                }`}
              >
                Privacy Notice.
              </span>
            </label>
          </div>
        )}

        {validationError && <p className={errorClass}>{validationError}</p>}
        <div className="flex w-full justify-center pt-2">
          <button type="submit" className={buttonClass}>
            {submitButtonText}
          </button>
        </div>
      </form>
    </>
  );
};

export default CustomerForm;
