import { Box } from '@mui/material'
import '../App.css'
import MyTextField from './Form/MyTextField'
import MyPassField from './Form/MyPassField'
import { MyButton } from './Form/MyButton'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { regSubmission } from '../utils/regSubmission'
import { yupResolver } from "@hookform/resolvers/yup"
import { registerSchema } from '../utils/schemaValidation'

export const Register = () => {
    const navigate = useNavigate()
    const { control, handleSubmit } = useForm({ resolver: yupResolver(registerSchema) });
    const submission = (data) => regSubmission(data).then(() => {
        navigate('/')
    }).catch(err => console.error(err));

    return (
        <form onSubmit={handleSubmit(submission)}>
            <Box className={"myFormBackGround"}>
                <Box className={"whiteBox"}>
                    <Box className="itemBox">
                        <Box className="title">
                            User Registration
                        </Box>
                    </Box>
                    <Box className="itemBox">
                        <MyTextField label={"UserName"} name="username" control={control} />
                    </Box>
                    <Box className="itemBox">
                        <MyTextField label={"Phone Number"} name="phone_number" control={control} />
                    </Box>
                    <Box className="itemBox">
                        <MyPassField label={"Password"} name="password" control={control} />
                    </Box>
                    <Box className="itemBox">
                        <MyPassField label={"Confirm Password"} name="password2" control={control} />
                    </Box>
                    <Box className="itemBox">
                        <MyButton label={"Register"} type="submit" />
                    </Box>
                    <Box className="itemBox">
                        <Link to='/'>
                            Already registered? Please login!
                        </Link>
                    </Box>
                </Box>
            </Box>
        </form>
    )
}