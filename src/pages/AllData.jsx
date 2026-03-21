"use client";
import { useEffect, useState, useRef } from "react";
import { fetchAllVisitorsApi } from "../services/allVisitors.js";
import { updateVisitApprovalApi } from "../services/approvalApi.js";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../services/slice/loginSlice";
import { User, Eye, Search, Filter, Download, ChevronLeft, ChevronRight, CheckCircle, XCircle, Bell, LogOut, Clock, ArrowLeft, QrCode } from "lucide-react";
import {
    fetchPersonsApi,
    createPersonApi,
    updatePersonApi,
    deletePersonApi
} from "../services/personApi";
import QRCodeModal from "../components/QRCodeModal";



const AdminAllVisits = ({ initialTab = "Visitors", hideTabs = false, readOnly = false }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showPersonModal, setShowPersonModal] = useState(false);
    const [persons, setPersons] = useState([]);
    const [personForm, setPersonForm] = useState({ personToMeet: "", phone: "", password: "" });
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [activeMainTab, setActiveMainTab] = useState(initialTab);
    const previousPendingRef = useRef(null);

    const itemsPerPage = 10;

    const fetchData = async (isPolling = false) => {
        try {
            if (!isPolling) setLoading(true);
            const res = await fetchAllVisitorsApi();
            const rows = res.data?.data || res.data || [];
            const visitors = Array.isArray(rows) ? rows : [];
            setData(visitors);

            // Check for new pending requests using ref to avoid stale closures
            const currentPendingCount = visitors.filter(v => v.approval_status?.toLowerCase() === 'pending').length;

            if (isPolling && previousPendingRef.current !== null && currentPendingCount > previousPendingRef.current) {
                showToast("New visitor request received!", "info");
            }

            // Always update the ref after checking
            previousPendingRef.current = currentPendingCount;

        } catch (err) {
            if (!isPolling) setError("Failed to load data");
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await updateVisitApprovalApi({ id, status, approvedBy: "admin" });
            fetchData(); // Refresh data after action
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user-name");
        localStorage.removeItem("role");
        localStorage.removeItem("email_id");
        localStorage.removeItem("isLoggedIn");
        sessionStorage.clear();
        dispatch(logoutUser());
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        fetchData();

        // Polling interval (every 5 seconds)
        const intervalId = setInterval(() => {
            fetchData(true);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []); // Empty dependency array because ref is mutable

    const loadPersons = async () => {
        const res = await fetchPersonsApi();
        setPersons(res.data || []);
    };

    useEffect(() => {
        if (showPersonModal || activeMainTab === "Employees") {
            loadPersons();
        }
    }, [showPersonModal, activeMainTab]);


    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    const closeImageModal = () => {
        setShowImageModal(false);
        setSelectedImage("");
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 4000);
    };

    const filteredData = data.filter(item =>
        Object.values(item).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const filteredPersons = persons.filter(p => 
        p.person_to_meet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm)
    );

    const activeList = activeMainTab === "Visitors" ? filteredData : filteredPersons;
    const totalPages = Math.ceil(activeList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = activeList.slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Approved</span>;
            case 'pending':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Pending</span>;
            case 'rejected':
                return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Rejected</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">{status || 'Unknown'}</span>;
        }
    };

    const getImageUrl = (image) => {
        if (!image) return "/user.png";

        // If it's already a full URL (http/https), return as is
        if (image.startsWith("http")) {
            return image;
        }

        // For localStorage base64 images or any other string, return as is
        // or default to user.png if it's not a valid image
        return image;
    };



    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-3">
                            {readOnly && (
                                <button 
                                    onClick={() => navigate("/dashboard/quick-task")}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                            )}
                            <h1 className="text-2xl font-bold text-gray-900">
                                {readOnly ? "Employee Status" : "Admin Dashboard"}
                            </h1>
                        </div>
                        <p className="text-gray-600 mt-1">
                            {activeMainTab === "Visitors" 
                                ? `Total ${data.length} visitors found` 
                                : `Total ${persons.length} employees found`
                            }
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder={activeMainTab === "Visitors" ? "Search visitors..." : "Search employees..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                        </div>
                        {!readOnly && (
                            <button
                                onClick={() => setShowPersonModal(true)}
                                className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-700"
                            >
                                + Add / Edit Person
                            </button>
                        )}
                        <button
                            onClick={() => setIsQRModalOpen(true)}
                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-sky-200 shadow-sm"
                            title="Show Visitor QR Code"
                        >
                            <QrCode className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-sky-600 border border-sky-200 rounded-lg text-sm font-medium hover:bg-sky-50 shadow-sm transition-colors"
                        >
                            <LogOut className="w-4 h-4 cursor-pointer pointer-events-none" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>

                </div>

                {/* Tab Navigation */}
                {!hideTabs && (
                    <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveMainTab("Visitors")}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeMainTab === "Visitors"
                                ? "bg-white text-sky-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Visitors
                        </button>
                        <button
                            onClick={() => {
                                setActiveMainTab("Employees");
                                loadPersons();
                            }}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeMainTab === "Employees"
                                ? "bg-white text-sky-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Employees
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                {activeMainTab === "Visitors" ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Total Visitors</div>
                            <div className="text-2xl font-bold text-gray-900">{data.length}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Pending</div>
                            <div className="text-2xl font-bold text-yellow-600">
                                {data.filter(v => v.approval_status?.toLowerCase() === 'pending').length}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Approved</div>
                            <div className="text-2xl font-bold text-green-600">
                                {data.filter(v => v.approval_status?.toLowerCase() === 'approved').length}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Rejected</div>
                            <div className="text-2xl font-bold text-red-600">
                                {data.filter(v => v.approval_status?.toLowerCase() === 'rejected').length}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Total Employees</div>
                            <div className="text-2xl font-bold text-gray-900">{persons.length}</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Available</div>
                            <div className="text-2xl font-bold text-green-600">
                                {persons.filter(p => p.status !== 'Absent').length}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Absent</div>
                            <div className="text-2xl font-bold text-red-600">
                                {persons.filter(p => p.status === 'Absent').length}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Logic */}
            {activeMainTab === "Visitors" ? (
                <>
                {/* Visitors Section */}

            {/* Desktop Table */}
            <div className="hidden lg:block">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Visitor Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Visit Info
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Approval & Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Timestamps
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentData.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div
                                                    className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden cursor-pointer mr-4"
                                                    onClick={() => handleImageClick(getImageUrl(v.visitor_photo))}
                                                >
                                                    <img
                                                        src={getImageUrl(v.visitor_photo)}
                                                        alt={v.visitor_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "/user.png";
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{v.visitor_name}</div>
                                                    <div className="text-sm text-gray-600">{v.mobile_number}</div>
                                                    {v.visitor_address && (
                                                        <div className="text-xs text-gray-500 mt-1">{v.visitor_address}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Meeting: {v.person_to_meet}</div>
                                                    <div className="text-sm text-gray-600">Purpose: {v.purpose_of_visit || '-'}</div>
                                                </div>
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-700">Date: {new Date(v.date_of_visit).toLocaleDateString("en-IN")}</div>
                                                    <div className="text-gray-600">
                                                        Entry: {v.time_of_entry ? new Date(`1970-01-01T${v.time_of_entry}`).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : '-'}
                                                    </div>
                                                    <div className="text-gray-600">
                                                        Exit: {v.visitor_out_time ? new Date(`1970-01-01T${v.visitor_out_time}`).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="font-medium text-gray-700 mb-1">Approval Status</div>
                                                    {getStatusBadge(v.approval_status)}
                                                </div>
                                                {v.approved_by && (
                                                    <div className="text-sm">
                                                        <div className="text-gray-600">Approved by: {v.approved_by}</div>
                                                        <div className="text-gray-500 text-xs">
                                                            {v.approved_at ? new Date(v.approved_at).toLocaleString("en-IN") : '-'}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="text-sm">
                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${v.gate_pass_closed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {v.gate_pass_closed ? 'Gate Pass Closed' : 'Gate Pass Open'}
                                                    </div>
                                                </div>
                                                {v.approval_status?.toLowerCase() === 'pending' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleAction(v.id, "approved")}
                                                            className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 text-xs font-medium transition-colors"
                                                        >
                                                            <CheckCircle className="w-3 h-3" /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(v.id, "rejected")}
                                                            className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 text-xs font-medium transition-colors"
                                                        >
                                                            <XCircle className="w-3 h-3" /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1 text-sm">
                                                {/* <div className="text-gray-600">
                                                    <div className="font-medium">Created:</div>
                                                    <div>{new Date(v.created_at).toLocaleString("en-IN")}</div>
                                                </div> */}
                                                {v.status && (
                                                    <div className="text-gray-600">
                                                        <div className="font-medium">Status:</div>
                                                        <div>{v.status}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} visitors
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <ChevronLeft className="h-4 w-4 inline" /> Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next <ChevronRight className="h-4 w-4 inline" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
                {currentData.map((v) => (
                    <div key={v.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                                <div
                                    className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden cursor-pointer flex-shrink-0"
                                    onClick={() => handleImageClick(getImageUrl(v.visitor_photo))}
                                >
                                    <img
                                        src={getImageUrl(v.visitor_photo)}
                                        alt={v.visitor_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/user.png";
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{v.visitor_name}</h3>
                                    <p className="text-sm text-gray-600">{v.mobile_number}</p>
                                    <div className="mt-1">
                                        {getStatusBadge(v.approval_status)}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleImageClick(getImageUrl(v.visitor_photo))}
                                className="p-2 text-gray-500 hover:text-blue-600"
                                title="View photo"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">Meeting Person</p>
                                    <p className="text-sm font-medium text-sky-700">{v.person_to_meet}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Visit Date</p>
                                    <p className="text-sm font-medium">
                                        {new Date(v.date_of_visit).toLocaleDateString("en-IN")}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Purpose</p>
                                <p className="text-sm">{v.purpose_of_visit || '-'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">Entry Time</p>
                                    <p className="text-sm">
                                        {v.time_of_entry ? new Date(`1970-01-01T${v.time_of_entry}`).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Exit Time</p>
                                    <p className="text-sm">
                                        {v.visitor_out_time ? new Date(`1970-01-01T${v.visitor_out_time}`).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : '-'}
                                    </p>
                                </div>
                            </div>

                            {v.approved_by && (
                                <div>
                                    <p className="text-xs text-gray-500">Approved By</p>
                                    <p className="text-sm">{v.approved_by}</p>
                                </div>
                            )}

                            {v.approval_status?.toLowerCase() === 'pending' && (
                                <div className="flex gap-2 pt-2 border-t border-gray-100 mt-3">
                                    <button
                                        onClick={() => handleAction(v.id, "approved")}
                                        className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 text-sm font-medium transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(v.id, "rejected")}
                                        className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 text-sm font-medium transition-colors"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Mobile Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <ChevronLeft className="h-4 w-4 inline mr-1" />
                            Prev
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 inline ml-1" />
                        </button>
                    </div>
                )}
            </div>

                </>
            ) : (
                /* Employees Section */
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {activeMainTab === "Employees" && currentData.map((p) => {
                                    const activeMeeting = data.find(v => v.person_to_meet === p.person_to_meet && v.approval_status?.toLowerCase() === 'approved' && !v.gate_pass_closed);
                                    const isAvailable = p.status !== 'Absent';
                                    
                                    return (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{p.person_to_meet}</div>
                                                {activeMeeting && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full w-fit border border-orange-100 italic">
                                                        <Clock className="w-3 h-3" />
                                                        <span>In Meeting with {activeMeeting.visitor_name}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{p.phone}</td>
                                            <td className="px-6 py-4">
                                                {readOnly ? (
                                                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                                                        isAvailable
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : "bg-red-50 text-red-700 border-red-200"
                                                    }`}>
                                                        {isAvailable ? 'Available' : 'Absent'}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={async () => {
                                                            const newStatus = isAvailable ? 'Absent' : 'Available';
                                                            await updatePersonApi(p.id, {
                                                                personToMeet: p.person_to_meet,
                                                                phone: p.phone,
                                                                password: p.password || "",
                                                                status: newStatus
                                                            });
                                                            loadPersons(); // Refresh data
                                                            showToast(`${p.person_to_meet} marked as ${newStatus}`, "success");
                                                        }}
                                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border-2 ${
                                                            isAvailable
                                                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                        }`}
                                                    >
                                                        {isAvailable ? 'Available' : 'Absent'}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    <span>{isAvailable ? 'Present' : 'Not in Building'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {persons.length === 0 && (
                        <div className="text-center py-12 text-gray-500">No employees found</div>
                    )}
                </div>
            )}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Visitor Photo</h3>
                            <button
                                onClick={closeImageModal}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 flex justify-center">
                            <img
                                src={selectedImage}
                                alt="Visitor"
                                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/user.png";
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Person Modal */}
            {showPersonModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh] shadow-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-semibold text-gray-800">Manage Persons</h2>
                            <button
                                onClick={() => setShowPersonModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-lg"
                            >
                                ×
                            </button>
                        </div>

                        {/* Form */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-xl shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    placeholder="Person Name"
                                    value={personForm.personToMeet}
                                    onChange={(e) =>
                                        setPersonForm({ ...personForm, personToMeet: e.target.value })
                                    }
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 shadow-sm"
                                />
                                <input
                                    placeholder="Phone"
                                    value={personForm.phone}
                                    onChange={(e) =>
                                        setPersonForm({ ...personForm, phone: e.target.value })
                                    }
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 shadow-sm"
                                />
                                <input
                                    placeholder="Password (for login)"
                                    type="password"
                                    value={personForm.password}
                                    onChange={(e) =>
                                        setPersonForm({ ...personForm, password: e.target.value })
                                    }
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 shadow-sm"
                                />
                                <button
                                    onClick={async () => {
                                        if (editingId) {
                                            await updatePersonApi(editingId, personForm);
                                        } else {
                                            await createPersonApi(personForm);
                                        }
                                        setPersonForm({ personToMeet: "", phone: "", password: "" });
                                        setEditingId(null);
                                        loadPersons();
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow ${
                                        editingId
                                            ? "bg-sky-600 hover:bg-sky-700 text-white"
                                            : "bg-sky-600 hover:bg-sky-700 text-white"
                                    }`}
                                >
                                    {editingId ? "Update" : "Add"}
                                </button>
                            </div>
                            {editingId && (
                                <p className="text-sm text-blue-600 mt-3">
                                    Editing mode - Click Update to save changes
                                </p>
                            )}
                        </div>

                        {/* Table */}
                        <div className="rounded-xl overflow-hidden shadow-lg">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="text-left py-4 px-4 font-medium text-gray-700">Name</th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-700">Phone</th>
                                            <th className="text-left py-4 px-4 font-medium text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {persons.map((p, index) => (
                                            <tr key={p.id} className={`hover:bg-gray-50 ${index !== persons.length - 1 ? 'shadow-[0_1px_0_0_rgba(0,0,0,0.05)]' : ''}`}>
                                                <td className="py-4 px-4">{p.person_to_meet}</td>
                                                <td className="py-4 px-4">{p.phone}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(p.id);
                                                                setPersonForm({
                                                                    personToMeet: p.person_to_meet,
                                                                    phone: p.phone,
                                                                    password: p.password || ""
                                                                });
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm("Delete this person?")) {
                                                                    await deletePersonApi(p.id);
                                                                    loadPersons();
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-800 font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {persons.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No persons added yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-4 sm:top-6 right-4 sm:right-6 left-4 sm:left-auto mx-auto sm:mx-0 max-w-sm z-50">
                    <div className={`px-4 py-3 rounded-xl shadow-lg border text-white flex items-center gap-3 ${toast.type === "success" ? "bg-green-500 border-green-600" :
                        toast.type === "info" ? "bg-blue-500 border-blue-600" :
                            "bg-red-500 border-red-600"
                        }`}>
                        <Bell className="w-5 h-5 animate-bounce" />
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button
                            onClick={() => setToast({ show: false, message: "", type: "" })}
                            className="text-white ml-auto p-1 rounded hover:bg-white/20"
                        >
                            <XCircle className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
            {/* QR Code Modal */}
            <QRCodeModal 
                isOpen={isQRModalOpen} 
                onClose={() => setIsQRModalOpen(false)} 
            />

        </div>
    );
};

export default AdminAllVisits;