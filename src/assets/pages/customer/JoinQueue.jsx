import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import Error from "../Error";
import { setWithExpiry } from "../../utils/localStorage";
import useLSContext from "../../hooks/useLSContext";
import {
  primaryTextClass,
  secondaryTextClass,
} from "../../styles/tailwind_styles";
import CustomerForm from "../../components/CustomerForm";

//! +Customer must be on mobile.
const JoinQueue = () => {
  //States
  const [accountInfo, setAccountInfo] = useState("");
  const [outlet, setOutlet] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const { acctSlug, queueId } = useParams();
  const navigate = useNavigate();
  const { checkSession } = useLSContext();

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const res = await api.get(`/customerForm/${acctSlug}/${queueId}`);
        setAccountInfo(res.data.accountInfo);
        setOutlet(res.data.queue.outlet);
      } catch (err) {
        setErrors({
          message: "Could not load queue info.",
          statusCode: err.response?.status,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [acctSlug, queueId]);

  const handleSuccess = (data) => {
    const queueItem = data.queueItem;
    const localStorageExpiry = parseInt(
      import.meta.env.VITE_QUEUEITEMLS_EXPIRY
    );
    setWithExpiry(
      "queueItemLS",
      { queueItemId: queueItem.id, queueId: queueItem.queueId, acctSlug },
      localStorageExpiry
    );
    checkSession();
    navigate(`/${acctSlug}/queueItem/${queueItem.id}`);
  };

  if (loading) return <div>Loading...</div>;
  if (errors) return <Error error={errors} />;

  return (
    <div className="p-3 md:p-5">
      <Link
        to={`/${accountInfo.slug}`}
        className={`flex items-center pb-3 border-b-1 ${secondaryTextClass} justify-center `}
      >
        <img
          src={accountInfo.logo}
          alt={`${accountInfo.companyName} logo`}
          className="md:w-20 w-10"
        />
        <h1 className="font-bold pl-3 text-2xl sm:text-4xl sm:pl-6 lg:text-6xl ">
          {accountInfo.companyName}
        </h1>
      </Link>

      <div
        className={`p-2 md:p-6 rounded-xl shadow-md w-full flex flex-col justify-center items-center mx-auto pt-6 pb-12 bg-white/50 dark:bg-stone-700/50 max-w-md`}
      >
        <div className="flex flex-col items-center justify-center w-full">
          <div className=" mb-4 w-full flex justify-center">
            <div className="relative rounded-lg shadow-lg overflow-hidden w-30 h-30 md:w-48 md:h-48">
              <img
                src={outlet.imgUrl}
                alt={`Image of ${outlet.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
                <h1 className={`font-semibold text-lg text-center text-white`}>
                  {outlet.name}
                </h1>
              </div>
            </div>
          </div>

          <CustomerForm
            apiClient={api}
            apiEndpoint={`/customerForm/${acctSlug}/${outlet.id}/${queueId}`}
            onSuccess={handleSuccess}
            showPax={outlet.showPax}
            requirePdpa={true}
            submitButtonText="Sign In"
          />
        </div>
      </div>
    </div>
  );
};

export default JoinQueue;
