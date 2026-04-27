const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export const LoginCredentialsApi = async (formData) => {
    try {
        const username = (formData.username || "").trim();
        const password = (formData.password || "").trim();

        // Admin override can remain or be removed. Let's send everything to the sheet.
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                action: "login", 
                userId: username,
                password: password
            }),
        });
        
        // Since no-cors doesn't allow reading response, we need a workaround for Google Sheets.
        // Wait, Google Sheets POST can be fetched via GET or simple POST if deployed properly?
        // Actually, if we use no-cors, we can't read the result! 
        // We need to use standard cors, OR use GET with query params for login.
        // Let's use GET with query params so we can read the response.
        
        // Backend se sirf Masters sheet ka poora data mangayenge
        const getUrl = `${SCRIPT_URL}?action=getMasters`;
        const getResponse = await fetch(getUrl);
        const result = await getResponse.json();
        console.log("Masters Data from Script:", result);

        if (result.status === "success" && Array.isArray(result.data)) {
            const mastersData = result.data;
            let loggedInUser = null;

            // Row 0 is header, so loop from index 1
            for (let i = 1; i < mastersData.length; i++) {
                const row = mastersData[i];
                // Column B (Index 1) is userId, Column C (Index 2) is password
                if (row[1]?.toString() === username && row[2]?.toString() === password) {
                    loggedInUser = {
                        user_name: row[0],         // Column A: Name
                        userId: row[1],            // Column B: userId
                        role: row[3],              // Column D: Role
                        page_access: row[4]        // Column E: page access
                    };
                    break;
                }
            }

            if (loggedInUser) {
                return {
                    data: loggedInUser
                };
            } else {
                return {
                    error: "Invalid username or password. Please try again."
                };
            }
        } else {
            return {
                error: result.message || "Failed to fetch Masters data."
            };
        }
    } catch (e) {
        console.error("Login lookup error:", e);
        return {
            error: "Network error during login."
        };
    }
};