import { createContext, useContext, useEffect, useState } from "react";
import AxiosInstance from "../components/AxiosInstance";

const AuthContext = createContext(null);

export const AuthContextProvider = ({children})=>{
    const [user,setUser] = useState(null);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        const token = localStorage.getItem('Token')
        if (!token){
            setLoading(false)
            return
        }
        fetchMe()

    },[])

    const fetchMe = async()=>{
        try{
            const response = await AxiosInstance.get('/me')
            setUser(response.data)
        }
        catch(err){
            console.error(err);
            logout();
        }
        finally{
            setLoading(false);
        }
    }
    return(
        <AuthContext.Provider value={{
            user,
            fetchMe
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = ()=>{
    return useContext(AuthContext)
}