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
    // 3. Pass the 'isCollapsed' prop to the Sidebar component
    <Sidebar collapsed={isCollapsed}>
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
        <MenuItem component={<NavLink to="/documentation" />}> Documentation</MenuItem>
        <MenuItem component={<NavLink to="/calendar" />}> Calendar</MenuItem>
        <MenuItem component={<NavLink to="/e-commerce" />}> E-commerce</MenuItem>
        
        {/* Your SubMenu from before */}
        <SubMenu label="Charts">
          <MenuItem component={<NavLink to="/charts/pie" />}> Pie charts </MenuItem>
          <MenuItem component={<NavLink to="/charts/line" />}> Line charts </MenuItem>
          <MenuItem component={<NavLink to="/charts/bar" />}> Bar charts </MenuItem>
        </SubMenu>
      </Menu>
    </Sidebar>
  );
};