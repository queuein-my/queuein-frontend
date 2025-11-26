import React, { useState, useEffect } from "react";
import {
  primaryBgClass,
  primaryButtonClass,
  primaryTextClass,
} from "../styles/tailwind_styles";

const LegalPoliciesModal = ({ isOpen, onClose, onAccept }) => {
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(true);

  const extractPolicyVersion = (content) => {
    // Look for pattern: **Version:** 1.0.0
    const versionMatch = content.match(/\*\*Version:\*\*\s*([\d.]+)/);

    if (versionMatch && versionMatch[1]) {
      return versionMatch[1];
    }

    // Fallback: look for last updated date if version not found
    const dateMatch = content.match(/\*\*Last Updated:\*\*\s*([^\n]+)/);
    if (dateMatch && dateMatch[1]) {
      return `date-${dateMatch[1].trim()}`;
    }
    return "unknown";
  };

  useEffect(() => {
    if (isOpen) {
      fetch("/LegalPoliciesForAccounts(Alpha).md")
        .then((res) => res.text())
        .then((text) => {
          setContent(text);
          const extractedVersion = extractPolicyVersion(text);
          setVersion(extractedVersion);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load policies:", err);
          setContent("Failed to load policies. Please try again.");
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAccept = () => {
    // Pass the version to the parent component
    onAccept(version);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className={`${primaryBgClass} ${primaryTextClass} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-300 dark:border-gray-600">
          <div>
            <h2 className="text-2xl font-bold">Legal Policies</h2>
            {version && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Version {version}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-3xl hover:text-red-600 transition-colors"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                {content}
              </pre>
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="p-6 border-t border-gray-300 dark:border-gray-600 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border-2 border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button onClick={handleAccept} className={primaryButtonClass}>
            I Accept (Version {version})
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalPoliciesModal;
