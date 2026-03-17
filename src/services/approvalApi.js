import { getVisitors, updateVisitorStatus } from "./localDb";

/**
 * GET visits for approval (by personToMeet)
 * @param {string} personToMeet
 */
export const fetchVisitsForApprovalApi = async (personToMeet) => {
    return new Promise(resolve => {
        setTimeout(() => { // Simulate network delay
            const allVisitors = getVisitors();
            let visits;
            
            // If the person is an Admin or Guard, they should see all visits. 
            // In ApprovelPage.jsx, it passes the username here.
            const lowerUser = (personToMeet || "").trim().toLowerCase();
            if (lowerUser === "admin" || lowerUser === "guard" || lowerUser === "aakash agrawal") {
                visits = allVisitors;
            } else {
                 visits = allVisitors.filter(v => (v.person_to_meet || "").trim().toLowerCase() === lowerUser);
            }
            
            resolve({ success: true, visits });
        }, 500);
    });
};

/**
 * PATCH approve / reject visit
 * @param {number} id
 * @param {"approved" | "rejected"} status
 * @param {string} approvedBy
 */
export const updateVisitApprovalApi = async ({ id, status, approvedBy }) => {
    return new Promise(resolve => {
        setTimeout(() => {
            updateVisitorStatus(id, { 
                approval_status: status, 
                approved_by: approvedBy,
                approved_at: new Date().toISOString()
            });
            resolve({ success: true });
        }, 500);
    });
};
