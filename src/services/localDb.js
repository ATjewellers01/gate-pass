// Mock Local Database for Frontend-only operation

const DB_KEY_VISITORS = "gatepass_visitors";
const DB_KEY_PERSONS = "gatepass_persons";

// Sample dummy visitors data for initial population
const DUMMY_VISITORS = [
  {
    id: 1,
    visitor_name: "Rajesh Kumar",
    mobile_number: "9876543210",
    visitor_address: "123 MG Road, Bangalore, Karnataka",
    purpose_of_visit: "Business meeting for project discussion",
    person_to_meet: "John Doe",
    date_of_visit: "2026-03-15",
    time_of_entry: "10:30:00",
    visitor_out_time: "12:45:00",
    visitor_photo: null,
    approval_status: "approved",
    approved_by: "admin",
    approved_at: "2026-03-15T10:25:00.000Z",
    status: "OUT",
    gate_pass_closed: true,
    created_at: "2026-03-15T10:15:00.000Z"
  },
  {
    id: 2,
    visitor_name: "Priya Sharma",
    mobile_number: "9123456789",
    visitor_address: "456 Park Street, Mumbai, Maharashtra",
    purpose_of_visit: "Interview for Software Developer position",
    person_to_meet: "Jane Smith",
    date_of_visit: "2026-03-16",
    time_of_entry: "14:00:00",
    visitor_out_time: null,
    visitor_photo: null,
    approval_status: "approved",
    approved_by: "admin",
    approved_at: "2026-03-16T13:55:00.000Z",
    status: "IN",
    gate_pass_closed: false,
    created_at: "2026-03-16T13:45:00.000Z"
  },
  {
    id: 3,
    visitor_name: "Amit Patel",
    mobile_number: "9988776655",
    visitor_address: "789 Residency Road, Pune, Maharashtra",
    purpose_of_visit: "Vendor meeting for supply discussion",
    person_to_meet: "John Doe",
    date_of_visit: "2026-03-17",
    time_of_entry: "09:15:00",
    visitor_out_time: null,
    visitor_photo: null,
    approval_status: "pending",
    approved_by: null,
    approved_at: null,
    status: "IN",
    gate_pass_closed: false,
    created_at: "2026-03-17T09:10:00.000Z"
  },
  {
    id: 4,
    visitor_name: "Sneha Reddy",
    mobile_number: "9876512340",
    visitor_address: "321 Banjara Hills, Hyderabad, Telangana",
    purpose_of_visit: "Client presentation for new project",
    person_to_meet: "Jane Smith",
    date_of_visit: "2026-03-17",
    time_of_entry: "11:00:00",
    visitor_out_time: null,
    visitor_photo: null,
    approval_status: "pending",
    approved_by: null,
    approved_at: null,
    status: "IN",
    gate_pass_closed: false,
    created_at: "2026-03-17T10:55:00.000Z"
  },
  {
    id: 5,
    visitor_name: "Vikram Singh",
    mobile_number: "9123498765",
    visitor_address: "567 Civil Lines, Delhi",
    purpose_of_visit: "Annual maintenance contract discussion",
    person_to_meet: "John Doe",
    date_of_visit: "2026-03-14",
    time_of_entry: "15:30:00",
    visitor_out_time: "17:00:00",
    visitor_photo: null,
    approval_status: "rejected",
    approved_by: "admin",
    approved_at: "2026-03-14T15:25:00.000Z",
    status: "OUT",
    gate_pass_closed: true,
    created_at: "2026-03-14T15:20:00.000Z"
  },
  {
    id: 6,
    visitor_name: "Ananya Das",
    mobile_number: "9876123450",
    visitor_address: "234 Salt Lake, Kolkata, West Bengal",
    purpose_of_visit: "HR discussion for policy update",
    person_to_meet: "Jane Smith",
    date_of_visit: "2026-03-17",
    time_of_entry: "16:00:00",
    visitor_out_time: null,
    visitor_photo: null,
    approval_status: "approved",
    approved_by: "admin",
    approved_at: "2026-03-17T15:50:00.000Z",
    status: "IN",
    gate_pass_closed: false,
    created_at: "2026-03-17T15:45:00.000Z"
  },
  {
    id: 7,
    visitor_name: "Suresh Rao",
    mobile_number: "9988776611",
    visitor_address: "99 IT Park, Hyderabad",
    purpose_of_visit: "Technical Discussion",
    person_to_meet: "pooja",
    date_of_visit: "2026-03-17",
    time_of_entry: "10:00:00",
    visitor_out_time: null,
    visitor_photo: null,
    approval_status: "pending",
    approved_by: null,
    approved_at: null,
    status: "IN",
    gate_pass_closed: false,
    created_at: "2026-03-17T09:45:00.000Z"
  }
];

