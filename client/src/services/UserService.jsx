import axios from './axios';
import { getAccessToken } from "./auth";

class UserService {
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (err) {
            console.error("Failed to decode token", err);
            return null;
        }
    }

    async getUserDetails() {
        const token = getAccessToken();
        if (!token) return null;

        const payload = this.decodeToken(token);
        if (!payload) return null;

        return {
            id: payload.user_id,
            name: payload.name,
            surname: payload.surname,
            email: payload.email,
            isAdmin: payload.is_admin,
            role: payload.is_admin ? "admin" : "user",
            exp: payload.exp,
        };
    }

    async updateUserDetails({ name, surname, email }) {
        const token = getAccessToken();
        if (!token) throw new Error("No access token");

        const res = await fetch("/api/user/update-details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ name, surname, email }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to update user details");
        }

        return await res.json();
    }

    async changePassword(oldPassword, newPassword) {
        const token = getAccessToken();
        if (!token) throw new Error("No access token");

        const res = await fetch("/api/user/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to change password");
        }

        return await res.json();
    }

    async getAllUsers() {
        const res = await axios.get('/admin/users');
        return res.data;
      }
}

export default new UserService();