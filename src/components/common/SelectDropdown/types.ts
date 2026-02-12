export type SelectOption = { value: string; label: string };

type BaseProps = {
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
};

type SingleProps = BaseProps & {
  mode?: 'single';
  value: string;
  onChange: (v: string) => void;
  allowCustomValue?: boolean;
};

type MultiProps = BaseProps & {
  mode: 'multi';
  value: string[];
  onChange: (v: string[]) => void;
  clearLabel?: string;
};

export type SelectDropdownProps = SingleProps | MultiProps;
