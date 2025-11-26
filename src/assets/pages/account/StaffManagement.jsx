import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AuthorisedUser from "../../components/AuthorisedUser";
import NotificationModal from "../../components/NotificationModal";
import useApiPrivate from "../../hooks/useApiPrivate";
import useAuth from "../../hooks/useAuth";
import {
  primaryTextClass,
  primaryBgClass,
  primaryBgTransparentClass,
} from "../../styles/tailwind_styles";

const roleData = (
  <div className=" ">
    <h3 className="font-semibold">TIER 1: Full Access</h3>
    <p className="text-sm font-light italic mb-3">
      This tier gives a user complete control over all app functions, including
      creating, editing, and deleting accounts, outlets, and other users. This
      is the equivalent of an Owner of the store or app.
    </p>
    <h3 className="font-semibold">TIER 2: Management Access</h3>
    <p className="text-sm font-light italic mb-3">
      Users in this tier can manage and edit outlet-level data, such as changing
      business types, updating company logos, and overseeing staff. They have
      broad control but do not have the highest-level account-management
      permissions.
    </p>
    <h3 className="font-semibold">TIER 3: Operational Access</h3>
    <p className="text-sm font-light italic mb-3">
      This tier is for staff who need to operate the queue day-to-day. They can
      start and end a queue, add new customers, and call parties. They cannot
      make changes to the account or outlet settings.
    </p>
    <h3 className="font-semibold">TIER 4: View-Only Access</h3>
    <p className="text-sm font-light italic mb-3">
      This is the most basic tier. Users are restricted from sensitive data
      access.
    </p>
  </div>
);

