import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { apiPrivate } from "../api/axios";
import Loading from "../components/Loading";
import {
  errorClass,
  primaryButtonClass as buttonClass,
  checkBoxClass,
} from "../styles/tailwind_styles";
import LegalPoliciesModal from "../components/LegalPoliciesModal";

const Register = () => {
  //States
  const [companyName, setCompanyName] = useState("");
  const [companyNameErr, setCompanyNameErr] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyEmailErr, setCompanyEmailErr] = useState("");
  const [businessType, setBusinessType] = useState("BASIC");
  const [businessTypeError, setBusinessTypeError] = useState(false);
  const [companyPassword, setCompanyPassword] = useState("");
  const [passwordCompanyError, setPasswordCompanyError] = useState("");
  const [companyCfmPassword, setCompanyCfmPassword] = useState("");
  const [confirmCompanyPasswordError, setConfirmCompanyPasswordError] =
    useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerNameErr, setOwnerNameErr] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerEmailErr, setOwnerEmailErr] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPasswordError, setOwnerPasswordError] = useState("");
  const [errors, setErrors] = useState("");
  const [emailSame, setEmailSame] = useState(false);
  const [passwordSame, setPasswordSame] = useState(false);
  const [capslockOn, setCapslockOn] = useState(false);
  const [showBusinessType, setShowBusinessType] = useState(false);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [privacyPolicyError, setPrivacyPolicyError] = useState(false);
  const [privacyPolicyVersion, setPrivacyPolicyVersion] = useState(null);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);

  const [loading, setLoading] = useState(false);
  //Use hooks imported
  const { login } = useAuth();
  const navigate = useNavigate();

  //Tailwind
  const hideClass = `hidden`;
  const labelClass = `text-gray-500 text-xs transition-all duration-300 cursor-text color-gray-800`;
  const inputClass = (hasError) =>
    `border-1 border-gray-400 rounded-lg bg-transparent appearance-none block w-full py-3 px-4 text-gray-700 text-sm leading-tight focus:outline-none focus:border-black peer active:border-black
  ${hasError ? "border-red-500" : ""}`;

  const linkClass = `text-primary-green hover:text-primary-dark-green transition ease-in`;

  useEffect(() => {
    if (emailSame) {
      setOwnerEmail(companyEmail);
    }
  }, [emailSame, companyEmail]);

  useEffect(() => {
    if (passwordSame) {
      setOwnerPassword(companyPassword);
    }
  }, [passwordSame, companyPassword]);

  const handleAcceptPolicies = (version) => {
    setPrivacyPolicyAccepted(true);
    setPrivacyPolicyVersion(version);
    setShowPoliciesModal(false);
  };
  const handleCheckCapsLock = (e) => {
    setCapslockOn(e.getModifierState("CapsLock"));
  };
  const validateName = (name) => {
    const alphanumericRegex = /^[a-zA-Z0-9 ]+$/;
    return alphanumericRegex.test(name);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setConfirmCompanyPasswordError("");
    setPasswordCompanyError("");
    setCompanyEmailErr("");
    setOwnerEmailErr("");
    setCompanyNameErr("");
    setOwnerNameErr("");
    setOwnerPasswordError("");
    setBusinessType("");
    setPrivacyPolicyError("");

    if (companyEmail.length < 6) {
      setErrors({ general: "Email invalid" });
      setCompanyEmailErr(true);
      return;
    }
    if (!validateName(companyName)) {
      setCompanyNameErr(true);
      setErrors({
        general: "Name can only contain letters, numbers, and spaces.",
      });
      return;
    }
    if (ownerEmail.length < 6) {
      setErrors({ general: "Email invalid" });
      setOwnerEmailErr(true);
      return;
    }
    if (businessType.length === 0) {
      setErrors({ general: "Please select business type" });
      setBusinessTypeError(true);
    }
    if (companyPassword !== companyCfmPassword) {
      setErrors({ general: "Passwords do not match" });
      setConfirmCompanyPasswordError(true);
      return;
    }
    if (companyPassword.length < 6) {
      setErrors({ general: "Invalid password" });
      setPasswordCompanyError(true);
      return;
    }
    if (companyName.length < 3) {
      setErrors({ general: "Invalid company name" });
      setCompanyNameErr(true);
      return;
    }
    if (ownerName.length === 0) {
      setErrors({ general: "Invalid owner name" });
      setOwnerNameErr(true);
      return;
    }
    if (ownerPassword.length < 6) {
      setErrors({ general: "Invalid password" });
      setOwnerPasswordError(true);
      return;
    }
    if (!privacyPolicyAccepted) {
      setErrors({
        general:
          "You must agree to the Terms and Conditions and Privacy Policy.",
      });
      setPrivacyPolicyError(true);
      return;
    }

    const accountInfo = {
      companyName: companyName,
      companyEmail: companyEmail,
      password: companyPassword,
      businessType: businessType,
      privacyPolicyAccepted: privacyPolicyAccepted,
      privacyPolicyVersion: privacyPolicyVersion,
    };

    if (
      !companyEmail ||
      !companyPassword ||
      !companyCfmPassword ||
      !ownerEmail ||
      !ownerPassword ||
      !ownerName ||
      !businessType
    ) {
      setErrors({ general: "Please fill out the required fields" });
      return;
    }

    const ownerInfo = {
      name: ownerName,
      email: ownerEmail,
      role: "OWNER",
      password: ownerPassword,
    };

    try {
      setLoading(true);
      const res = await apiPrivate.post("/register", {
        accountInfo,
        ownerInfo,
      });
      if (res.status === 201 && res.data?.accessToken && res.data?.accountId) {
        console.log("Response from registering: ", JSON.stringify(res.data));
        const data = {
          accessToken: res.data?.accessToken,
          accountId: res.data?.accountId,
          businessType: res.data?.businessType,
        };
        login(data);
        setErrors({});
      } else {
        console.error("Unexpected success response:", JSON.stringify(res.data));
        setErrors({
          general:
            "Registration successful, but unable to redirect. Please try again.",
        });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
      console.error("Axios error: ", err.response?.data.errors);
    } finally {
      setLoading(false);
    }
  };

  const handleInfo = () => {
    setShowBusinessType(!showBusinessType);
  };
  if (loading) {
    return (
      <Loading
        title={"Registering your account!"}
        paragraph={
          "Do Not Navigate Away. Please wait for your account to be registered."
        }
      />
    );
  }
  return (
    <div className="flex lg:h-full lg:items-center ">
      <div className="lg:flex-4/5 w-full flex items-center lg:items-start mt-2 mb-10 py-3 lg:py-5 lg:my-0 justify-center overflow-auto ">
        <div className="bg-white/50 dark:bg-white/80 p-10 rounded-xl shadow-md w-4/5 flex-row md:pb-5 md:pt-5 min-h-full h-auto items-center justify-center">
          <h1 className="text-3xl font-semibold mb-2 font-poppins text-stone-700">
            Great Choice!
          </h1>
          <small className="block text-gray-600">Let's get started.</small>
          <form
            onSubmit={handleSubmit}
            role="form"
            aria-label="Account Registration Form"
          >
            <div className="space-y-4 lg:flex lg:h-full">
              <div className="flex-row p-1">
                <h3 className={`text-primary-green italic`}>
                  Company Information
                </h3>
                <div>
                  <label htmlFor="company-name" className={labelClass}>
                    Company name
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    placeholder="Enter your company name"
                    className={inputClass(!!companyNameErr)} // Use the function
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                    }}
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company-email" className={labelClass}>
                    Company Email
                  </label>
                  <input
                    id="company-email"
                    type="email"
                    placeholder="Enter your company email"
                    className={inputClass(!!companyEmailErr)}
                    onChange={(e) => {
                      setCompanyEmail(e.target.value);
                    }}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="flex items-center m-2 mb-2">
                  <input
                    id="email-same-checkbox"
                    type="checkbox"
                    className={checkBoxClass}
                    onChange={() => {
                      setEmailSame(!emailSame);
                    }}
                    checked={emailSame}
                  />
                  <label
                    htmlFor="email-same-checkbox"
                    className="ms-2 text-xs font-light text-primary-dark-green"
                  >
                    Owner's email is the same as Company email
                  </label>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <label
                    htmlFor="business-type"
                    className={labelClass + " mr-10 "}
                  >
                    Business Type
                  </label>
                  <select
                    id="business-type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className={
                      `border-1 border-gray-400 rounded-lg px-2 py-1` +
                      `${businessTypeError ? " border-red-600" : ""}`
                    }
                  >
                    <option value="">-----Please select an option-----</option>
                    <option value="BASIC">Basic</option>
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="CLINIC">Clinic</option>
                  </select>
                  <br />
                  <div className="cursor-pointer pt-1">
                    {" "}
                    {!showBusinessType && (
                      <div onClick={handleInfo}>
                        <i className="fa-solid fa-caret-right pr-5"></i> More
                        Info...
                      </div>
                    )}
                    {showBusinessType && (
                      <div onClick={handleInfo}>
                        <i className="fa-solid fa-caret-down pr-5"></i>More
                        Info...
                      </div>
                    )}
                  </div>
                  {showBusinessType && (
                    <div className=" text-primary-green mt-2 pl-5 py-2 border-1">
                      <small>
                        <span className="text-primary-dark-green font-semibold">
                          Basic
                        </span>
                        : No pax and you are using us for events.
                      </small>
                      <br />
                      <small>
                        <span className="text-primary-dark-green font-semibold">
                          Clinic
                        </span>
                        : Healthcare facility.
                      </small>
                      <br />
                      <small>
                        <span className="text-primary-dark-green font-semibold">
                          Restaurants
                        </span>
                        : Restaurant usage. (Has Pax).
                      </small>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="company-password" className={labelClass}>
                    Company Password
                  </label>
                  <input
                    id="company-password"
                    type="password"
                    placeholder="Enter your password"
                    className={inputClass(!!passwordCompanyError)} // Use the function
                    onChange={(e) => {
                      setCompanyPassword(e.target.value);
                    }}
                    onKeyUp={handleCheckCapsLock}
                    autoComplete="password"
                    required
                  />
                  {capslockOn && (
                    <div className="text-xs text-red-700">
                      Your CAPSLOCK is on.
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="cfm-company-password" className={labelClass}>
                    Confirm Company Password
                  </label>
                  <input
                    id="cfm-company-password"
                    type="password"
                    placeholder="Confirm Company password"
                    className={inputClass(!!confirmCompanyPasswordError)} // Use the function
                    onChange={(e) => {
                      setCompanyCfmPassword(e.target.value);
                    }}
                    onKeyUp={handleCheckCapsLock}
                    autoComplete="password"
                    required
                  />
                  {capslockOn && (
                    <div className="text-xs text-red-700">
                      Your CAPSLOCK is on.
                    </div>
                  )}
                </div>
                <div className="flex items-center m-2">
                  <input
                    id="password-same-checkbox"
                    type="checkbox"
                    className={checkBoxClass}
                    onChange={() => {
                      setPasswordSame(!passwordSame);
                    }}
                    checked={passwordSame}
                  />
                  <label
                    htmlFor="password-same-checkbox"
                    className="ms-2 text-xs font-light text-primary-dark-green "
                  >
                    Owner's password is the same as Company password
                  </label>
                </div>
              </div>
              <div className="flex-row p-1 ">
                <h3 className={`text-primary-green italic`}>
                  Owner Information
                </h3>
                <div>
                  <label htmlFor="owner-name" className={labelClass}>
                    Owner Name
                  </label>
                  <input
                    id="owner-name"
                    type="text"
                    placeholder="Enter your Owner Name"
                    className={inputClass(ownerNameErr)} // Use the function
                    onChange={(e) => {
                      setOwnerName(e.target.value);
                    }}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className={` ${emailSame ? hideClass : ""}`}>
                  <label htmlFor="owner-email" className={labelClass}>
                    Owner Email
                  </label>
                  <input
                    id="owner-email"
                    type="email"
                    placeholder="Enter your Owner Email"
                    className={inputClass(!!ownerEmailErr)} // Use the function
                    onChange={(e) => {
                      setOwnerEmail(e.target.value);
                    }}
                    autoComplete="email"
                  />
                </div>
                <div className={` ${passwordSame ? hideClass : ""}`}>
                  <label htmlFor="owner-password" className={labelClass}>
                    Owner Password
                  </label>
                  <input
                    id="owner-password"
                    type="password"
                    placeholder="Enter your owner password"
                    className={inputClass(!!ownerPasswordError)} // Use the function
                    onChange={(e) => {
                      setOwnerPassword(e.target.value);
                    }}
                    onKeyUp={handleCheckCapsLock}
                    autoComplete="password"
                  />
                  {capslockOn && (
                    <div className="text-xs text-red-700">
                      Your CAPSLOCK is on.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`flex items-start m-2 space-x-2 ${
                privacyPolicyError ? "border-1 border-red-600" : ""
              }`}
            >
              <input
                id="agree-terms-checkbox"
                type="checkbox"
                className={`${checkBoxClass} mt-1`}
                onChange={(e) => {
                  if (e.target.checked) {
                    setShowPoliciesModal(true);
                  } else {
                    setPrivacyPolicyAccepted(false);
                  }
                }}
                checked={privacyPolicyAccepted}
                required
              />
              <label
                htmlFor="agree-terms-checkbox"
                className="text-xs font-light text-primary-dark-green"
              >
                I have read and agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowPoliciesModal(true)}
                  className="text-primary-green underline hover:text-primary-dark-green"
                >
                  Terms and Conditions and Privacy Policy
                </button>
                .
              </label>
            </div>

            {errors && <p className={errorClass}>{errors.general}</p>}
            <button type="submit" className={buttonClass}>
              Register
            </button>
          </form>

          <p className="mt-3 text-center text-stone-700">
            Already have an account?{" "}
            <Link to="/db/login" className={linkClass}>
              Sign In !
            </Link>
          </p>
        </div>
      </div>
      <div className="h-full hidden w-0 lg:flex md:w-2/5 justify-center items-center">
        <img src="/Q-logo.svg" alt="Queue In Logo" className="p-12" />
      </div>
      <LegalPoliciesModal
        isOpen={showPoliciesModal}
        onClose={() => setShowPoliciesModal(false)}
        onAccept={handleAcceptPolicies}
      />
    </div>
  );
};

export default Register;
