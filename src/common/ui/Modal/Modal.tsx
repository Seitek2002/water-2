import { FC, ReactNode } from 'react';
import { Modal as AntModal, ModalProps } from 'antd';

interface IModalProps extends ModalProps {
  children: ReactNode;
}

export const Modal: FC<IModalProps> = ({ children, ...rest }) => {
  return (
    <AntModal closable destroyOnHidden centered footer={false} {...rest}>
      {children}
    </AntModal>
  );
};
