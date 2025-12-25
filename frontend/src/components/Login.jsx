import { Box } from '@mui/material'
import '../App.css'
import MyTextField from './Form/MyTextField'
import MyPassField from './Form/MyPassField'
import { MyButton } from './Form/MyButton'
import {Link} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {useNavigate} from 'react-router-dom'
import { loginSubmission } from '../utils/loginSubmission'
export const Login = () => {
    const navigate = useNavigate()
    const {control,handleSubmit} = useForm();
    const submission =(data)=> loginSubmission(data).then((response)=>{
      localStorage.setItem('Token',response.data.token)
       navigate('/')
    })
       .catch(err => console.error(err));
    return (
        <form onSubmit={handleSubmit(submission)}>
        <Box className={"myFormBackGround"}>
            <Box className={"whiteBox"}>
                <Box className="itemBox">
                    <Box className="title">
                        Sign In to Continue
                    </Box>
                </Box>
                <Box className="itemBox">
                    <MyTextField label={"Phone Number"} name="phone_number" control={control}/>
                </Box>
                <Box className="itemBox">
                    <MyPassField label={"Password"} name="password" control={control}/>
                </Box>
                <Box className="itemBox">
                       <MyButton label={"Sign in"} type="submit"/>
                </Box>
                <Box className="itemBox">
                    <Link to='/register'>
                    No account yet? Please register!
                    </Link>
                </Box>
            </Box>
        </Box>
        </form>
    )
}