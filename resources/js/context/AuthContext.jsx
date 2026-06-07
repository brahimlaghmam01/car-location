import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await axios.get('/api/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            logoutLocal();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const { access_token, user } = response.data;
            
            localStorage.setItem('auth_token', access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Invalid credentials';
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, password_confirmation, phone = '') => {
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/register', {
                name,
                email,
                password,
                password_confirmation,
                phone
            });
            const { access_token, user } = response.data;

            localStorage.setItem('auth_token', access_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            const errors = error.response?.data?.errors || { message: 'Registration failed' };
            return { success: false, errors };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logoutLocal();
        }
    };

    const logoutLocal = () => {
        localStorage.removeItem('auth_token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const isAdmin = () => {
        return user && (user.role?.slug === 'admin' || user.role?.slug === 'super-admin');
    };

    const isManager = () => {
        return user && (user.role?.slug === 'manager' || user.role?.slug === 'admin' || user.role?.slug === 'super-admin');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser, isAdmin, isManager }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
