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
  difficulty: string;
  onSelectDifficulty: (value: string) => void;
  voices: number;
  onSelectVoices: (value: number) => void;
  meter: string;
  onSelectMeter: (value: string) => void;
  texturalFactor: string;
  onSelectTexturalFactor: (value: string) => void;
}

// 2. Update the component to accept and use the props
export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed,
  selectedTags,
  onToggleTag,
  transposing,
  onToggleTransposing,
  difficulty,
  onSelectDifficulty,
  voices,
  onSelectVoices,
  meter,
  onSelectMeter,
  texturalFactor,
  onSelectTexturalFactor,
}) => {
  const tagItems = useMemo(
    () => ['Pitch', 'Intonation', 'Rhythm'],
    []
  );
  const difficultyItems = useMemo(
    () => ['All', '1', '2', '3', '4', '5'],
    []
  );
  const voiceItems = useMemo(
    () => [
      { value: 0, label: 'Any' },
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5' },
    ],
    []
  );
  const meterItems = useMemo(
    () => ['Anything', 'Simple', 'Compound'],
    []
  );
  const texturalItems = useMemo(
    () => [
      { value: 'None', label: 'None' },
      { value: 'Drone', label: 'Drone' },
      { value: 'Ensemble Parts', label: 'Ensemble Parts' },
      { value: 'Both', label: 'Drone & Ensemble Parts' },
    ],
    []
  );

  const sidebarRootStyles = useMemo(() => {
    const baseStyles = {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      height: '100vh',
      width: '280px',
      zIndex: 10,
      overflowX: 'hidden' as const,
      overflowY: 'auto' as const,
      borderRight: 'none',
      boxShadow: 'none',
    };

    return isCollapsed
    ? { ...baseStyles, transform: 'translateX(-100%)' /*SR:Edited so tags would slide back in*/ } 
    : { ...baseStyles, transform: 'translateX(0)' /*SR: Same edit as above*/};
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
            maxWidth: '280px',
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: 'width 0.3s ease',
          }}
          menuItemStyles={{
            button: {
              display: 'flex',
              alignItems: 'center',
              paddingRight: '12px',
              // The active class will be added by NavLink
              [`&.active`]: {
                backgroundColor: '#13395e',
                color: '#b6c8d9',
              },
            },
            suffix: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginLeft: 'auto',
              minWidth: '20px',
            },
            label: {
              flexGrow: 1,
            },
            SubMenuExpandIcon: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginLeft: 'auto',
              minWidth: '20px',
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
          <SubMenu label="Difficulty">
            {difficultyItems.map((item) => (
              <MenuItem
                key={item}
                active={difficulty === item}
                onClick={() => onSelectDifficulty(item)}
                suffix={difficulty === item ? <FaCheck size={12} /> : null}
              >
                {item}
              </MenuItem>
            ))}
          </SubMenu>
          <SubMenu label="Voices">
            {voiceItems.map(({ value, label }) => (
              <MenuItem
                key={value}
                active={voices === value}
                onClick={() => onSelectVoices(value)}
                suffix={voices === value ? <FaCheck size={12} /> : null}
              >
                {label}
              </MenuItem>
            ))}
          </SubMenu>
          <SubMenu label="Meter">
            {meterItems.map((item) => (
              <MenuItem
                key={item}
                active={meter === item}
                onClick={() => onSelectMeter(item)}
                suffix={meter === item ? <FaCheck size={12} /> : null}
              >
                {item}
              </MenuItem>
            ))}
          </SubMenu>
          <SubMenu label="Textural Factors">
            {texturalItems.map(({ value, label }) => (
              <MenuItem
                key={value}
                active={texturalFactor === value}
                onClick={() => onSelectTexturalFactor(value)}
                suffix={texturalFactor === value ? <FaCheck size={12} /> : null}
              >
                {label}
              </MenuItem>
            ))}
          </SubMenu>
        </SubMenu>
        <button>Reset Button Here</button>
      </Menu>
    </Sidebar>
  );
};
