"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logoutUser } from "../services/slice/loginSlice"
import { LogOut, QrCode } from "lucide-react"
import Footer from "../components/Footer"
import QRCodeModal from "../components/QRCodeModal"

const HomePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState({})
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)

  const showToast = (message, type) => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 3000)
  }

  const handleRequestVisit = async () => {
    setIsLoading((prev) => ({ ...prev, requestVisit: true }))
    try {
      await new Promise((r) => setTimeout(r, 500))
      navigate("/dashboard/assign-task")
      showToast("Redirecting to Request Visit...", "success")
    } catch {
      showToast("Navigation failed. Please try again.", "error")
    } finally {
      setIsLoading((prev) => ({ ...prev, requestVisit: false }))
    }
  }

  const handleCloseGatePass = async () => {
    setIsLoading((prev) => ({ ...prev, closeGatePass: true }))
    try {
      await new Promise((r) => setTimeout(r, 500))
      navigate("/dashboard/delegation")
      showToast("Redirecting to Close Gate Pass...", "success")
    } catch {
      showToast("Navigation failed. Please try again.", "error")
    } finally {
      setIsLoading((prev) => ({ ...prev, closeGatePass: false }))
    }
  }

  const handleEmployee = async () => {
    setIsLoading((prev) => ({ ...prev, employee: true }))
    try {
      await new Promise((r) => setTimeout(r, 500))
      navigate("/dashboard/employee")
      showToast("Redirecting to Employee Status...", "success")
    } catch {
      showToast("Navigation failed. Please try again.", "error")
    } finally {
      setIsLoading((prev) => ({ ...prev, employee: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-white flex items-center justify-center p-3 sm:p-4 pb-16">
      <div className="w-full max-w-md mx-auto">

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200/50 rounded-xl sm:rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-white px-4 py-2 border-b border-gray-200/100 relative">
            <div className="flex items-center justify-between">
              <div className="w-8"></div> {/* Spacer */}
              <img
                src="/botivate_logo.jpg"
                alt="Logo"
                className="w-full max-w-[150px] sm:max-w-[180px] md:max-w-[200px] object-contain"
              />
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                title="Show Visitor QR Code"
              >
                <QrCode className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Visitor Request Form
              </h3>
              <p className="text-gray-500 text-xs">
                नोट- ये फॉर्म गेट स्टाफ या विजिटर के द्वारा भरा जाएगा
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">

              {/* Request Visit */}
              <button
                onClick={handleRequestVisit}
                disabled={isLoading.requestVisit}
                className="w-full flex items-center p-3 sm:p-4 bg-gradient-to-r from-sky-50/80 to-blue-50/80 border border-sky-200/60 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 hover:from-sky-100/80 hover:to-blue-100/80 hover:border-sky-300/60 hover:shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-sky-500/90 rounded-md sm:rounded-lg mr-3 group-hover:bg-sky-600/90 transition-colors flex-shrink-0">
                  <i className="fas fa-user-plus text-white text-sm sm:text-base"></i>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-sm sm:text-base font-medium text-gray-800">
                    {isLoading.requestVisit ? "Processing..." : "Request Visit"}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    विज़िट का अनुरोध
                  </p>
                </div>
                {isLoading.requestVisit && (
                  <div className="ml-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-sky-500 border-t-transparent"></div>
                  </div>
                )}
              </button>

              {/* Close Gate Pass */}
              <button
                onClick={handleCloseGatePass}
                disabled={isLoading.closeGatePass}
                className="w-full flex items-center p-3 sm:p-4 bg-gradient-to-r from-sky-50/80 to-blue-50/80 border border-sky-200/60 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 hover:from-sky-100/80 hover:to-blue-100/80 hover:border-sky-300/60 hover:shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-sky-500/90 rounded-md sm:rounded-lg mr-3 group-hover:bg-sky-600/90 transition-colors flex-shrink-0">
                  <i className="fas fa-door-closed text-white text-sm sm:text-base"></i>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-sm sm:text-base font-medium text-gray-800">
                    {isLoading.closeGatePass ? "Processing..." : "Close Gate Pass"}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    गेट पास बंद करें
                  </p>
                </div>
                {isLoading.closeGatePass && (
                  <div className="ml-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-sky-500 border-t-transparent"></div>
                  </div>
                )}
              </button>

              {/* Employees */}
              <button
                onClick={handleEmployee}
                disabled={isLoading.employee}
                className="w-full flex items-center p-3 sm:p-4 bg-gradient-to-r from-sky-50/80 to-blue-50/80 border border-sky-200/60 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 hover:from-sky-100/80 hover:to-blue-100/80 hover:border-sky-300/60 hover:shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-sky-500/90 rounded-md sm:rounded-lg mr-3 group-hover:bg-sky-600/90 transition-colors flex-shrink-0">
                  <i className="fas fa-users text-white text-sm sm:text-base"></i>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-sm sm:text-base font-medium text-gray-800">
                    {isLoading.employee ? "Processing..." : "Employees"}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    कर्मचारी
                  </p>
                </div>
                {isLoading.employee && (
                  <div className="ml-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-sky-500 border-t-transparent"></div>
                  </div>
                )}
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("user-name");
                  localStorage.removeItem("role");
                  localStorage.removeItem("email_id");
                  localStorage.removeItem("isLoggedIn");
                  sessionStorage.clear();
                  dispatch(logoutUser());
                  navigate("/login", { replace: true });
                }}
                className="relative z-10 w-full flex items-center justify-center p-3 sm:p-4 bg-white border border-red-200 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:shadow-sm mt-4"
              >
                <LogOut className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-semibold text-red-600">Logout</span>
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed top-3 right-3 left-3 mx-auto max-w-md z-50">
          <div
            className={`px-6 py-4 rounded-xl shadow-lg ${toast.type === "success"
              ? "bg-sky-500 text-white"
              : "bg-red-500 text-white"
              }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <Footer isFixed={true} />
      
      <QRCodeModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
      />
    </div>
  )
}

export default HomePage
