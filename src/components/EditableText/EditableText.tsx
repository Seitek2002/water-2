import { FC, ReactNode, useState } from 'react';
import { Input } from 'antd';

interface EditableTextProps {
  initialValue: string;
  renderDisplay?: (value: string) => ReactNode;
  onChange?: (newValue: string) => void;
}

export const EditableText: FC<EditableTextProps> = ({ initialValue, renderDisplay, onChange }) => {
  const [value, setValue] = useState(initialValue);
  const [isEdit, setIsEdit] = useState(false);

  const handleBlurOrEnter = () => {
    setIsEdit(false);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div style={{ display: 'inline-block' }}>
      {isEdit ? (
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlurOrEnter}
          onPressEnter={handleBlurOrEnter}
        />
      ) : (
        <div onClick={() => setIsEdit(true)}>{renderDisplay ? renderDisplay(value) : <span>{value}</span>}</div>
      )}
    </div>
  );
};
