import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const getToken = () => Cookies.get(TOKEN_KEY);

export const setToken = (token) => {
    Cookies.set(TOKEN_KEY, token, {expires: 7, path: '/'});
};

export const removeToken = () => {
    Cookies.remove(TOKEN_KEY, {path: '/'});
};

export const getUserData = () => {
    const userData = Cookies.get(USER_KEY);
    return userData ? JSON.parse(userData) : null;
};

export const setUserData = (user) => {
    Cookies.set(USER_KEY, JSON.stringify(user), {expires: 7, path: '/'});
};

export const removeUserData = () => {
    Cookies.remove(USER_KEY, {path: '/'});
};