const StaffManagement = () => {
  const [viewModal, setViewModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [password, setPassword] = useState("");
  const [cfmPassword, setCfmPassword] = useState("");
  const [passwordErr, setPasswordErr] = useState(false);
  const [errors, setErrors] = useState({});
  const [name, setName] = useState("");
  const [nameErr, setNameErr] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [refreshPg, setRefreshPg] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [staffToDeleteId, setStaffDeleteId] = useState(null);
  const [staffToUpdateId, setStaffUpdateId] = useState(null);
  const [updateViewModal, setUpdateViewModal] = useState(false);
  const [roleInfo, setRoleInfo] = useState(false);

  //USE HOOKS
  const params = useParams();
  const apiPrivate = useApiPrivate();
  const { isAuthenticated } = useAuth();

  //TAILWIND CLASSES
  const labelClass = ` text-gray-500 text-sm transition-all duration-300 cursor-text dark:text-white`;
  const inputClass = (hasError) =>
    `border-1 border-gray-400 rounded-lg bg-transparent appearance-none block w-full py-3 px-4 text-gray-700 dark:text-white text-xs leading-tight focus:outline-none focus:border-black peer active:border-black
  ${hasError ? "border-red-500" : ""}`;
  const errorClass = `text-red-600 text-center`;
  const buttonClass = ` hover:bg-primary-dark-green hover:text-primary-cream transition ease-in font-light py-2 px-8 rounded-xl focus:outline-none focus:shadow-outline hover:border-transparent border-primary-dark-green border-1`;

  const toggleModal = (toggle) => {
    if (toggle === true) {
      setViewModal(true);
    } else if (toggle === false) {
      setErrors({});
      setEmail("");
      setPassword("");
      setCfmPassword("");
      setName("");
      setViewModal(false);
      setRefreshPg(false);
    }
  };
  const handleOpenModal = () => {
    toggleModal(true);
  };
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };
  const handleRoleInfo = (e) => {
    e.preventDefault();
    console.log("Try to set role true", roleInfo);
    setRoleInfo(true);
  };
  useEffect(() => {
    //Get all existing staff
    if (!isAuthenticated) return;
    console.log("Refreshing page!!");
    const fetchStaff = async () => {
      try {
        const res = await apiPrivate.get(`/staffList/${params.accountId}`);
        if (res.status === 200) {
          console.log("response from staff", res.data);
          setStaffList(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchStaff();
  }, [refreshPg, isAuthenticated]);

  const handleCreateNewStaff = (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setPasswordErr(true);
      setErrors({ general: "Password must be at least 6 characters long." });
      return;
    }
    if (password !== cfmPassword) {
      setPasswordErr(true);
      setErrors({ general: "Confirm password does not match password" });
      return;
    }
    if (name.length === 0) {
      setNameErr(true);
      setErrors({
        general:
          "Name cannot be empty. Staff name will be used to login and verify.",
      });
      return;
    }

    setPasswordErr(false);
    setNameErr(false);
    setErrors({});

    setPendingAction("create");
    setShowAuthModal(true);
  };
  const handleDeleteStaff = (staffId) => {
    setErrors({});
    setStaffDeleteId(staffId);
    setPendingAction("delete");
    setShowAuthModal(true);
  };
  const handleUpdateStaff = (e) => {
    e.preventDefault();
    if (!staffToUpdateId) {
      console.error("No staff ID to update");
      setShowAuthModal(false);
      setPendingAction("null");
      return;
    }
    if (password || cfmPassword) {
      if (password.length < 6) {
        setPasswordErr(true);
        setErrors({
          general: "New password must be at least 6 characters long.",
        });
        return;
      }
      if (password !== cfmPassword) {
        setPasswordErr(true);
        setErrors({ general: "Confirm password does not match new password." });
        return;
      }
    }
    if (name.length === 0) {
      setNameErr(true);
      setErrors({ general: "Name cannot be empty" });
      return;
    }
    setPasswordErr(false);
    setNameErr(false);
    setErrors({});
    setPendingAction("update");
    setShowAuthModal(true);
  };
  const handleUpdateStaffModal = (staffId) => {
    console.log("Handling update staff modal", staffId);
    setStaffUpdateId(staffId);
    const getData = async () => {
      try {
        const res = await apiPrivate.get(
          `/staff/${params.accountId}/${staffId}`
        );
        if (res.status === 200) {
          setName(res.data.name || "");
          setEmail(res.data.email || "");
          setSelectedRole(res.data.role || "");
          setPassword("");
          setCfmPassword("");

          setErrors({});
          setEmailErr(false);
          setPasswordErr(false);
          setNameErr(false);
          setUpdateViewModal(true);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getData();
  };
  const createStaff = async () => {
    try {
      const data = {
        email: email,
        name: name,
        password: password,
        role: selectedRole,
      };
      console.log("Trying to create a staff: ", data);
      const res = await apiPrivate.post(`/newStaff/${params.accountId}`, data);
      if (res.status === 200) {
        setRefreshPg(true);
        setTimeout(() => {
          toggleModal(false);
        }, 1000);
        console.log("response from create staff", res.data);
      }
    } catch (error) {
      console.error(error);
      setErrors({
        general: error.response?.data?.message || "Failed to create a staff",
      });
    } finally {
      setShowAuthModal(false);
      setPendingAction(null);
    }
  };
  const deleteStaff = async () => {
    if (!staffToDeleteId) {
      console.error("No staff ID to delete");
      setShowAuthModal(false);
      setPendingAction(null);
      return;
    }
    try {
      console.log(
        "Attempting to delete a staff with staffID: ",
        staffToDeleteId
      );
      const res = await apiPrivate.delete(
        `staff/${params.accountId}/${staffToDeleteId}`
      );
      if (res.status === 200) {
        console.log(`Staff ${staffToDeleteId} deleted successfully.`);
        setRefreshPg(true);
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      setErrors({
        general: error.response?.data?.message || "Failed to delete staff.",
      });
    } finally {
      setShowAuthModal(false);
      setPendingAction(null);
      setStaffDeleteId(null);
    }
  };
  const updateStaff = async () => {
    try {
      console.log(
        "Attempting to update a staff with staffID: ",
        staffToUpdateId
      );
      const data = {
        name: name,
        email: email,
        password: password,
        role: selectedRole,
      };
      console.log("data to update staff: ", data);
      const res = await apiPrivate.patch(
        `staff/${params.accountId}/${staffToUpdateId}`,
        data
      );
      if (res.status === 200) {
        console.log(`Staff ${staffToUpdateId} updated successfully.`);
        setRefreshPg(true);
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      setErrors({
        general: error.response?.data?.message || "Failed to update staff.",
      });
    } finally {
      setPendingAction(null);
      setStaffUpdateId(null);
      console.log("Set refresh page to true");
      setRefreshPg(true);
      setTimeout(() => {
        toggleUpdateStaffModal(false);
      }, 1000);
      setShowAuthModal(false);
    }
    //TODO: OPEN A MODAL FOR USER TO FILL OUT DATA FOR UPDATING STAFF INFORMATION
  };
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    setPendingAction(null);
    setStaffDeleteId(null);
    setErrors({ general: "Action cancelled or verification failed." });
  };
  const toggleUpdateStaffModal = (toggle) => {
    if (toggle === false) {
      setUpdateViewModal(false);
      setEmail("");
      setPassword("");
      setCfmPassword("");
      setName("");
      setSelectedRole("");
      setEmailErr(false);
      setPasswordErr(false);
      setNameErr(false);
      setRefreshPg(false);
      setStaffUpdateId("");
    } else if (toggle === true) {
      setUpdateViewModal(true);
    }
  };
  const handleAuthSuccess = () => {
    console.log("What is the pending action:", pendingAction);
    if (pendingAction === "create") {
      createStaff();
    } else if (pendingAction === "delete") {
      console.log("Delete staff");
      deleteStaff();
    } else if (pendingAction === "update") {
      console.log("Update staff");
      updateStaff();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl lg:m-10 md:mt-2 md:p-5 pt-15 lg:pt-5 mx-3">
      {updateViewModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div
            className={`${primaryBgClass} ${primaryTextClass} p-5 rounded-2xl m-2 w-md relative`}
          >
            <h3 className="text-xl pb-2 text-center">Update staff</h3>

            <p
              className="absolute top-0 right-0 text-red-700 pr-5 pt-2 hover:text-red-950 transition ease-in active:text-red-950 font-bold cursor-pointer"
              onClick={() => toggleUpdateStaffModal(false)}
            >
              X
            </p>
            <form>
              <div className="flex-row p-1 ">
                <div>
                  <label htmlFor="staff-name" className={labelClass}>
                    Staff Name
                  </label>
                  <input
                    id="staff-name"
                    type="text"
                    placeholder="Enter your staff name"
                    className={inputClass(nameErr)}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    value={name}
                    autoComplete="name"
                    required
                  />
                </div>
                <small className={`text-xs italic ${primaryTextClass}`}>
                  **Your staff will be using this to login
                </small>
                <div className={``}>
                  <label htmlFor="email" className={labelClass}>
                    Staff Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={inputClass(emailErr)}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    value={email}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="">
                  <label htmlFor="role" className={labelClass + " pr-5"}>
                    Staff Role
                  </label>
                  <button
                    className="font-semibold text-xs cursor-pointer mb-3"
                    onClick={(e) => handleRoleInfo(e)}
                  >
                    <i className="fa-solid fa-circle-info pr-3"></i>More info
                    about roles
                  </button>
                  {roleInfo && (
                    <NotificationModal
                      title={"Information about roles:"}
                      paragraph={""}
                      content={roleData}
                      onClose={() => setRoleInfo(false)}
                    />
                  )}

                  <br />
                  <select
                    id="role"
                    name="role"
                    className={`border-1 border-gray-400 rounded-lg bg-transparent appearance-none block w-full py-3 px-4 ${primaryTextClass} ${primaryBgClass} text-xs leading-tight focus:outline-none focus:border-black peer active:border-black`}
                    value={selectedRole}
                    onChange={handleRoleChange}
                  >
                    <option value="" disabled defaultValue>
                      Select a Role
                    </option>
                    <optgroup label="Allowed to perform sensitive functions">
                      <option value="TIER_1">TIER 1: Full Access</option>
                      <option value="TIER_2">TIER 2: Management Access</option>
                    </optgroup>
                    <optgroup label="Allowed to perform basic functions">
                      <option value="TIER_3">TIER 3: Operational Access</option>
                      <option value="TIER_4">TIER 4: View-Only Access</option>
                    </optgroup>
                  </select>
                  <div
                    className={`text-xs leading-3 italic ${primaryTextClass} my-2`}
                  >
                    If you do not choose a role, it will default to previously
                    selected role.
                  </div>
                </div>
                <div className={``}>
                  <label htmlFor="password" className={labelClass}>
                    Staff Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your staff password"
                    className={inputClass(passwordErr)}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    autoComplete="password"
                    required
                  />
                  <div
                    className={`text-xs leading-3 italic ${primaryTextClass} my-2`}
                  >
                    Password is not shown. If you need to change it, please
                    insert the new password here. Else the password will remain
                    the same as before.
                  </div>
                </div>

                <div>
                  <label htmlFor="cfm-staff-password" className={labelClass}>
                    Confirm Staff Password
                  </label>
                  <input
                    id="cfm-staff-password"
                    type="password"
                    placeholder="Confirm Staff password"
                    className={inputClass()}
                    onChange={(e) => {
                      setCfmPassword(e.target.value);
                    }}
                    autoComplete="password"
                    required
                  />
                  <div
                    className={`text-xs leading-3 italic ${primaryTextClass} mt-2`}
                  >
                    Enter a confirm password only if you need to change the
                    password.
                  </div>
                </div>
                <button
                  className={buttonClass + " bg-primary-green text-white"}
                  onClick={handleUpdateStaff}
                >
                  Submit Update Staff
                </button>
              </div>
              {errors && <p className={errorClass}>{errors.general}</p>}{" "}
            </form>
          </div>
        </div>
      )}
      {viewModal && (
        <div
          className={`${primaryBgClass} text-stone-600 dark:text-white p-5 rounded-2xl m-2 w-md relative flex flex-col items-center justify-center`}
        >
          <h3 className="text-xl pb-2 text-center">Create a new staff</h3>
          <p
            className="absolute top-0 right-0 text-red-700 pr-5 pt-2 hover:text-red-950 transition ease-in active:text-red-950 font-bold cursor-pointer"
            onClick={() => toggleModal(false)}
          >
            X
          </p>
          <form>
            <div className="flex-row p-1 ">
              <div>
                <label htmlFor="staff-name" className={labelClass}>
                  Staff Name
                </label>
                <input
                  id="staff-name"
                  type="text"
                  placeholder="Enter your staff name"
                  className={inputClass(nameErr)}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  autoComplete="name"
                  required
                />
              </div>
              <small className="text-xs italic text-stone-600 dark:text-white">
                Your staff will be using this to login
              </small>
              <div className={``}>
                <label htmlFor="email" className={labelClass}>
                  Staff Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={inputClass(emailErr)}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="">
                <label htmlFor="role" className={labelClass}>
                  Staff Role
                </label>
                <br />
                <select
                  id="role"
                  name="role"
                  className="border-1 border-gray-400 rounded-lg bg-transparent appearance-none block w-full py-3 px-4 text-stone-700 dark:text-white text-xs leading-tight focus:outline-none focus:border-black peer active:border-black"
                  value={selectedRole}
                  onChange={handleRoleChange}
                >
                  <option value="" disabled defaultValue>
                    Select a Role
                  </option>
                  <optgroup label="Allowed to perform sensitive functions">
                    <option value="TIER_1">TIER 1: Full Access</option>
                    <option value="TIER_2">TIER 2: Management Access</option>
                  </optgroup>
                  <optgroup label="Allowed to perform basic functions">
                    <option value="TIER_3">TIER 3: Operational Access</option>
                    <option value="TIER_4">TIER 4: View-Only Access</option>
                  </optgroup>
                </select>
                <small className="text-xs italic text-stone-500">
                  If you do not choose a role, it will default to Host.
                </small>
              </div>
              <button
                className="font-semibold text-xs cursor-pointer"
                onClick={(e) => handleRoleInfo(e)}
              >
                <i className="fa-solid fa-circle-info pr-3"></i>More info about
                roles
              </button>
              {roleInfo && (
                <NotificationModal
                  title={"Information about roles:"}
                  paragraph={""}
                  content={roleData}
                  onClose={() => setRoleInfo(false)}
                />
              )}
              <div className={``}>
                <label htmlFor="password" className={labelClass}>
                  Staff Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your staff password"
                  className={inputClass(passwordErr)}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  autoComplete="password"
                  required
                />
              </div>
              <small className="text-xs italic text-stone-500">
                Remember this password
              </small>
              <div>
                <label htmlFor="cfm-staff-password" className={labelClass}>
                  Confirm Staff Password
                </label>
                <input
                  id="cfm-staff-password"
                  type="password"
                  placeholder="Confirm Staff password"
                  className={inputClass()}
                  onChange={(e) => {
                    setCfmPassword(e.target.value);
                  }}
                  autoComplete="password"
                  required
                />
              </div>
              <button
                className={buttonClass + " bg-primary-green text-white mt-3"}
                onClick={handleCreateNewStaff}
              >
                Submit New Staff
              </button>
            </div>
            {errors && <p className={errorClass}>{errors.general}</p>}{" "}
          </form>
        </div>
      )}
      {!viewModal && (
        <div
          className={`lg:p-5 p-2 w-full border-2 border-primary-green rounded-3xl  ${primaryBgTransparentClass} lg:mt-10  `}
        >
          <div className="lg:my-3 mt-4 mb-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-center">
              Staff Onboard
            </h1>
          </div>
          <div className="flex flex-col justify-center items-center w-full">
            <button
              className={`${buttonClass} ${primaryBgClass} dark:text-primary-light-green text-primary-green max-w-lg cursor-pointer mb-3`}
              onClick={handleOpenModal}
            >
              Create New Staff +
            </button>
            {roleInfo && (
              <NotificationModal
                title={"Information about roles:"}
                paragraph={""}
                content={roleData}
                onClose={() => setRoleInfo(false)}
              />
            )}{" "}
          </div>

          <div className={`${primaryBgClass} mx-3`}>
            {staffList.length > 0 && (
              <div className="grid grid-cols-8 w-full dark:text-primary-light-green text-primary-dark-green font-semibold">
                <div
                  className={
                    "border-l-5 border-t-1 border-b-1 border-r-1 border-primary-green text-sm col-span-3 rounded-tl-lg p-5 lg:col-span-2"
                  }
                >
                  Name
                </div>
                <div
                  className={
                    " border-t-1 border-b-1 border-r-1 border-primary-green text-sm  col-span-2 p-5 "
                  }
                >
                  Role{" "}
                  <span
                    className=" cursor-pointer "
                    onClick={(e) => handleRoleInfo(e)}
                  >
                    <i className="fa-solid fa-circle-info font-semibold pr-1"></i>
                    <span className="font-light text-xs lg:block hidden">
                      More info about roles
                    </span>
                  </span>
                </div>
                <div
                  className={
                    "border-t-1 border-b-1 border-r-1 border-primary-green text-sm col-span-2 lg:col-span-2 p-5"
                  }
                >
                  Email
                </div>
                <div
                  className={
                    "border-t-1 border-b-1 border-r-1 border-primary-green text-sm col-span-1 lg:col-span-2 rounded-tr-lg flex items-center p-5"
                  }
                >
                  <i className="fa-solid fa-trash"></i>
                  <span className=" text-sm font-semibold lg:block hidden pl-2 ">
                    Delete Staff
                  </span>
                </div>
              </div>
            )}
            {staffList.length > 0 &&
              staffList.map((staff) => (
                <div
                  className="grid grid-cols-8 w-full font-light"
                  key={staff.id}
                >
                  <div
                    className={
                      "border-l-5 border-b-1 border-r-1 border-primary-green text-sm  col-span-3 lg:col-span-2 p-2 cursor-pointer hover:text-primary-light-green transition ease-in-out"
                    }
                    onClick={() => handleUpdateStaffModal(staff.id)}
                  >
                    <i className="fa-solid fa-pen pr-2"></i>
                    {staff.name}
                  </div>
                  <div
                    className={
                      "border-b-1 border-r-1 border-primary-green text-sm  col-span-2 p-2 "
                    }
                  >
                    {staff.role.replace(/_/g, " ")}
                  </div>
                  <div
                    className={
                      "border-b-1 border-r-1 border-primary-green text-sm lg:col-span-2 col-span-2 p-2 truncate"
                    }
                  >
                    {staff.email}
                  </div>
                  <div
                    className={
                      "border-b-1 border-r-1 border-primary-green text-sm col-span-1 lg:col-span-2 p-2 flex items-center justify-center cursor-pointer"
                    }
                    onClick={() => handleDeleteStaff(staff.id)}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 ">
          <div className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow-xl relative max-w-sm w-full">
            <button
              onClick={handleAuthModalClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              &times;
            </button>

            {pendingAction === "create" && (
              <AuthorisedUser
                onSuccess={handleAuthSuccess}
                onFailure={handleAuthModalClose}
                actionPurpose="STAFF_CREATED"
                minimumRole="TIER_2"
              />
            )}
            {pendingAction === "delete" && (
              <AuthorisedUser
                onSuccess={handleAuthSuccess}
                onFailure={handleAuthModalClose}
                actionPurpose="STAFF_DELETED"
                minimumRole="TIER_2"
              />
            )}
            {pendingAction === "update" && (
              <AuthorisedUser
                onSuccess={handleAuthSuccess}
                onFailure={handleAuthModalClose}
                actionPurpose="STAFF_UPDATED"
                minimumRole="TIER_2"
              />
            )}

            {errors.general && <p className={errorClass}>{errors.general}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
