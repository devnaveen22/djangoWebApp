import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import { About } from '../components/About';
import { Profile } from '../components/Profile';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminDashboard from '../components/AdminDashboard';
import Home1 from '../components/Home1';

export const routeWithIcons =[
    {narbarName:'Home',navIcon:HomeIcon,path:'/',component:Home1},
    {narbarName:'About Us',navIcon:InfoIcon,path:'/about',component:About},
    {narbarName:'Profile',navIcon:AccountCircleIcon,path:'/profile',component:Profile},
    {narbarName:'Logout',navIcon:LogoutIcon}
]