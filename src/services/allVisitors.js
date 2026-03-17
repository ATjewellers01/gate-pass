import { getVisitors } from "./localDb";

export const fetchAllVisitorsApi = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            const visitors = getVisitors();
            // descending sort to show newest first 
            const sorted = visitors.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            resolve({ data: sorted });
        }, 300);
    });
};
