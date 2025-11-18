import React, { useMemo } from 'react';

interface AppSidebarProps {
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
  onResetSort: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="filters-section">
    <h4 className="filters-section__title">{title}</h4>
    {children}
  </section>
);

const OptionGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="filters-option-group">{children}</div>
);

const OptionButton: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
}> = ({ active, label, onClick }) => (
  <button type="button" className={`filter-option${active ? ' filter-option--active' : ''}`} onClick={onClick}>
    {label}
  </button>
);

const ChipButton: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
}> = ({ active, label, onClick }) => (
  <button type="button" className={`filter-chip${active ? ' filter-chip--active' : ''}`} onClick={onClick}>
    {label}
  </button>
);

const ToggleRow: React.FC<{
  label: string;
  checked: boolean;
  onChange: () => void;
}> = ({ label, checked, onChange }) => (
  <label className="filters-toggle">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span>{label}</span>
  </label>
);

export const AppSidebar: React.FC<AppSidebarProps> = ({
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
  onResetSort,
}) => {
  const tagItems = useMemo(() => ['Pitch', 'Intonation', 'Rhythm'], []);
  const difficultyItems = useMemo(() => ['All', '1', '2', '3', '4', '5'], []);
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
  const meterItems = useMemo(() => ['Anything', 'Simple', 'Compound'], []);
  const texturalItems = useMemo(
    () => [
      { value: 'None', label: 'None' },
      { value: 'Drone', label: 'Drone' },
      { value: 'Ensemble Parts', label: 'Ensemble Parts' },
      { value: 'Both', label: 'Drone & Ensemble Parts' },
    ],
    []
  );

  return (
    <div className="filters-menu">
      <Section title="Focus Areas">
        <OptionGroup>
          {tagItems.map((tag) => (
            <ChipButton key={tag} active={selectedTags.includes(tag)} label={tag} onClick={() => onToggleTag(tag)} />
          ))}
        </OptionGroup>
      </Section>

      <Section title="Additional Options">
        <ToggleRow label="Transposing Instruments" checked={transposing} onChange={onToggleTransposing} />
      </Section>

      <Section title="Advanced Filters">
        <div className="filters-subsection">
          <span className="filters-subsection__label">Difficulty</span>
          <OptionGroup>
            {difficultyItems.map((item) => (
              <OptionButton
                key={item}
                active={difficulty === item}
                label={item}
                onClick={() => onSelectDifficulty(item)}
              />
            ))}
          </OptionGroup>
        </div>
        <div className="filters-subsection">
          <span className="filters-subsection__label">Voices</span>
          <OptionGroup>
            {voiceItems.map(({ value, label }) => (
              <OptionButton
                key={value}
                active={voices === value}
                label={label}
                onClick={() => onSelectVoices(value)}
              />
            ))}
          </OptionGroup>
        </div>
        <div className="filters-subsection">
          <span className="filters-subsection__label">Meter</span>
          <OptionGroup>
            {meterItems.map((item) => (
              <OptionButton key={item} active={meter === item} label={item} onClick={() => onSelectMeter(item)} />
            ))}
          </OptionGroup>
        </div>
        <div className="filters-subsection">
          <span className="filters-subsection__label">Textural Factors</span>
          <OptionGroup>
            {texturalItems.map(({ value, label }) => (
              <OptionButton
                key={value}
                active={texturalFactor === value}
                label={label}
                onClick={() => onSelectTexturalFactor(value)}
              />
            ))}
          </OptionGroup>
        </div>
      </Section>

      <button type="button" className="filters-reset-btn" onClick={onResetSort}>
        Reset Sort
      </button>
    </div>
  );
};
