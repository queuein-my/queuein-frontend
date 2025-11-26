import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import api from "../../api/axios";
import Error from "../Error";
import Loading from "../../components/Loading";
import CustomerForm from "../../components/CustomerForm";

const KioskView = () => {
  const { acctSlug, queueId } = useParams();
  const { outletId, showPax } = useOutletContext();
  const navigate = useNavigate();

  const handleSuccess = (data) => {
    const queueItem = data.queueItem;
    const navigationState = { ...data, outletId };
    navigate(`/${acctSlug}/kiosk/${queueItem.id}/success`, {
      state: { data: navigationState },
    });
  };

  return (
    <div>
      <div className=" flex-row md:pt-3 md:pb-5 justify-self-center relative">
        <h1 className="font-extralight text-2xl italic">Join the queue</h1>
        <CustomerForm
          apiClient={api}
          apiEndpoint={`/kiosk/${acctSlug}/${outletId}/${queueId}`}
          onSuccess={handleSuccess}
          showPax={showPax}
          requirePdpa={true}
          submitButtonText="Join Queue"
        />
      </div>
    </div>
  );
};

export default KioskView;
