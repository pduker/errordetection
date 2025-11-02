import React, { useMemo } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { FaCheck } from 'react-icons/fa';

// 1. Define the props interface
interface AppSidebarProps {
  isCollapsed: boolean;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  transposing: boolean;
  onToggleTransposing: () => void;
}

// 2. Update the component to accept and use the props
export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed,
  selectedTags,
  onToggleTag,
  transposing,
  onToggleTransposing,
}) => {
  const tagItems = useMemo(
    () => ['Pitch', 'Intonation', 'Rhythm'],
    []
  );

  const sidebarRootStyles = useMemo(() => {
    const baseStyles = {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      height: '100vh',
      zIndex: 10,
      overflow: 'hidden',
      borderRight: 'none',
      boxShadow: 'none',
    };

    return isCollapsed
      ? { ...baseStyles, pointerEvents: 'none' as const }
      : { ...baseStyles, pointerEvents: 'auto' as const };
  }, [isCollapsed]);

  return (
    <Sidebar
      collapsed={isCollapsed}
      collapsedWidth="0px"
      className="app-sidebar"
      rootStyles={sidebarRootStyles}
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
            onClick={() => onToggleTag(tag)}
            suffix={selectedTags.includes(tag) ? <FaCheck size={12} /> : null}
          >
            {tag}
          </MenuItem>
        ))}
        <MenuItem
          active={transposing}
          onClick={onToggleTransposing}
          suffix={transposing ? <FaCheck size={12} /> : null}
        >
          Transposing Instruments
        </MenuItem>
        <SubMenu label="Advanced">
          <MenuItem> Text </MenuItem>
          <MenuItem> Text </MenuItem>
          <MenuItem> Text </MenuItem>
        </SubMenu>
      </Menu>
    </Sidebar>
  );
};