// Sample persons data for initial population
const DUMMY_PERSONS = [
  { id: 1, person_to_meet: "John Doe",      phone: "9876543210", password: "john123"   },
  { id: 2, person_to_meet: "Jane Smith",    phone: "9876543211", password: "jane123"   },
  { id: 3, person_to_meet: "Rajesh Verma", phone: "9123456780", password: "rajesh123" },
  { id: 4, person_to_meet: "Meera Iyer",   phone: "9988776644", password: "meera123"  },
  { id: 5, person_to_meet: "pooja",         phone: "9977081395", password: "pooja123"  },
];

// Initialize DB if empty
const initDB = () => {
  const storedVisitors = JSON.parse(localStorage.getItem(DB_KEY_VISITORS) || "[]");
  if (!localStorage.getItem(DB_KEY_VISITORS) || !storedVisitors.find(v => v.id === 7)) {
    // If empty or missing the newly added dummy data (id 7 for pooja), reset visitors
    localStorage.setItem(DB_KEY_VISITORS, JSON.stringify(DUMMY_VISITORS));
  }

  // Always reset persons if none of them have a password (migration for old data)
  const storedPersons = JSON.parse(localStorage.getItem(DB_KEY_PERSONS) || "[]");
  const hasPasswords = storedPersons.some((p) => p.password);
  if (!localStorage.getItem(DB_KEY_PERSONS) || !hasPasswords) {
    localStorage.setItem(DB_KEY_PERSONS, JSON.stringify(DUMMY_PERSONS));
  }
};

initDB();

// --- VISITOR OPERATIONS ---

export const getVisitors = () => {
  return JSON.parse(localStorage.getItem(DB_KEY_VISITORS) || "[]");
};

export const saveVisitor = (visitor) => {
  const visitors = getVisitors();
  const newVisitor = {
    ...visitor,
    id: Date.now(),
    approval_status: visitor.approval_status || "pending",
    status: visitor.status || "IN",
    gate_pass_closed: visitor.gate_pass_closed || false,
    created_at: new Date().toISOString(),
  };
  visitors.push(newVisitor);
  localStorage.setItem(DB_KEY_VISITORS, JSON.stringify(visitors));
  return newVisitor;
};

export const updateVisitorStatus = (id, updates) => {
  const visitors = getVisitors();
  const index = visitors.findIndex((v) => v.id === Number(id));
  if (index !== -1) {
    visitors[index] = { ...visitors[index], ...updates };
    localStorage.setItem(DB_KEY_VISITORS, JSON.stringify(visitors));
    return visitors[index];
  }
  throw new Error("Visitor not found");
};

export const getVisitorByMobile = (mobile) => {
  const visitors = getVisitors();
  return visitors
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .find((v) => v.mobile_number === mobile);
};


// --- PERSON OPERATIONS ---

export const getPersons = () => {
  return JSON.parse(localStorage.getItem(DB_KEY_PERSONS) || "[]");
};

export const savePerson = (person) => {
  const persons = getPersons();
  const newPerson = {
    ...person,
    id: Date.now(),
  };
  persons.push(newPerson);
  localStorage.setItem(DB_KEY_PERSONS, JSON.stringify(persons));
  return newPerson;
};

export const updatePerson = (id, updates) => {
  const persons = getPersons();
  const index = persons.findIndex((p) => p.id === Number(id));
  if (index !== -1) {
    persons[index] = { ...persons[index], ...updates };
    localStorage.setItem(DB_KEY_PERSONS, JSON.stringify(persons));
    return persons[index];
  }
  throw new Error("Person not found");
};

export const deletePerson = (id) => {
  const persons = getPersons();
  const filtered = persons.filter((p) => p.id !== Number(id));
  localStorage.setItem(DB_KEY_PERSONS, JSON.stringify(filtered));
  return true;
};
