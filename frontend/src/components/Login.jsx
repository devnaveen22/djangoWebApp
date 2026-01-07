import { Box } from '@mui/material'
import '../App.css'
import MyTextField from './Form/MyTextField'
import MyPassField from './Form/MyPassField'
import { MyButton } from './Form/MyButton'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { loginSubmission } from '../utils/loginSubmission'
import { yupResolver } from '@hookform/resolvers/yup'
import { loginSchema } from '../utils/schemaValidation'
import { useState } from 'react'
import { AlertComp } from './Alert'
import { useAuth } from '../context/AuthContext'
export const Login = () => {
    const [error, setError] = useState('')
    const {fetchMe} =  useAuth();
    const navigate = useNavigate()
    const { control, handleSubmit } = useForm({ resolver: yupResolver(loginSchema) });

    const submission = (data) => loginSubmission(data).then((response) => {
        localStorage.setItem('Token', response.data.token)
        fetchMe()
        navigate('/')
    }).catch((err) => {
        const errorMessage =
            err?.response?.data?.error || 'Something went wrong';
        setError(errorMessage)
    });

    return (
        <>
            <AlertComp
                open={Boolean(error)}
                type="error"
                message={error}
                onClose={() => setError("")}
            />
            <form onSubmit={handleSubmit(submission)}>
                <Box className={"myFormBackGround"}>
                    <Box className={"whiteBox"}>
                        <Box className="itemBox">
                            <Box className="title">
                                Sign In to Continue
                            </Box>
                        </Box>
                        <Box className="itemBox">
                            <MyTextField label={"Phone Number"} name="phone_number" control={control} />
                        </Box>
                        <Box className="itemBox">
                            <MyPassField label={"Password"} name="password" control={control} />
                        </Box>
                        <Box className="itemBox">
                            <MyButton label={"Sign in"} type="submit" />
                        </Box>
                        <Box className="itemBox">
                            <Link to='/register'>
                                No account yet? Please register!
                            </Link>
                        </Box>
                    </Box>
                </Box>
            </form>
        </>
    )
}