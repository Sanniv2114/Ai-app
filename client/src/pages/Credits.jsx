import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Credits = () => {
  const [plans, setPlans] = useState([]); // ✅ FIXED: defines plans properly
  const [loading, setLoading] = useState(true);
  const { token, axios, user, fetchUser } = useAppContext();

  // ✅ Fetch available credit plans
  const fetchPlans = async () => {
    try {
      const { data } = await axios.get("/api/credit/plan", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched plans:", data); // ✅ Debugging

      if (data.success && Array.isArray(data.plans)) {
        setPlans(data.plans);
      } else {
        setPlans([]); // ✅ fallback to empty array
        toast.error(data.message || "Failed to fetch plans");
      }
    } catch (error) {
      setPlans([]);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Purchase selected plan & redirect to Stripe
  const purchasePlan = async (planId) => {
    console.log("Starting...",planId)
    try {
      const { data } = await axios.post(
        "/api/credit/purchase",
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("hello--",data)

      if (data.success && data.url) {
        toast.success("Redirecting to secure checkout...");
        window.location.href = data.url;
      } else {
        throw new Error(data.message || "Purchase failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ Check if redirected after successful payment
  const checkPaymentSuccess = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const canceled = urlParams.get("canceled");

    if (success) {
      await fetchUser(); // refresh global user data
      toast.success("Credits updated successfully!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (canceled) {
      toast.error("Payment was canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  useEffect(() => {
    fetchPlans();
    checkPaymentSuccess();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-semibold text-center mb-10 xl:mt-30 text-gray-800 dark:text-white">
        Credits Plans
      </h2>

      {/* ✅ Display current credits */}
      <div className="text-center mb-8 text-lg text-gray-700 dark:text-gray-300">
        Current Credits:{" "}
        <span className="font-bold text-purple-600 dark:text-purple-300">
          {user?.credits ?? 0}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        {Array.isArray(plans) && plans.length > 0 ? (
          plans.map((plan) => (
            <div
              key={plan._id}
              className={`border border-gray-200 dark:border-purple-700 rounded-lg shadow hover:shadow-lg transition-shadow p-6 min-w-[300px] flex flex-col ${
                plan._id === "pro"
                  ? "bg-purple-50 dark:bg-purple-900"
                  : "bg-white dark:bg-transparent"
              }`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-300 mb-4">
                  ${plan.price}
                  <span className="text-base font-normal text-gray-600 dark:text-purple-200">
                    {" "}
                    / {plan.credits} credits
                  </span>
                </p>

                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-purple-200 space-y-1">
                  {Array.isArray(plan.features)
                    ? plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))
                    : null}
                </ul>
              </div>

              <button
                onClick={() =>
                  toast.promise(purchasePlan(plan._id), {
                    loading: "Processing...",
                    success: "Redirecting...",
                    error: "Purchase failed",
                  })
                }
                className="mt-6 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium py-2 rounded transition-colors cursor-pointer"
              >
                Buy Now
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-300 text-center w-full">
            No plans available right now.
          </p>
        )}
      </div>
    </div>
  );
};

export default Credits;






