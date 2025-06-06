import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Collapse,
  Typography,
} from '@mui/material';
import {
  Home as HomeIcon,
  Chat as ChatIcon,
  Quiz as QuizIcon,
  Timeline as TimelineIcon,
  MenuBook as MenuBookIcon,
  ExpandLess,
  ExpandMore,
  StarBorder,
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openNcert, setOpenNcert] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNcertClick = () => {
    setOpenNcert(!openNcert);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MenuBookIcon sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap component="div">
            WhiZardLM
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {/* Home */}
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/')}
            onClick={() => navigate('/')}
          >
            <ListItemIcon>
              <HomeIcon color={isActive('/') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Home" 
              primaryTypographyProps={{
                color: isActive('/') ? 'primary' : 'inherit',
                fontWeight: isActive('/') ? 'medium' : 'regular'
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Chat */}
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/chat')}
            onClick={() => navigate('/chat')}
          >
            <ListItemIcon>
              <ChatIcon color={isActive('/chat') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Chat" 
              primaryTypographyProps={{
                color: isActive('/chat') ? 'primary' : 'inherit',
                fontWeight: isActive('/chat') ? 'medium' : 'regular'
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* NCERT Books */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleNcertClick}>
            <ListItemIcon>
              <MenuBookIcon />
            </ListItemIcon>
            <ListItemText primary="NCERT Books" />
            {openNcert ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openNcert} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon>
                <StarBorder />
              </ListItemIcon>
              <ListItemText primary="Class 6" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon>
                <StarBorder />
              </ListItemIcon>
              <ListItemText primary="Class 7" />
            </ListItemButton>
            {/* Add more classes as needed */}
          </List>
        </Collapse>

        {/* Interactive Tools */}
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/quizzes')}
            onClick={() => navigate('/quizzes')}
          >
            <ListItemIcon>
              <QuizIcon color={isActive('/quizzes') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Quizzes" 
              primaryTypographyProps={{
                color: isActive('/quizzes') ? 'primary' : 'inherit',
                fontWeight: isActive('/quizzes') ? 'medium' : 'regular'
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected={isActive('/timeline')}
            onClick={() => navigate('/timeline')}
          >
            <ListItemIcon>
              <TimelineIcon color={isActive('/timeline') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Timeline" 
              primaryTypographyProps={{
                color: isActive('/timeline') ? 'primary' : 'inherit',
                fontWeight: isActive('/timeline') ? 'medium' : 'regular'
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            backgroundColor: theme.palette.background.paper,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
