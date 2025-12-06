import HomeIcon from '@mui/icons-material/Home';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import { Home } from '../components/Home';
import { About } from '../components/About';
import { Profile } from '../components/Profile';
import { Register } from '../components/Register';

export const routeWithIcons =[
    {narbarName:'Home',navIcon:HomeIcon,path:'/home',component:Home},
    {narbarName:'About Us',navIcon:InfoIcon,path:'/about',component:About},
    {narbarName:'Profile',navIcon:AccountCircleIcon,path:'/profile',component:Profile}
]