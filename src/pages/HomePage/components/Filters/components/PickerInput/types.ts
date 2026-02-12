export type PickerType = 'date' | 'time';

export type PickerInputProps = {
  type: PickerType;
  value: string;
  onChange: (v: string) => void;
};

export type InputWithShowPicker = HTMLInputElement & { showPicker?: () => void };
