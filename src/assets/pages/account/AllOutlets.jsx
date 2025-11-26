import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UpdateOutletModal from "../../components/UpdateOutletModal";
import useApiPrivate from "../../hooks/useApiPrivate";
import AuthorisedUser from "../../components/AuthorisedUser";
import useAuth from "../../hooks/useAuth";
import QRCode from "../../components/QRCodeButton";
import { numericalSort } from "../../utils/sortList";
import { replaceEscaped } from "../../utils/replaceRegex";
import {
  primaryBgTransparentClass,
  primaryBgClass,
  primaryTextClass,
} from "../../styles/tailwind_styles";
import { useBusinessType } from "../../hooks/useBusinessType";

const AllOutlets = () => {
  // Functional States
  const { isAuthenticated, accountId, reloadNav, setReloadNav } = useAuth();
  const apiPrivate = useApiPrivate();
  const navigate = useNavigate();
  const { config } = useBusinessType();

  const [outlets, setOutlets] = useState([]);
  const [outletId, setOutletId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [acctName, setAcctName] = useState("");
  const [selectedOutletData, setSelectedOutletData] = useState(null);
  const [logo, setLogo] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const [errors, setErrors] = useState("");
  const [errorsModal, setErrorsModal] = useState(false);
  const errorClass = `text-red-600 text-center`;

  const toggleEdit = (outletId) => {
    if (outletId) {
      const outletToEdit = outlets.find((outlet) => outlet.id === outletId);
      setSelectedOutletData(outletToEdit);
    } else {
      setSelectedOutletData(null);
    }
    setShowModal(!showModal);
  };

  const handleUpdateSuccess = () => {
    setRefreshTrigger((prev) => !prev);
    setReloadNav(!reloadNav);
    setShowModal(!showModal);
  };

  const handleAuthModalClose = () => {
    setErrors({
      general:
        "Forbidden. There was an issue with validating your staff account. ",
    });
    setErrorsModal(true);
    setShowAuthModal(false);
    //Navigate -1 ?
  };
  const handleNavSettingsAcct = () => {
    navigate(`/db/${accountId}/settings/account`);
  };

  const handleNavigateOutlet = (outletId) => {
    navigate(`/db/${accountId}/outlet/${outletId}`);
  };

  const handleDelete = async (outlet) => {
    console.log("This is the outlet inside handle delete: ", outlet);
    setErrors("");
    setErrorsModal(false);
    setSelectedOutletData(outlet);
    setOutletId(outlet.id);
    setShowAuthModal(true);
  };
  const deleteOutletAllowed = async () => {
    try {
      const res = await apiPrivate.delete(
        `/delOutlet/${accountId}/${outletId}`
      );
      if (res.status === 201) {
        setRefreshTrigger((prev) => !prev);
        setReloadNav(!reloadNav);
        setShowAuthModal(false);
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: `Error deleting outlet ${outletId}` });
      setErrorsModal(true);
      setShowAuthModal(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !accountId) {
      console.log("Account id is not defined ", accountId);
      return;
    }

    const fetchOutlets = async () => {
      try {
        const res = await apiPrivate.get(`/allOutlets/${accountId}`);
        if (res?.data) {
          const sort = numericalSort(res.data.outlets);
          setOutlets(sort);
          setLogo(res.data.accountInfo.logo);
          const name = replaceEscaped(res.data.accountInfo.companyName);
          setAcctName(name);
          // handleOutletText(res.data.accountInfo.businessType);
        }
      } catch (error) {
        console.error(error);
        console.log("Error fetching data in ALL outlets");
        setErrors({ general: { error } });
        setErrorsModal(true);
      }
    };
    fetchOutlets();
  }, [accountId, refreshTrigger, isAuthenticated, apiPrivate]);

  return (
    <div className="pt-15 md:pt-3">
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div
            className={`${primaryBgClass} p-6 rounded-lg shadow-xl relative max-w-sm w-full`}
          >
            <button
              onClick={handleAuthModalClose}
              className={`absolute top-2 right-2 ${primaryTextClass} text-xl font-bold`}
            >
              &times;
            </button>
            <AuthorisedUser
              onSuccess={deleteOutletAllowed}
              onFailure={handleAuthModalClose}
              actionPurpose="OUTLET_DELETED"
              minimumRole="TIER_2"
              outletId={selectedOutletData.id}
            />
          </div>
        </div>
      )}
      <div className="md:mt-5">
        <h1 className={`ml-5 font-semibold mt ${primaryTextClass}`}>
          Welcome back, {acctName}
        </h1>
        <small className={`ml-5 text-sm font-light italic ${primaryTextClass}`}>
          Organizing your queues for your business
        </small>
      </div>

      <div
        className={`rounded-2xl p-3 relative m-1 text-center shadow-lg border-1 border-transparent hover:border-white hover:shadow-white/90 cursor-pointer hover:text-primary-dark-green dark:text-primary-cream ${primaryBgTransparentClass} dark:hover:text-primary-light-green transition ease-in-out my-3 max-w-sm mx-auto md:hidden`}
      >
        <Link
          to={`/db/${accountId}/outlets/new`}
          className="font-extralight text-3xl"
        >
          Create New {config.queueName} +
        </Link>
      </div>

      <h1 className="ml-5 text-sm font-light italic text-stone-500 dark:text-stone-200 mb-5">
        Manage your existing {config.label}s...
      </h1>

      {!logo && (
        <div
          className={`font-light text-primary-dark-green lg:absolute lg:top-0 lg:right-0 lg:w-50 lg:z-1 text-center p-3 ${primaryBgTransparentClass} m-3 border-1 border-red-900`}
        >
          <h1 className="font-bold text-lg">Notification</h1>
          <p className="text-sm">
            Your <span className="font-medium">logo</span> is not set up yet,
            please{" "}
            <button
              onClick={handleNavSettingsAcct}
              className="bg-primary-dark-green text-white px-2 py-1 rounded-xl hover:bg-primary-green cursor-pointer"
            >
              Update Your Logo
            </button>
            .
          </p>
        </div>
      )}

      {errorsModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div
            className={`${primaryBgClass} p-6 rounded-lg shadow-xl relative max-w-sm w-full`}
          >
            <button
              onClick={() => {
                setErrorsModal(!errorsModal);
              }}
              className={`absolute top-2 right-2 ${primaryTextClass} text-xl font-bold`}
            >
              &times;
            </button>
            <p className={errorClass}>{errors.general}</p>
          </div>{" "}
        </div>
      )}
      <div
        className={`grid lg:grid-cols-2 grid-cols-1 mb-10 ${primaryTextClass}`}
      >
        {outlets.map((outlet) => (
          <div
            className={`rounded-2xl p-3 relative m-1 text-center ${primaryBgTransparentClass} shadow-lg`}
            key={outlet.id}
          >
            <Link to={`/db/${accountId}/outlet/${outlet.id}`}>
              <img
                src={`${outlet.imgUrl}`}
                alt=""
                className="rounded-xl w-full max-h-[450px] object-contain"
                onError={(e) =>
                  (e.target.src =
                    "https://placehold.co/150x100/eeeeee/333333?text=Image+Error")
                }
              />
            </Link>

            <div className="z-10 text-xl font-semibold pt-2 text-primary-dark-green dark:text-primary-light-green flex justify-center">
              {outlet.name}
            </div>
            <div className="hover:text-primary-green transition ease-in cursor-pointer mt-1 ">
              <QRCode
                value={outlet.id}
                text={"Print QR Code"}
                prevLocation={window.location.pathname}
              />{" "}
            </div>
            <div
              className="hover:text-primary-green transition ease-in cursor-pointer mt-1"
              onClick={(e) => {
                e.preventDefault();
                toggleEdit(outlet.id); // Pass the ID to toggleEdit
              }}
            >
              <i className="fa-solid fa-pen-to-square pl-1"></i> Edit{" "}
              {config.label} Queue Info
            </div>
            <div
              className="hover:text-primary-green transition ease-in cursor-pointer mt-1"
              onClick={(e) => {
                e.preventDefault();
                handleNavigateOutlet(outlet.id);
              }}
            >
              <i className="fa-solid fa-arrow-right pl-1"></i> This{" "}
              {config.label}'s Queue{" "}
              {outlet.queues[0] ? (
                <span className="text-primary-dark-green dark:text-primary-light-green">
                  {" "}
                  (Active)
                </span>
              ) : (
                <span className="text-red-900 dark:text-red-500">
                  {" "}
                  (Inactive)
                </span>
              )}
            </div>

            <div
              className="transition ease-in 
               rounded-xl mt-1 cursor-pointer hover:text-red-700 "
              onClick={() => handleDelete(outlet)}
            >
              <i className="fa-solid fa-trash"></i> Delete this {config.label}
            </div>
          </div>
        ))}
      </div>

      <UpdateOutletModal
        show={showModal}
        onClose={toggleEdit} // Pass toggleEdit as the close handler
        outletData={selectedOutletData} // Pass the full outlet object
        accountId={accountId}
        onUpdateSuccess={handleUpdateSuccess}
        view={"modal"}
      />
    </div>
  );
};

export default AllOutlets;
