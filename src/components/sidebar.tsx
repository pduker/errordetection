import React from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';

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
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
      }}
      // -----------------------
    >
      <Menu
          style={{
            width: '100%',
            maxWidth: '250px',
            overflow: 'hidden',
            transition: 'width 0.3s ease',
          }}
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
        <MenuItem> Tags </MenuItem>
        <MenuItem> Pitch </MenuItem>
        <MenuItem> Intonation </MenuItem>
        <MenuItem> Rhythm </MenuItem>
        <SubMenu label="Advanced">
          <MenuItem> Text </MenuItem>
          <MenuItem> Text </MenuItem>
          <MenuItem> Text </MenuItem>
        </SubMenu>
      </Menu>
    </Sidebar>
  );
};