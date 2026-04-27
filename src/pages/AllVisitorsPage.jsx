import React from "react";
import AdminLayout from "../components/AdminLayout";
import AdminAllVisits from "./AllData";

const AllVisitorsPage = () => {
    return (
        <AdminAllVisits initialTab="Visitors" hideTabs={true} readOnly={true} />
    );
};

export default AllVisitorsPage;
