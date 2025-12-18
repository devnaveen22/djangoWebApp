import AxiosInstance from "../components/AxiosInstance"

export const loginSubmission = (data)=>{
    return AxiosInstance.post(`login/`,{
        phone_number:data.phone_number,
        password:data.password,
    })
}