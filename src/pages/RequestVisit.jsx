import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Clock,
  UserCheck,
  SwitchCamera,
  ArrowLeft
} from "lucide-react";
import Footer from "../components/Footer";
import { createVisitRequestApi, fetchVisitorByMobileApi } from "../services/requestApi";
import { fetchPersonsApi } from "../services/personApi";

const AssignTask = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [personToMeetOptions, setPersonToMeetOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [currentFacingMode, setCurrentFacingMode] = useState("environment");
  const [stream, setStream] = useState(null);

  const [formData, setFormData] = useState({
    visitorName: "",
    mobileNumber: "",
    email: "",
    visitorAddress: "",
    purposeOfVisit: "",
    personToMeet: "",
    dateOfVisit: "",
    timeOfEntry: "",
  });

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    openCamera("environment");

    const now = new Date();
    setFormData((prev) => ({
      ...prev,
      dateOfVisit: now.toISOString().split("T")[0],
      timeOfEntry: now.toTimeString().slice(0, 5),
    }));

    fetchPersonToMeetOptions();

    return () => closeCamera();
  }, []);

  /* ---------------- PERSON LIST ---------------- */
  const fetchPersonToMeetOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const data = await fetchPersonsApi();
      setPersonToMeetOptions(data.data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load persons", "error");
    } finally {
      setIsLoadingOptions(false);
    }
  };

  /* ---------------- CAMERA ---------------- */
  const openCamera = async (facingMode) => {
    try {
      if (stream) stream.getTracks().forEach((t) => t.stop());

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        setStream(newStream);
        setCurrentFacingMode(facingMode);
      }
    } catch (err) {
      console.error(err);
      showToast("Camera access failed", "error");
    }
  };

  const switchCamera = async () => {
    const next = currentFacingMode === "user" ? "environment" : "user";
    await openCamera(next);
  };

  const closeCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `visitor_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setPhotoFile(file);
        setCapturedPhoto(URL.createObjectURL(file));
        showToast("Photo captured!", "success");

        // Auto-fill Current Location Address
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=19&addressdetails=1`
                );
                const data = await response.json();
                const a = data.address || {};

                // Build address using all available nearby details
                const parts = [
                  a.amenity || a.building || a.office || a.shop || a.tourism || a.leisure,
                  a.house_number ? `${a.house_number}, ${a.road}` : a.road,
                  a.neighbourhood || a.suburb || a.quarter || a.hamlet || a.village,
                  a.city_district || a.district,
                  a.city || a.town || a.county,
                  a.state,
                  a.postcode,
                ].filter(Boolean);

                // If we got less than 3 parts, fall back to display_name for more detail
                const address = parts.length >= 3
                  ? parts.join(", ")
                  : (data.display_name || parts.join(", "));

                if (address) {
                  setFormData((prev) => ({ ...prev, visitorAddress: address }));
                }
              } catch (error) {
                console.error("Error fetching location address:", error);
              }
            },
            (error) => {
              console.error("Location access denied:", error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setPhotoFile(null);
    openCamera(currentFacingMode);
  };

  /* ---------------- FORM ---------------- */
  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "mobileNumber" && value.length === 10) {
      try {
        const res = await fetchVisitorByMobileApi(value);

        if (res.data?.found) {
          setFormData((prev) => ({
            ...prev,
            visitorName: res.data.data.visitorName || "",
            mobileNumber: res.data.data.mobileNumber || value,
            visitorAddress: res.data.data.visitorAddress || "",
            purposeOfVisit: res.data.data.purposeOfVisit || "",
            personToMeet: res.data.data.personToMeet || "",
          }));

          showToast("Visitor details auto-filled", "success");
        }
      } catch (err) {

        console.log("New visitor, no previous data");
      }
    }
  };


  const validateForm = () => {
    const required = [
      "visitorName",
      "mobileNumber",
      "personToMeet",
      "dateOfVisit",
      "timeOfEntry",
    ];

    for (let f of required) {
      if (!formData[f]?.trim()) {
        showToast(`Please fill ${f}`, "error");
        return false;
      }
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      showToast("Enter valid 10-digit mobile number", "error");
      return false;
    }

    return true;
  };

  /* ---------------- SUBMIT (YOUR API ONLY) ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await createVisitRequestApi({
        ...formData,
        photoFile,
      });

      showToast("Visitor registered successfully!", "success");
      setTimeout(() => navigate("/dashboard/delegation", { replace: true }), 1000);
    } catch (err) {
      console.error(err);
      showToast("Submission failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/login");

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  /* ---------------- UI (UNCHANGED) ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-white pb-16">
      {/* Logo */}


      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-sky-50/80 shadow-lg border border-sky-200 rounded-xl">
          <form
            onSubmit={handleSubmit}
            noValidate
            action="javascript:void(0)"
          >
            {/* Header */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 mr-2 p-4">
                <button
                  onClick={() => navigate("/dashboard/quick-task")}
                  className="flex items-center justify-center w-10 h-10 bg-white text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all shadow-sm hover:shadow-md"
                  title="Back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>


              <div className="text-left">
                <h1 className="text-2xl sm:text-xl md:text-3xl font-semibold text-gray-900">
                  Request Gate Pass
                </h1>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-5">
                {/* Personal Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 font-medium text-sm">
                      <User className="h-4 w-4 mr-2 text-sky-500" />
                      Visitor Name*
                    </label>
                    <input
                      type="text"
                      name="visitorName"
                      value={formData.visitorName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 font-medium text-sm">
                      <Phone className="h-4 w-4 mr-2 text-sky-500" />
                      Mobile Number*
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      pattern="[6-9][0-9]{9}"
                      maxLength="10"
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-medium text-sm">
                    <Mail className="h-4 w-4 mr-2 text-sky-500" />
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-400"
                  />
                </div>

                {/* Photo */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-medium text-sm">
                    <Camera className="h-4 w-4 mr-2 text-sky-500" />
                    Visitor Photo
                  </label>
                  <div className="bg-white/60 border border-gray-300 rounded-lg p-4">
                    {!capturedPhoto ? (
                      <div className="text-center">
                        <div className="relative bg-black rounded-lg overflow-hidden mb-3">
                          <video ref={videoRef} autoPlay className="w-full h-48 object-cover" />
                          <canvas ref={canvasRef} className="hidden" />
                          {/* Camera Switch Button */}
                          <button
                            type="button"
                            onClick={switchCamera}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                            title={`Switch to ${currentFacingMode === 'user' ? 'back' : 'front'} camera`}
                          >
                            <SwitchCamera className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium"
                        >
                          <Camera className="h-3 w-3 mr-1.5 inline" />
                          Capture Photo
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <img src={capturedPhoto} alt="Captured" className="w-full h-48 object-cover rounded-lg mb-3" />
                        <button
                          type="button"
                          onClick={retakePhoto}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium"
                        >
                          Retake Photo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visit Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 font-medium text-sm">
                      <UserCheck className="h-4 w-4 mr-2 text-sky-500" />
                      Person to Meet*
                    </label>
                    <select
                      name="personToMeet"
                      value={formData.personToMeet}
                      onChange={handleChange}
                      required
                      disabled={isLoadingOptions}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-sky-400 disabled:bg-gray-100"
                    >
                      <option value="">
                        {isLoadingOptions ? "Loading options..." : "Select person"}
                      </option>
                      {personToMeetOptions.map((person) => (
                        <option
                          key={person.id}
                          value={person.person_to_meet}
                        >
                          {person.person_to_meet}
                        </option>
                      ))}
                    </select>
                    {isLoadingOptions && (
                      <p className="text-xs text-gray-500">Loading options..</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 font-medium text-sm">
                      <FileText className="h-4 w-4 mr-2 text-sky-500" />
                      Purpose of Visit
                    </label>
                    <input
                      type="text"
                      name="purposeOfVisit"
                      value={formData.purposeOfVisit}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 font-medium text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-sky-500" />
                      Date of Visit*
                    </label>
                    <input
                      type="date"
                      name="dateOfVisit"
                      value={formData.dateOfVisit}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-gray-700 font-medium text-sm">
                      <Clock className="h-4 w-4 mr-2 text-sky-500" />
                      Time of Entry*
                    </label>
                    <input
                      type="time"
                      name="timeOfEntry"
                      value={formData.timeOfEntry}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 font-medium text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-sky-500" />
                    Visitor Address
                  </label>
                  <textarea
                    name="visitorAddress"
                    value={formData.visitorAddress}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-sky-400 resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-sky-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-lg font-medium text-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Request Visit"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div >

      {toast.show && (
        <div className="fixed top-3 right-3 left-3 mx-auto max-w-xs z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg ${toast.type === "success" ? "bg-sky-500" : "bg-red-500"
              } text-white`}
          >
            <div className="text-sm font-medium">{toast.message}</div>
          </div>
        </div>
      )}
      <Footer />
    </div >
  );
};

export default AssignTask;
