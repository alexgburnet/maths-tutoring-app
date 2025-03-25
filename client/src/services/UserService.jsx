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
            isAdmin: payload.is_admin,
            role: payload.is_admin ? "admin" : "user",
            exp: payload.exp,
        };
    }
}

export default new UserService();