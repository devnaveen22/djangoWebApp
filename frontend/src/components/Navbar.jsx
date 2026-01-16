import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import logo from '../assets/logo.jpeg';
import { routeWithIcons } from '../utils/routeWithIcons';
import { Link, useNavigate } from 'react-router-dom';
import { ListItemText } from '@mui/material';
import AxiosInstance from './AxiosInstance';

export default function Navbar(props) {
  const { content } = props
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleLogout = (navObj) => {
    if (navObj.narbarName === 'Logout') {
      AxiosInstance.post('logoutall/', {}).then((response) => {
        if (response.status === 204) {
          localStorage.clear();
          setAnchorElNav(null);
          navigate('/');
        }
      }).catch(err => console.log(err))
    }
    else {
      setAnchorElNav(null);
    }
  }

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: 'white'}}>
        <Container maxWidth="xl" sx={{ padding: '0 !important', color: '#361C15'}}>
          <Toolbar disableGutters sx={{boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px'}}>
            <Box
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Company Logo"
                sx={{
                  height: 68.5,
                  width: 'auto',
                  mr: 1.5,
                }}
              />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.15rem',
                }}
              >
                SRM LOTTO
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }} />
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none', justifyContent: 'flex-end' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleLogout}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {routeWithIcons.map((page, index) => (
                  <MenuItem key={index} onClick={() => handleLogout(page)}>
                    <Typography sx={{ textAlign: 'center', color: '#361C15' }}>{page.narbarName}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Box
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                textDecoration: 'none',
                justifyContent: 'space-between',
                color: 'inherit'
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Company Logo"
                sx={{
                  height: 68.5,
                  width: 'auto',
                  mr: 1.5,
                }}
              />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.2rem',
                }}
              >
                SRM LOTTO
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }} />
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', justifyContent: 'flex-end' } }}>
              {routeWithIcons.map((page, index) => (
                <Button
                  component={Link}
                  key={index}
                  to={page?.path}
                  onClick={() => handleLogout(page)}
                  sx={{ my: 2, color: '#361C15', display: 'block', fontWeight: 'bold' }}
                >
                  {page.narbarName}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Toolbar sx={{ height: 68.5 }} />
      
      <Box
        sx={{
          overflow: 'auto',
          height: 'calc(100vh - 68.5px)',
        }}
      >
        <Container maxWidth="xl" sx={{ padding: '0 !important'}}>
          {content}
        </Container>
      </Box>
    </>
  );
}