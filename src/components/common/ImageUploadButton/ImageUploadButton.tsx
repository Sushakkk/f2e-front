import cn from 'classnames';
import * as React from 'react';

import Button from 'components/common/Button/Button';

import s from './ImageUploadButton.module.scss';

type Props = {
  label: string;
  accept?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  onSelect: (files: FileList) => void;
};

const ImageUploadButton: React.FC<Props> = ({
  label,
  accept = 'image/*',
  className,
  disabled = false,
  multiple = false,
  onSelect,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        className={s.fileInput}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files) {
            onSelect(e.target.files);
            e.target.value = '';
          }
        }}
      />
      <Button
        mode="purpleDashed"
        type="button"
        className={cn(s.button, className)}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
    </>
  );
};

export default ImageUploadButton;
