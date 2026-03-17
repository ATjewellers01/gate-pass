import { saveVisitor, getVisitorByMobile } from "./localDb";

export const createVisitRequestApi = async (data) => {
    return new Promise((resolve) => {
        // Read the photo file as a Base64 string to store it in localStorage
        if (data.photoFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Photo = reader.result;
                const visitorData = {
                    visitor_name: data.visitorName,
                    mobile_number: data.mobileNumber,
                    visitor_address: data.visitorAddress || "",
                    purpose_of_visit: data.purposeOfVisit || "",
                    person_to_meet: data.personToMeet,
                    date_of_visit: data.dateOfVisit,
                    time_of_entry: data.timeOfEntry,
                    visitor_photo: base64Photo
                };
                const saved = saveVisitor(visitorData);
                resolve({ data: { success: true, visitorId: saved.id, message: "Mocked Visit created" } });
            };
            reader.readAsDataURL(data.photoFile);
        } else {
            const visitorData = {
                visitor_name: data.visitorName,
                mobile_number: data.mobileNumber,
                visitor_address: data.visitorAddress || "",
                purpose_of_visit: data.purposeOfVisit || "",
                person_to_meet: data.personToMeet,
                date_of_visit: data.dateOfVisit,
                time_of_entry: data.timeOfEntry,
                visitor_photo: null
            };
            const saved = saveVisitor(visitorData);
            resolve({ data: { success: true, visitorId: saved.id, message: "Mocked Visit created" } });
        }
    });
};

export const fetchVisitorByMobileApi = async (mobile) => {
    return new Promise((resolve) => {
        const visitor = getVisitorByMobile(mobile);
        if (visitor) {
            resolve({
                data: {
                    success: true,
                    found: true,
                    data: {
                        visitorName: visitor.visitor_name,
                        mobileNumber: visitor.mobile_number,
                        visitorAddress: visitor.visitor_address,
                        purposeOfVisit: visitor.purpose_of_visit,
                        personToMeet: visitor.person_to_meet
                    }
                }
            });
        } else {
            resolve({ data: { success: false, found: false } });
        }
    });
};
