import React, { useState, useEffect } from "react";
import {
  primaryBgClass,
  primaryButtonClass as buttonClassInModals,
  xButtonClass as errorButtonInModals,
} from "../styles/tailwind_styles";

const UpdateMaxQueuersModal = ({
  isOpen,
  onClose,
  onUpdate,
  currentMax,
  currentQueueSize,
}) => {
  const [newMax, setNewMax] = useState(currentMax);
  const [error, setError] = useState("");

  // Reset the input value if the modal is reopened
  useEffect(() => {
    if (isOpen) {
      setNewMax(currentMax);
      setError("");
    }
  }, [isOpen, currentMax]);

  if (!isOpen) {
    return null;
  }

  const handleUpdateClick = () => {
    const newMaxInt = parseInt(newMax, 10);
    if (isNaN(newMaxInt) || newMaxInt < 0) {
      return setError("Please enter a valid, non-negative number.");
    }
    if (newMaxInt < currentQueueSize) {
      return setError(
        `Cannot set max to ${newMaxInt}. It's less than the current queue size of ${currentQueueSize}.`
      );
    }
    if (newMaxInt === currentMax) {
      return setError("The new value is the same as the current maximum.");
    }
    // If validation passes, call the onUpdate prop from the parent
    onUpdate(newMaxInt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        className={`flex flex-col items-center ${primaryBgClass} p-10 rounded-3xl m-2 max-w-[400px] relative`}
      >
        <h1 className="text-2xl font-extralight text-center">
          Update Maximum Queuers
        </h1>
        {error && (
          <p className="text-red-700 text-center text-sm px-2 mt-2 border-1 border-red-700 p-2">
            {error}
          </p>
        )}
        <div className="flex flex-col items-center">
          <label htmlFor="maxQueueItems" className="mt-3 font-bold">
            Maximum number of Queuers Allowed
          </label>
          <input
            type="number"
            id="maxQueueItems"
            value={newMax}
            onChange={(e) => setNewMax(e.target.value)}
            className="border-1 p-2 text-center mt-2 text-black dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleUpdateClick} className={buttonClassInModals}>
            Update
          </button>
          <button
            onClick={onClose}
            className={`${errorButtonInModals} right-2`}
          >
            X
          </button>
          <button
            onClick={onClose}
            className={`${buttonClassInModals} bg-red-700 text-white hover:bg-red-900 mt-3
w-full transition ease-in font-light py-2 px-4 rounded focus:outline-none focus:shadow-outline text-center`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateMaxQueuersModal;
