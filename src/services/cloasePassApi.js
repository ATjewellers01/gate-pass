const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const fetchGatePassesApi = async () => {
    try {
        const response = await fetch(SCRIPT_URL);
        const result = await response.json();
        
        if (result.status === "success" && result.data.length > 6) {
            const headers = result.data[5]; // Row 6 (Index 5)
            
            // Blank rows ko filter karna (Column A ya B khali nahi hona chahiye)
            const dataRows = result.data.slice(6).filter(row => row[0] !== "" || row[1] !== ""); 

            const mappedData = dataRows.map((row, index) => {
                let obj = { id: index };
                headers.forEach((header, i) => {
                    // Trim header and clean it for key mapping
                    const key = (header || "").toString().trim().toLowerCase().replace(/\s+/g, '_').replace(/\./g, '');
                    obj[key] = row[i];
                });
                
                // Compatibility mapping
                obj.visitor_name = obj.visitor_name;
                obj.mobile_number = obj.mobile_number;
                obj.serial_no = obj.serial_no; // Map Serial No. from sheet
                
                // Gate pass closed logic (If Actual1/Column L is filled, it is closed)
                obj.gate_pass_closed = obj.gate_pass_closed === "TRUE" || obj.gate_pass_closed === true || (obj.actual1 && obj.actual1 !== "");
                
                return obj;
            });

            return { data: { data: mappedData } };
        }
        return { data: { data: [] } };
    } catch (error) {
        console.error("Error fetching from Google Sheets:", error);
        return { data: { data: [] } };
    }
};


export const closeGatePassApi = async (id) => {
    // Note: ID yahan row number ya Serial No ho sakta hai
    try {
        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                action: "closeGatePass", 
                serial_no: id, // `id` ab serial_no hai
                actual_2: new Date().toLocaleString('en-IN'), // Column P
                status_2: "Closed" // Column R
            }),
        });
        return { data: { success: true } };
    } catch (error) {
        console.error("Error closing gate pass:", error);
        throw error;
    }
};
