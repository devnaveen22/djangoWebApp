import { Box } from '@mui/material'
import '../App.css'
import MyTextField from './Form/MyTextField'
import MyPassField from './Form/MyPassField'
import { MyButton } from './Form/MyButton'
import {Link} from 'react-router-dom'
export const Register = () => {
    return (
        <Box className={"myFormBackGround"}>
            <Box className={"whiteBox"}>
                <Box className="itemBox">
                    <Box className="title">
                        User Registration
                    </Box>
                </Box>
                <Box className="itemBox">
                    <MyTextField label={"UserName"}/>
                </Box>
                <Box className="itemBox">
                    <MyTextField label={"Email"}/>
                </Box>
                <Box className="itemBox">
                    <MyTextField label={"Phone Number"}/>
                </Box>
                <Box className="itemBox">
                    <MyPassField label={"Password"}/>
                </Box>
                <Box className="itemBox">
                    <MyPassField label={"Confirm Password"}/>
                </Box>
                <Box className="itemBox">
                       <MyButton label={"Register"}/>
                </Box>
                <Box className="itemBox">
                    <Link to='/'>
                      Already registered? Please login!
                    </Link>
                </Box>
            </Box>
        </Box>
    )
}