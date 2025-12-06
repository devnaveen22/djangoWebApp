import AxiosInstance from "../components/AxiosInstance"

export const regSubmission = (data)=>{
    return AxiosInstance.post(`register/`,{
        username:data.username,
        password:data.password,
        email:data.email,
        phone_number:data.phone_number
    })
}