import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `https://react-course-b798e-default-rtdb.firebaseio.com/`,
});

axiosInstance.interceptors.request.use((config) => {
    const token = state.auth.auth.idToken;
    config.params = config.params || {};
    config.params['auth'] = token;
    return config;
});

export default axiosInstance;
