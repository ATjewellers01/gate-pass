// Mocked Login API
export const LoginCredentialsApi = async (formData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const username = (formData.username || "").trim();
            const password = (formData.password || "").trim();

            if (username === "admin" && password === "admin") {
                resolve({
                    data: {
                        user_name: "admin",
                        role: "admin",
                        email_id: "admin@botivate.com",
                        token: "mock-admin-token-123"
                    }
                });
            } else if (username === "guard" && password === "guard") {
                resolve({
                    data: {
                        user_name: "guard",
                        role: "guard",
                        email_id: "guard@botivate.com",
                        token: "mock-guard-token-456"
                    }
                });
            } else {
                // Check if username+password matches a stored person
                try {
                    const persons = JSON.parse(localStorage.getItem("gatepass_persons") || "[]");
                    const matchedPerson = persons.find(
                        (p) =>
                            p.person_to_meet?.trim().toLowerCase() === username.toLowerCase() &&
                            p.password?.trim() === password
                    );
                    
                    if (matchedPerson) {
                        resolve({
                            data: {
                                user_name: matchedPerson.person_to_meet,
                                role: "person",
                                email_id: matchedPerson.phone || "",
                                token: `mock-person-token-${matchedPerson.id}`
                            }
                        });
                        return;
                    }
                } catch (e) {
                    console.error("Login lookup error:", e);
                }

                resolve({
                    error: "Invalid username or password. Please check your spelling or contact admin."
                });
            }
        }, 500);
    });
};