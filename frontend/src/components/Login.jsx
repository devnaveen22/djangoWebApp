import { Box } from '@mui/material'
import '../App.css'
import MyTextField from './Form/MyTextField'
import MyPassField from './Form/MyPassField'
import { MyButton } from './Form/MyButton'
import {Link} from 'react-router-dom'
export const Login = () => {
    return (
        <Box className={"myFormBackGround"}>
            <Box className={"whiteBox"}>
                <Box className="itemBox">
                    <Box className="title">
                        Sign In to Continue
                    </Box>
                </Box>
                <Box className="itemBox">
                    <MyTextField label={"UserName"}/>
                </Box>
                <Box className="itemBox">
                    <MyPassField label={"Password"}/>
                </Box>
                <Box className="itemBox">
                       <MyButton label={"Sign in"}/>
                </Box>
                <Box className="itemBox">
                    <Link to='/register'>
                    No account yet? Please register!
                    </Link>
                </Box>
            </Box>
        </Box>
    )
}