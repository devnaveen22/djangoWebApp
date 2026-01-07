import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { routeWithIcons } from '../utils/routeWithIcons';
import '../App.css';
import AxiosInstance from './AxiosInstance';

const drawerWidth = 240;

export default function Navbar(props) {
  const location = useLocation();
  const pathName = location.pathname
  const { content } = props
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        SRM LOTTO
      </Typography>
      <Divider />
      <List>
        {routeWithIcons.map((navObj, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              component={Link}
              to={navObj.path}
              selected={navObj.path === pathName}
            >
              <ListItemIcon
                sx={[
                  {
                    minWidth: 0
                  },
                  open
                    ? {
                      mr: 3,
                    }
                    : {
                      mr: 'auto',
                    },
                ]}
              >
                {<navObj.navIcon />}
              </ListItemIcon>
              <ListItemText primary={navObj.narbarName} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  const handleLogout = (navObj) => {
    if (navObj.narbarName === 'Logout') {
      AxiosInstance.post('logoutall/', {}).then((response) => {
        if (response.status === 204) {
          localStorage.clear();
          navigate('/');
        }
      }).catch(err => console.log(err))
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        maxHeight: 'calc(100vh-100px)'
      }}
    >
      <CssBaseline />
      <AppBar component="nav" className='liner-bg'>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            SRM LOTTO
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {routeWithIcons.map((navObj, index) => (
              <Button sx={{ color: '#fff' }}
                key={index}
                component={Link}
                to={navObj?.path}
                onClick={() => handleLogout(navObj)}
              >
                <ListItemText primary={navObj.narbarName} />
              </Button >
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <Box component="main" sx={{ p: 3,width:'100%' }}>
        <Toolbar />
        {content}
      </Box>
    </Box>
  );
}
