import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import { About } from '../components/About';
import { Profile } from '../components/Profile';
import Home from '../components/Home';
import LogoutIcon from '@mui/icons-material/Logout';

export const routeWithIcons =[
    {narbarName:'Home',navIcon:HomeIcon,path:'/',component:Home},
    {narbarName:'About Us',navIcon:InfoIcon,path:'/about',component:About},
    {narbarName:'Profile',navIcon:AccountCircleIcon,path:'/profile',component:Profile},
    {narbarName:'Logout',navIcon:LogoutIcon}
]