import { getPersons, savePerson, updatePerson, deletePerson } from "./localDb";

export const fetchPersonsApi = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            const data = getPersons();
            resolve({ data });
        }, 300);
    });
};

export const createPersonApi = async (payload) => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Mapping from personToMeet -> person_to_meet for consistency
            const newPerson = savePerson({
                person_to_meet: payload.personToMeet,
                phone: payload.phone,
                password: payload.password || ""
            });
            resolve({ data: newPerson });
        }, 300);
    });
};

export const updatePersonApi = async (id, payload) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const updated = updatePerson(id, {
                person_to_meet: payload.personToMeet,
                phone: payload.phone,
                password: payload.password || ""
            });
            resolve({ data: updated });
        }, 300);
    });
};

export const deletePersonApi = async (id) => {
    return new Promise(resolve => {
        setTimeout(() => {
            deletePerson(id);
            resolve({ data: { success: true } });
        }, 300);
    });
};
