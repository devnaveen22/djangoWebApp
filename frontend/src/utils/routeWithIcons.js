import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import Booking from '../components/Booking';
import Home from '../components/Home';

export const routeWithIcons =[
    {narbarName:'Home',navIcon:HomeIcon,path:'/',component:Home},
    {narbarName:'Booking',navIcon:HomeIcon,path:'/booking',component:Booking},
    {narbarName:'Logout',navIcon:LogoutIcon}
]