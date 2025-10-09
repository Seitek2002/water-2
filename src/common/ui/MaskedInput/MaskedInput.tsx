import React, { forwardRef } from 'react';
import './styles.scss';

import clsx from 'clsx';
import { IMaskInput } from 'react-imask';

export interface AntdMaskedInputProps extends Omit<React.ComponentProps<typeof IMaskInput>, 'inputRef' | 'onAccept' | 'onChange' | 'size'> {
  size?: 'large' | 'middle' | 'small';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * AntD-friendly masked input built on top of react-imask.
 * - Renders with AntD input classes for consistent styling
 * - Emits a synthetic React.ChangeEvent to work seamlessly with Form.Item
 *
 * Usage examples:
 *  - Phone (KG): mask="+996 000 000 000"
 *  - ENI: mask="000-000-000-000"
 *  - Cadastral: mask="00-000-000-000"
 */
export const MaskedInput = forwardRef<HTMLInputElement, AntdMaskedInputProps>(({ size = 'middle', className, onChange, ...rest }, ref) => {
  return (
    <IMaskInput
      {...(rest as unknown as React.ComponentProps<typeof IMaskInput>)}
      // Casting: IMaskInput expects a function ref; forwarding DOM ref works with this cast
      inputRef={ref as unknown as (el: HTMLInputElement | null) => void}
      className={clsx('ant-input masked-ant-input', size === 'large' && 'ant-input-lg', size === 'small' && 'ant-input-sm', className)}
      // onAccept fires whenever the masked value changes (more reliable than native onChange here)
      onAccept={(val: string) => {
        if (onChange) {
          onChange({ target: { value: val } } as unknown as React.ChangeEvent<HTMLInputElement>);
        }
      }}
    />
  );
});

MaskedInput.displayName = 'MaskedInput';

export default MaskedInput;
