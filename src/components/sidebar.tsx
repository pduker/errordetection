import React from 'react';
// Make sure SubMenu is imported
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { NavLink } from 'react-router-dom';

// 1. Define the props interface
interface AppSidebarProps {
  isCollapsed: boolean;
}

// 2. Update the component to accept and use the props
export const AppSidebar: React.FC<AppSidebarProps> = ({ isCollapsed }) => {
  return (
    <Sidebar 
      collapsed={isCollapsed}
      // --- ADD THESE STYLES ---
      rootStyles={{
        height: '100vh',    // Set the height to 100% of the viewport
        position: 'sticky', // Make it stick to the top
        top: 0,             // Anchor it to the top
        width: '250px',
      }}
      // -----------------------
    >
      <Menu
        menuItemStyles={{
          button: {
            // The active class will be added by NavLink
            [`&.active`]: {
              backgroundColor: '#13395e',
              color: '#b6c8d9',
            },
          },
        }}
      >
        {/* <MenuItem component={<NavLink to="/documentation" />}> Documentation</MenuItem>
        <MenuItem component={<NavLink to="/calendar" />}> Calendar</MenuItem>
        <MenuItem component={<NavLink to="/e-commerce" />}> E-commerce</MenuItem> */}
        
        {/* <SubMenu label="Charts">
          <MenuItem component={<NavLink to="/charts/pie" />}> Pie charts </MenuItem>
          <MenuItem component={<NavLink to="/charts/line" />}> Line charts </MenuItem>
          <MenuItem component={<NavLink to="/charts/bar" />}> Bar charts </MenuItem>
        </SubMenu> */}

        {/* --- I've added extra items below to demonstrate the scrolling --- */}
        <MenuItem> Tags </MenuItem>
        <MenuItem> Pitch </MenuItem>
        <MenuItem> Intonation </MenuItem>
        <MenuItem> Rhythm </MenuItem>
        <SubMenu label="Advanced">
          <MenuItem> Text </MenuItem>
          <MenuItem> Text </MenuItem>
          <MenuItem> Text </MenuItem>
        </SubMenu>
        {/* --------------------------------------------------------------- */}
      </Menu>
    </Sidebar>
  );
};