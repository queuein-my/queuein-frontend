import React, { useEffect, useState, useRef, useCallback } from "react";

import { apiPrivate, interceptedApiPrivate } from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import AuthorisedUser from "../../components/AuthorisedUser";
import Loading from "../../components/Loading";
import { Outlet, useNavigate } from "react-router-dom";
import { replaceEscaped } from "../../utils/replaceRegex";
import {
  primaryButtonClass as buttonClass,
  primaryTextClass,
  primaryBgClass,
  primaryInputClass,
  labelClass,
  errorClass,
  xButtonClass,
} from "../../styles/tailwind_styles";

const SettingsAccount = () => {
  const { accountId, refresh, setReloadNav } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState({});
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [logo, setLogo] = useState("");
  const [slug, setSlug] = useState("");

  const [imgFile, setImgFile] = useState("");
  const [changesExist, setChangesExist] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  const [slugError, setSlugError] = useState(false);
  const [companyNameError, setCompanyNameError] = useState(false);
  const [errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailAddress = import.meta.env.VITE_FEEDBACK_EMAIL_ADDRESS;
  const subject = `Feedback ${companyName} account issue`;

  const [emailModalInfo, setEmailModalInfo] = useState(false);
  const [slugModalInfo, setSlugModalInfo] = useState(false);
  const bottomRef = useRef(null);
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const fetchAccountInfo = async () => {
    try {
      const response = await apiPrivate.get(`/settings/account/${accountId}`);
      console.log(response);
      if (response.data) {
        setAccount(response.data);
        const name = replaceEscaped(response.data.companyName);
        setCompanyName(name);
        setCompanyEmail(response.data.companyEmail);
        setBusinessType(response.data.businessType);
        const updateDate = new Date(response.data.createdAt);
        const formattedTime = updateDate.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        setCreatedAt(formattedTime);
        setLogo(response.data.logo);
        setSlug(response.data.slug);
        setErrors("");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newUrl = URL.createObjectURL(file);
      setImgFile(file);
      setLogo(newUrl);
      console.log("This is new url: ", newUrl);
    } else {
      setImgFile(null);
      setLogo(null);
    }
  };
  const handleNavigateAuditLog = () => {
    setShowAuditLogs(true);
    navigate(`/db/${accountId}/settings/account/auditlogs`, {
      replace: true,
    });
  };
  const checkChange = () => {
    const name = account.companyName;
    const nameChanged = name !== companyName;
    const btChanged = account.businessType !== businessType;
    const slugChanged = account.slug !== slug;
    const fileChanged = imgFile !== null && imgFile !== "";

    setChangesExist(nameChanged || fileChanged || btChanged || slugChanged);
  };
  const handleUpdate = useCallback(
    (e) => {
      e.preventDefault();
      console.log("Changes exist in handle update?", changesExist);
      if (changesExist) {
        setErrors("");
        setShowAuthModal(true);
      }
    },
    [changesExist]
  );
  const updateAccountAllowed = async (staffInfo) => {
    console.log(
      "Update account allowed called from settings account. This is the staff information: ",
      staffInfo
    );
    setCompanyNameError(false);
    setSlugError(false);
    setErrors({});

    if (companyName.length < 5) {
      setCompanyNameError(true);
      setErrors({ general: "Name must be longer than 5 characters" });
      return;
    }
    if (slug.length < 5) {
      setSlugError(true);
      setErrors({ general: "Slug must be longer than 5 characters" });
      return;
    }

    const hasFileToUpload = imgFile !== null;
    let dataToSubmit;
    let payload = {};

    if (hasFileToUpload) {
      dataToSubmit = new FormData();

      if (hasFileToUpload) {
        if (imgFile !== "") {
          dataToSubmit.append("outletImage", imgFile);
        }
      }
      if (account.companyName !== companyName) {
        dataToSubmit.append("companyName", companyName);
      }

      if (account.businessType !== businessType) {
        dataToSubmit.append("businessType", businessType);
      }
      if (account.slug !== slug) {
        dataToSubmit.append("slug", slug);
      }
    } else {
      if (account.companyName !== companyName) {
        dataToSubmit.append("companyName", companyName);
        payload.companyName = companyName;
      }
      if (account.businessType !== businessType) {
        dataToSubmit.append("businessType", businessType);
        payload.businessType = businessType;
      }
      if (account.slug !== slug) {
        dataToSubmit.append("slug", slug);
        payload.slug = slug;
      }
    }
    let hasContent = false;
    for (let pair of dataToSubmit.entries()) {
      hasContent = true;
      break;
    }
    if (!hasContent) {
      setErrors({ general: "No changes detected to update." });
      return;
    }

    try {
      setIsLoading(true);

      let res;
      if (hasFileToUpload) {
        res = await interceptedApiPrivate.patch(
          `/account/${accountId}/profile_picture`,
          dataToSubmit,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        res = await interceptedApiPrivate.patch(
          `/account/${accountId}/profile_picture`,
          payload
        );
      }

      if (res.status === 201) {
        console.log("Res status 201", res.data);

        setIsLoading(false);
        setChangesExist(false);
        setCompanyName(res.data.companyName);
        setBusinessType(res.data.businessType);
        setSlug(res.data.slug);
        setLogo(res.data.logo);
        setImgFile("");
        setAccount(res.data);
        setShowAuthModal(false);
        setErrors("");
        refresh();
        setReloadNav();
      }
    } catch (error) {
      setIsLoading(false);
      setErrors({ general: "Failed to update account. Please try again." });
      console.error(error);
    }
  };
  const handleReset = (e) => {
    e.preventDefault();
    setCompanyName(account.companyName);
    setLogo(account.logo);
    setImgFile("");
    setSlug(account.slug);
  };
  const handleAuthModalClose = () => {
    setErrors({ general: "Forbidden" });
    setShowAuthModal(false);
  };
  useEffect(() => {
    if (companyName || imgFile || logo || businessType || slug) {
      checkChange();
    }
  }, [companyName, imgFile, businessType, slug]);

  const pathname = window.location.pathname;
  const pathnameEndsWithAccountAuditLogs =
    pathname.endsWith("/account/auditlogs");

  useEffect(() => {
    //check first if the route includes auditlogs. if yes, then we show audit logs and hide the normal account stuff
    if (pathnameEndsWithAccountAuditLogs) {
      console.log("Pathname has acct audit logs ");
      setShowAuditLogs(true);
    }
    fetchAccountInfo();
  }, [pathname]);

  const inputDivClass = `px-3 py-1 lg:grid lg:grid-cols-4 items-center lg:pl-5 pb-4`;
  const inputClass = (hasError) =>
    ` ${primaryInputClass} ${hasError ? "border-red-500" : ""}`;

  return (
    <div className="">
      {isLoading && (
        <Loading
          title={"Update Outlet Information"}
          paragraph={"Do Not Navigate Away. Please Wait. "}
        />
      )}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-10">
          <div
            className={`${primaryBgClass}  p-6 rounded-lg shadow-xl relative max-w-sm w-full`}
          >
            <button onClick={handleAuthModalClose} className={xButtonClass}>
              &times;
            </button>
            <AuthorisedUser
              onSuccess={updateAccountAllowed}
              onFailure={handleAuthModalClose}
              actionPurpose="ACCOUNT_UPDATED"
              minimumRole="TIER_2"
              outletId={null}
            />
          </div>
        </div>
      )}
      {showAuditLogs && (
        <div>
          <Outlet />
        </div>
      )}
      {!showAuditLogs && (
        <div className=" md:p-0 relative">
          {emailModalInfo && (
            <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
              <div
                className={`${primaryBgClass} ${primaryTextClass}  p-6 rounded-lg shadow-xl relative max-w-sm w-full`}
              >
                <div
                  className={xButtonClass}
                  onClick={() => {
                    setEmailModalInfo(false);
                  }}
                >
                  <i className="fa-solid fa-x "></i>
                </div>
                <small className="text-red-800 italic p-0 ">
                  Sorry, this field cannot be changed. If you really need to,
                  please contact the admin at{" "}
                  <a
                    href={`mailto:${emailAddress}?subject=${encodeURIComponent(
                      subject
                    )}`}
                  >
                    km_dev@hotmail.com
                  </a>
                </small>
              </div>
            </div>
          )}
          {slugModalInfo && (
            <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
              <div
                className={`${primaryBgClass} ${primaryTextClass} p-6 rounded-lg shadow-xl relative max-w-sm w-full`}
              >
                <div
                  className={xButtonClass}
                  onClick={() => {
                    setSlugModalInfo(false);
                  }}
                >
                  <i className="fa-solid fa-x "></i>
                </div>

                <div className={`text-center ${primaryTextClass}`}>
                  <h1 className="text-2xl text-gray-700 dark:text-primary-cream mb-2 font-semibold">
                    What is a slug?
                  </h1>
                  <div className="text-sm font-light mb-2">
                    A slug is a unique identifier for your store's web address.
                    It's how your store's name will appear in the URL.
                  </div>
                  <div className="text-sm font-light">
                    For example, if your slug is <b>"myshop"</b>,
                    <br />
                    your store's URL will be:{" "}
                    <b>https://onrender.queuein.com/myshop</b>.
                  </div>
                </div>
              </div>
            </div>
          )}
          {changesExist && (
            <div
              className={`fixed p-2 bg-red-900 ${primaryTextClass} top-1/8 right-1/20 rounded-xl shadow-red-900 shadow-lg/30 cursor-pointer z-20 lg:top-1/5 lg:right-1/5`}
              onClick={scrollToBottom}
            >
              <div className="animate-ping bg-red-700 w-3 h-3 rounded-2xl absolute top-0 right-0"></div>
              Changes Exist
            </div>
          )}
          <div
            className={`overflow-y-auto h-auto max-h-[52vh] ${primaryTextClass}`}
          >
            <div
              className={`sticky top-0 left-0 bg-white/90 py-2 ${
                errors ? "block" : "hidden"
              }`}
            >
              {errors && <div className={errorClass}>{errors.general}</div>}
            </div>
            <div className="pl-5 lg:pl-10 mt-5">
              <div className=" text-md ">Welcome to your account settings</div>
              <div className="text-xs font-extralight italic ">
                Your account was created on {createdAt}
              </div>
            </div>
            <div
              className={`py-2.5 px-3 rounded-full lg:rounded-sm lg:p-2 text-sm font-light ${primaryTextClass} border-1 border-primary-cream hover:border-primary-green hover:text-primary-green transition ease-in w-max cursor-pointer mt-5 mr-5 ml-5 md:ml-0 md:absolute md:top-2 md:right-2`}
            >
              <button
                onClick={handleNavigateAuditLog}
                className="hover:text-primary-green transition ease-in cursor-pointer flex justify-center items-center"
              >
                <i className="fa-solid fa-clipboard pr-2"></i>
                <span className={``}> Account Audit Logs</span>
              </button>
            </div>

            <form className="mt-5 mb-5">
              <div className={inputDivClass}>
                <label htmlFor="companyName" className={labelClass}>
                  Company Name:*
                </label>
                <input
                  id="companyName"
                  type="text"
                  className={
                    inputClass(companyNameError) + " lg:col-span-3  w-full "
                  }
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div className={inputDivClass}>
                <label htmlFor="slug" className={labelClass}>
                  <i
                    className="fa-solid fa-circle-info pr-1 cursor-pointer "
                    onClick={() => {
                      setSlugModalInfo(!slugModalInfo);
                    }}
                  ></i>{" "}
                  Slug
                </label>
                <input
                  id="slug"
                  type="text"
                  className={inputClass(slugError) + " lg:col-span-3  w-full "}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div className={inputDivClass}>
                <label htmlFor="businessType" className={labelClass}>
                  Business Type
                </label>
                <select
                  id="businessType"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className={`border-none px-2 py-1 ${primaryTextClass} ${primaryBgClass}`}
                >
                  <option value="BASIC">Basic</option>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="CLINIC">Clinic</option>
                </select>
              </div>
              <div
                className={`px-3 py-1 h-full lg:grid lg:grid-cols-4 items-center lg:pl-5 pb-4`}
              >
                <label htmlFor="companyEmail" className={labelClass}>
                  <i
                    className="fa-solid fa-circle-info pr-1 cursor-pointer "
                    onClick={() => {
                      setEmailModalInfo(!emailModalInfo);
                    }}
                  ></i>
                  Company Email:{" "}
                </label>
                <p
                  className={`lg:col-span-3 appearance-none block pl-1 pt-2 ${primaryTextClass} leading-tight border-gray-400 peer `}
                >
                  {companyEmail}
                </p>
              </div>
              <div className={inputDivClass}>
                <label htmlFor="logo" className={labelClass}>
                  Company Logo:
                </label>
                <input
                  id="logo"
                  type="file"
                  className={inputClass() + "col-span-3 w-full "}
                  onChange={handleFileChange}
                />
                {logo && (
                  <div
                    className={`flex flex-col items-center justify-center ${primaryTextClass}`}
                  >
                    <p className="text-xs font-light mt-3">
                      A sample of the image
                    </p>
                    <img
                      src={logo}
                      alt="Sample of image"
                      className="object-cover rounded-md my-2 w-full"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/150x100/eeeeee/333333?text=Image+Error")
                      }
                    />
                  </div>
                )}
              </div>
              <div
                className="flex justify-center mt-5 lg:mx-10"
                ref={bottomRef}
              >
                <button
                  onClick={(e) => {
                    handleUpdate(e);
                  }}
                  className={
                    buttonClass +
                    " bg-primary-green hover:bg-primary-dark-green mr-3"
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsAccount;
