import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiPrivate } from "../api/axios";
import {
  primaryBgTransparentClass,
  primaryTextClass,
} from "../styles/tailwind_styles";
import { useBusinessType } from "../hooks/useBusinessType";

const QRCode = () => {
  const { accountId, outletId } = useParams();
  const [outlet, setOutlet] = useState({});
  const [account, setAccount] = useState({});
  const [queueActive, setQueueActive] = useState(false);
  const [qrcode, setQrcode] = useState("");
  const { config } = useBusinessType();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOutlet = async () => {
      try {
        const res = await apiPrivate.get(`/outlet/${accountId}/${outletId}`);
        if (res.status === 200) {
          console.log(res.data);
          setOutlet(res.data);
          setQrcode(res.data.qrCode);
          setAccount(res.data.account);
          if (res.data.queues.length === 0) {
            setQueueActive(false);
          } else {
            setQueueActive(true);
          }
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    };
    fetchOutlet();
  }, []);

  const handleGenerateQRCode = async () => {
    console.log("Let's generate qr codes", outletId, accountId);
    try {
      const res = await apiPrivate.post(`/genQRCode/${accountId}/${outletId}`);
      if (res.status === 200) {
        setQrcode(res.data);
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const handleNavigateSettings = () => {
    navigate(`/db/${accountId}/settings/outlet`);
  };

  const handleNavigateAllOutlets = () => {
    navigate(`/db/${accountId}/outlets/all`);
  };
  return (
    <div
      className={`${primaryBgTransparentClass} ${primaryTextClass} mt-15 mx-3 p-3 lg:size-5/6  lg:m-20 lg:p-5 rounded-3xl border border-primary-green `}
    >
      <div className="flex justify-center text-3xl items-center print:text-4xl print:mt-10 mt-5 ">
        <img
          src={account.logo}
          alt={`Image of ${account.companyName}`}
          className="h-15 print:h-20 pr-3 text-xs lg:h-25 object-cover"
        />
        <h1 className="print:text-left">{account.companyName}</h1>{" "}
      </div>
      {!queueActive && (
        <p className="print:hidden text-center font-extralight mt-5">
          FYI: There are no queues active right now.
        </p>
      )}
      {queueActive && (
        <p className="print:hidden text-center font-semibold mt-5">
          FYI: There IS a queue active right now.
        </p>
      )}
      <div className="flex justify-center items-center  mb-10 print:mb-0 border-1 print:border-0 border-primary-light-green p-3 mt-10 print:flex-col print:p-0 print:m-0 relative">
        <div className="">
          <img
            src={qrcode || "N/A"}
            alt={`QR Code for ${outlet.name}`}
            className="print:w-screen"
          />
        </div>
        <div className="print:mt-15 text-2xl text-center print:mb-20 print:ml-0 lg:ml-10 ml-3 ">
          <p className="text-xl font-extralight print:text-5xl italic print:block hidden print:pb-3">
            {" "}
            Join the queue{" "}
          </p>
          <p className="text-xl font-extralight print:hidden italic print:pb-3">
            This is the QR Code for {config.label}:{" "}
          </p>
          <div className="print:text-4xl print:font-black ">{outlet.name}</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center mt-6 print:hidden items-center text-center ">
        <div className="">
          <button
            className=" hover:text-primary-dark-green cursor-pointer font-light py-2 px-4 rounded-2xl"
            onClick={handleNavigateSettings}
          >
            <i className="fa-solid fa-gear pr-3"></i>Settings
          </button>
        </div>
        <div className="">
          <button
            className=" hover:text-primary-dark-green cursor-pointer font-light py-2 px-4 rounded-2xl"
            onClick={handleNavigateAllOutlets}
          >
            <i className="fa-solid fa-house pr-3"></i>Home
          </button>
        </div>
        <button
          onClick={() => window.print()}
          className=" hover:text-primary-dark-green cursor-pointer font-light py-2 px-4 rounded-2xl"
        >
          <i className="fa-solid fa-print pr-3"></i>Print QR Code
        </button>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-md hidden print:block">
        <span className="flex items-end font-black text-primary-green">
          <img src="/Q-logo.svg" alt="Queue In Logo" className=" w-10 " /> UEUE
          IN
        </span>
      </div>

      {/* <button
        onClick={handleGenerateQRCode}
        className=" hover:text-primary-dark-green cursor-pointer text-gray-700 font-light py-2 px-4 rounded-2xl print:hidden"
      >
        Generate a QRCode
      </button> */}
    </div>
  );
};

export default QRCode;
