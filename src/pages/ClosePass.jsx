"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  CheckCircle2,
  DoorClosed,
  DoorOpen,
  RefreshCw,
  AlertCircle,
  Phone,
  UserCheck,
  MapPin,
  Bell,
  ArrowLeft
} from "lucide-react"
import Footer from "../components/Footer"
import { fetchGatePassesApi, closeGatePassApi } from "../services/cloasePassApi";

const GatePassClosure = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("pending")
  const [pendingGatePasses, setPendingGatePasses] = useState([])
  const [historyGatePasses, setHistoryGatePasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [closingPasses, setClosingPasses] = useState(new Set())
  const previousApprovedRef = useRef(null)

  const fetchGatePassData = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      setError(null);

      const res = await fetchGatePassesApi();
      const rows = res.data.data;

      const pending = rows.filter(
        (r) => !r.gate_pass_closed
      );

      const history = rows.filter(
        (r) => r.gate_pass_closed
      );

      // Check for new approved passes
      const currentApprovedCount = pending.filter(r => r.approval_status?.toLowerCase() === "approved").length;
      
      if (isPolling && previousApprovedRef.current !== null && currentApprovedCount > previousApprovedRef.current) {
         showToast("A new gate pass was just approved!", "info");
      }

      previousApprovedRef.current = currentApprovedCount;

      setPendingGatePasses(pending);
      setHistoryGatePasses(history);

    } catch (err) {
      if (!isPolling) setError("Failed to load gate passes");
      setPendingGatePasses([]);
      setHistoryGatePasses([]);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGatePassData();
    
    // Polling interval (every 5 seconds)
    const intervalId = setInterval(() => {
        fetchGatePassData(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchGatePassData])

  const showToast = (message, type) => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 4000)
  }

  const handleCloseGatePass = async (id) => {
    setClosingPasses(prev => new Set([...prev, id]));

    try {
      await closeGatePassApi(id);

      showToast("Gate pass closed successfully", "success");
      fetchGatePassData();

    } catch (err) {
      showToast("Failed to close gate pass", "error");
    } finally {
      setClosingPasses(prev => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };


  const currentData = activeTab === "pending" ? pendingGatePasses : historyGatePasses

  const handleRefresh = () => {
    fetchGatePassData()
    // showToast("Data refreshed!", "success")
  }

  const getImageUrl = (image) => {
    if (!image) return "/user.png";

    // If it's already a full URL (http/https), return as is
    if (typeof image === "string" && image.startsWith("http")) {
      return image;
    }

    // For localStorage base64 images, return as is
    return image;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-white pb-16">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 p-2 sm:p-4">
        {/* Header with Refresh Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 mr-4 sm:mr-6">
              <button
                onClick={() => navigate("/dashboard/quick-task")}
                className="flex items-center justify-center w-10 h-10 bg-white text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all shadow-sm hover:shadow-md"
                title="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="justify-center py-4 sm:py-6">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                Close Gate Pass
              </h1>
            </div>
          </div>

          {/* Refresh Button - Top Right with Icon Only */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center w-10 h-10 bg-white text-sky-600 hover:bg-sky-50 rounded-lg border border-sky-200 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-sky-50/80 backdrop-blur-sm rounded-lg shadow-sm border border-sky-200/50 overflow-hidden">
          <div className="grid grid-cols-2">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-3 sm:py-4 px-2 sm:px-4 text-center transition-all ${activeTab === "pending"
                ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white"
                : "bg-sky-100/50 text-sky-700 hover:bg-sky-200/50"
                }`}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base font-medium">
                <DoorOpen className="h-4 w-4" />
                Pending ({pendingGatePasses.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 sm:py-4 px-2 sm:px-4 text-center transition-all ${activeTab === "history"
                ? "bg-gradient-to-r from-sky-400 to-blue-400 text-white"
                : "bg-sky-100/50 text-sky-700 hover:bg-sky-200/50"
                }`}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base font-medium">
                <DoorClosed className="h-4 w-4" />
                History ({historyGatePasses.length})
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-sky-50/80 backdrop-blur-sm rounded-lg shadow-sm border border-sky-200/50 p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-sky-500 border-t-transparent mb-2"></div>
            <p className="text-sky-700 text-sm">Loading data...</p>
          </div>
        ) : error ? (
          <div className="bg-orange-50/80 backdrop-blur-sm rounded-lg shadow-sm border border-orange-200/50 p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={fetchGatePassData}
              className="text-red-600 hover:text-red-700 underline text-sm"
            >
              Try again
            </button>
          </div>
        ) : currentData.length === 0 ? (
          <div className="bg-sky-50/80 backdrop-blur-sm rounded-lg shadow-sm border border-sky-200/50 p-8 text-center">
            <DoorClosed className="h-12 w-12 text-sky-400 mx-auto mb-3" />
            <h3 className="font-medium text-sky-700 mb-1">
              {activeTab === "pending" ? "No pending gate passes" : "No history records"}
            </h3>
            <p className="text-sky-600 text-sm">
              {activeTab === "pending"
                ? ""
                : "No completed gate passes found"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {currentData.map((gatePass) => {
              const isClosing = closingPasses.has(gatePass.id)

              return (
                <div
                  key={gatePass.id}
                  className={`bg-sky-50/80 backdrop-blur-sm rounded-lg shadow-sm border border-sky-200/50 p-3 transition-all duration-300 ${isClosing ? 'opacity-70 bg-sky-100' : 'hover:shadow-md hover:border-sky-300'
                    }`}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-white text-sky-700 px-2 py-0.5 rounded text-xs font-semibold border border-sky-200">
                        SRM-{gatePass.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${gatePass.approval_status.toLowerCase() === "approved"
                        ? "bg-sky-500 text-white"
                        : gatePass.approval_status.toLowerCase() === "rejectet"
                          ? "bg-blue-400 text-white"
                          : "bg-gray-500 text-white"
                        }`}>
                        {gatePass.approval_status}
                      </span>
                    </div>

                    {/* Close Button - Top Right, Smaller Width */}
                    {activeTab === "pending" && gatePass.approval_status?.toLowerCase() === "approved" && (!gatePass.gate_pass_closed || gatePass.gate_pass_closed === '') && (
                      <button
                        onClick={() => handleCloseGatePass(gatePass.id)}
                        disabled={isClosing}
                        className={`w-auto px-3 py-1.5 rounded text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 ${isClosing
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-500 to-sky-500 hover:from-red-600 hover:to-sky-600 text-white hover:shadow-md transform hover:scale-105'
                          }`}
                      >
                        {isClosing ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                            <span>Closing...</span>
                          </>
                        ) : (
                          <>
                            <DoorClosed className="h-3 w-3" />
                            <span>Close</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="grid grid-cols-2 sm:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                          {gatePass.visitor_name}
                        </h3>
                        <div className="flex items-center text-xs sm:text-sm text-gray-700">
                          <Phone className="h-3 w-3 text-blue-500 mr-1.5 flex-shrink-0" />
                          <span>{gatePass.mobile_number}</span>
                        </div>
                      </div>

                      <div className="flex items-start text-xs sm:text-sm text-gray-700">
                        <UserCheck className="h-3 w-3 text-purple-500 mr-1.5 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Meeting: </span>
                          <span className="text-gray-600">{gatePass.person_to_meet}</span>
                        </div>
                      </div>

                      <div className="flex items-start text-xs sm:text-sm text-gray-700">
                        <MapPin className="h-3 w-3 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Purpose: </span>
                          <span className="text-gray-600">{gatePass.purpose_of_visit}</span>
                        </div>
                      </div>

                      <div className="flex items-start text-xs sm:text-sm text-gray-700">
                        <div className="h-3 w-3 text-sky-500 mr-1.5 mt-0.5 flex-shrink-0">📅</div>
                        <div>
                          <span className="font-medium">Visit Date: </span>
                          <span className="text-gray-600">
                            {new Date(gatePass.date_of_visit).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start text-xs sm:text-sm text-gray-700">
                        <div className="h-3 w-3 text-blue-500 mr-1.5 mt-0.5 flex-shrink-0">⏰</div>
                        <div>
                          <span className="font-medium">Entry Time: </span>
                          <span className="text-gray-600">
                            {gatePass.time_of_entry
                              ? new Date(`1970-01-01T${gatePass.time_of_entry}`)
                                .toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                              : "N/A"}
                          </span>

                          {gatePass.visitor_out_time && (
                            <div className="mt-0.5">
                              <span className="font-medium">Exit Time: </span>
                              <span className="text-gray-600">
                                {new Date(`1970-01-01T${gatePass.visitor_out_time}`)
                                  .toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                              </span>
                            </div>
                          )}
                        </div>

                      </div>

                      {gatePass.visitor_address && (
                        <div className="flex items-start text-xs sm:text-sm text-gray-700">
                          <div className="h-3 w-3 text-red-500 mr-1.5 mt-0.5 flex-shrink-0">📍</div>
                          <div>
                            <span className="font-medium">Address: </span>
                            <span className="text-gray-600">{gatePass.visitor_address}</span>
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="flex items-center justify-left sm:justify-left m-8">
                      <img
                        src={getImageUrl(gatePass.visitor_photo)}
                        className="w-36 h-36 object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/user.png";
                        }}
                      />
                    </div>

                    {/* Right Column */}

                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 left-4 right-4 z-50 flex justify-center">
          <div className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg border text-white ${
            toast.type === "success" ? "bg-sky-500 border-sky-600" :
            toast.type === "warning" ? "bg-blue-400 border-blue-500" :
            toast.type === "info" ? "bg-sky-400 border-sky-500" :
            "bg-red-500 border-red-600"
            }`}>
            <div className="flex items-center text-sm">
              {toast.type === 'info' ? (
                 <Bell className="h-5 w-5 mr-3 flex-shrink-0 animate-bounce" />
              ) : (
                 <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}

export default GatePassClosure