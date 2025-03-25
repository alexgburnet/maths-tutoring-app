import { getAccessToken } from "./auth";

class UserService {
    async getUserDetails() {
        const token = getAccessToken();
        if (!token) return null;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));

            return {
                id: payload.user_id,
                name: payload.name,
                surname: payload.surname,
                isAdmin: payload.is_admin,
                exp: payload.exp,
            };
        } catch (error) {
            console.error("Failed to parse token", error);
            return null;
        }
    }
}

export default new UserService();