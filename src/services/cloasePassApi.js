import { getVisitors, updateVisitorStatus } from "./localDb";

export const fetchGatePassesApi = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            const visitors = getVisitors();
            resolve({ data: { data: visitors } });
        }, 300);
    });
};

export const closeGatePassApi = async (id) => {
    return new Promise(resolve => {
        setTimeout(() => {
            updateVisitorStatus(id, {
                gate_pass_closed: true,
                visitor_out_time: new Date().toTimeString().split(' ')[0], // HH:MM:SS
                status: "OUT"
            });
            resolve({ data: { success: true } });
        }, 500);
    });
};