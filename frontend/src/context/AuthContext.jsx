import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingRegistration, setPendingRegistration] = useState(null);
    const navigate = useNavigate();
    const API_URL = 'http://localhost:8000';

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('village_app_token');
        if (token) {
            try {
                const response = await fetch(`${API_URL}/auth/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const userData = await response.json();
                    userData.name = userData.full_name;
                    userData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name)}&background=random`;
                    setUser(userData);
                } else {
                    logout();
                }
            } catch (error) {
                console.error("Auth check failed", error);
                logout();
            }
        }
        setLoading(false);
    };

    const login = async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username); // This acts as the email or sabhasad_id field
        formData.append('password', password);

        try {
            const response = await fetch(`${API_URL}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('village_app_token', data.access_token);
            await checkUserLoggedIn();
            return { success: true };
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    };

    const googleLogin = async (idToken) => {
        try {
            const response = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_token: idToken }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Google sign-in failed');
            }

            const data = await response.json();
            localStorage.setItem('village_app_token', data.access_token);
            await checkUserLoggedIn();
            return { success: true };
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    const adminRequestOtp = async (email) => {
        try {
            const response = await fetch(`${API_URL}/auth/admin/request-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to send OTP');
            }

            return await response.json();
        } catch (error) {
            console.error("OTP Request Error:", error);
            throw error;
        }
    };

    const adminVerifyOtp = async (email, otp) => {
        try {
            const response = await fetch(`${API_URL}/auth/admin/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'OTP verification failed');
            }

            const data = await response.json();
            localStorage.setItem('village_app_token', data.access_token);
            await checkUserLoggedIn();
            return { success: true };
        } catch (error) {
            console.error("OTP Verify Error:", error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        // First check if email is already taken before letting user proceed to Step 2
        try {
            const checkResponse = await fetch(`${API_URL}/auth/check-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (checkResponse.ok) {
                const data = await checkResponse.json();
                if (data.exists) {
                    throw new Error("User already registered. Please sign in.");
                }
            }
        } catch (error) {
            console.error("Email verification error:", error);
            if (error.message === "User already registered. Please sign in.") {
                throw error;
            }
        }

        // DON'T save to DB yet — just store temporarily
        // User must complete the application wizard before we create the DB record
        const regData = {
            full_name: name,
            email: email,
            password
        };
        setPendingRegistration(regData);
        localStorage.setItem('pending_registration', JSON.stringify(regData));
        return { success: true };
    };

    const registerAndApply = async (applicationDetails) => {
        // Get pending registration data
        let regData = pendingRegistration;
        if (!regData) {
            const stored = localStorage.getItem('pending_registration');
            if (stored) regData = JSON.parse(stored);
        }
        if (!regData) {
            throw new Error('No pending registration found. Please register first.');
        }

        try {
            // Step 1: Register the user
            const regResponse = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: regData.full_name,
                    email: regData.email,
                    password: regData.password,
                    village_id: applicationDetails.village_id
                }),
            });

            if (!regResponse.ok) {
                const errorData = await regResponse.json();
                throw new Error(errorData.detail || 'Registration failed');
            }

            // Step 2: Login to get token
            await login(regData.email, regData.password);

            // Step 3: Apply for membership with details
            const token = localStorage.getItem('village_app_token');
            const applyResponse = await fetch(`${API_URL}/members/apply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    village_id: applicationDetails.village_id,
                    phone_number: applicationDetails.phone,
                    profession: applicationDetails.profession
                }),
            });

            if (!applyResponse.ok) {
                const errorData = await applyResponse.json();
                throw new Error(errorData.detail || 'Application failed');
            }

            // Clean up pending data
            setPendingRegistration(null);
            localStorage.removeItem('pending_registration');

            // Refresh user data
            await checkUserLoggedIn();
            return { success: true };
        } catch (error) {
            console.error('Register & Apply Error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('village_app_token');
        localStorage.removeItem('village_app_user');
        navigate('/login');
    };

    const applyForMembership = async (details) => {
        const token = localStorage.getItem('village_app_token');
        try {
            const response = await fetch(`${API_URL}/members/apply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    village_id: details.village_id,
                    phone_number: details.phone,
                    profession: details.profession
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Application failed');
            }

            await checkUserLoggedIn();
            return { success: true };
        } catch (error) {
            console.error("Membership Application Error:", error);
            throw error;
        }
    };

    const requestPasswordResetOtp = async (email) => {
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password/request-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to send reset OTP');
            }

            return await response.json();
        } catch (error) {
            console.error("Password Reset Request Error:", error);
            throw error;
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, new_password: newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to reset password');
            }

            return await response.json();
        } catch (error) {
            console.error("Password Reset Error:", error);
            throw error;
        }
    };

    const value = {
        user,
        login,
        googleLogin,
        adminRequestOtp,
        adminVerifyOtp,
        register,
        registerAndApply,
        logout,
        applyForMembership,
        requestPasswordResetOtp,
        resetPassword,
        refreshUser: checkUserLoggedIn,
        pendingRegistration: pendingRegistration || JSON.parse(localStorage.getItem('pending_registration') || 'null'),
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
