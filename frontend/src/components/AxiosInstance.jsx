import axios from 'axios'

const baseUrl = import.meta.env.VITE_API_URL

const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 5000, 
    headers:{
        "Content-Type":"application/json",
         accept: "application/json"
    }
})

AxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('Token')
        if(token){
            config.headers.Authorization = `Token ${token}`
        }
        else{
            config.headers.Authorization = ``
        }
        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
            if (config.url && !config.url.endsWith('/')) {
                config.url += '/';
            }
        }        
        return config;
    }
)

AxiosInstance.interceptors.response.use(
    (response) => {
        return response
    }, 
    (error) => {
        if(error.response && error.response.status === 401){
            localStorage.removeItem('Token')
        }
        return Promise.reject(error);

    }
)
export default AxiosInstance;