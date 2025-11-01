import React, { useState, useMemo } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { FaCheck } from 'react-icons/fa';

// 1. Define the props interface
interface AppSidebarProps {
  isCollapsed: boolean;
}

// 2. Update the component to accept and use the props
export const AppSidebar: React.FC<AppSidebarProps> = ({ isCollapsed }) => {
  const tagItems = useMemo(
    () => ['Pitch', 'Intonation', 'Rhythm', 'Transposing Instruments'],
    []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  return (
    <Sidebar
      collapsed={isCollapsed}
      // width="260px"
      collapsedWidth="0"
      className="app-sidebar"
      rootStyles={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 10,
        overflow: 'hidden',
        borderRight: 'none',
        boxShadow: 'none',
      }}
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
        {tagItems.map((tag) => (
          <MenuItem
            key={tag}
            active={selectedTags.includes(tag)}
            onClick={() => toggleTag(tag)}
            suffix={selectedTags.includes(tag) ? <FaCheck size={12} /> : null}
          >
            {tag}
          </MenuItem>
        ))}
        <SubMenu label="Advanced">
          <MenuItem> Text </MenuItem>
          <MenuItem> Text </MenuItem>
          <MenuItem> Text </MenuItem>
        </SubMenu>
      </Menu>
    </Sidebar>
  );
};
