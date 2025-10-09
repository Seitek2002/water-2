import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Modal, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { FormulaItem } from 'types/entities';

const { Text } = Typography;

interface FormulaCardProps {
  formula: FormulaItem;
  onEdit?: (formula: FormulaItem) => void;
  onDelete?: (id: number) => void;
  onCardClick?: (id: number) => void;
  isDeleting?: boolean;
}

export const FormulaCard: FC<FormulaCardProps> = ({ formula, onEdit, onDelete, onCardClick, isDeleting = false }) => {
  const { t } = useTranslation();
  const handleEdit = (): void => {
    if (onEdit) {
      onEdit(formula);
    }
  };

  const handleCardClick = (): void => {
    if (onCardClick) {
      onCardClick(formula.id);
    }
  };

  const handleDelete = (): void => {
    Modal.confirm({
      title: t('formulas.deleteTitle'),
      icon: <ExclamationCircleOutlined />,
      content: t('formulas.deleteConfirm', { title: formula.title }),
      okText: t('common.delete'),
      cancelText: t('common.cancel'),
      okType: 'danger',
      onOk: async () => {
        if (onDelete) {
          await onDelete(formula.id);
        }
      },
      centered: true,
      okButtonProps: {
        style: { borderRadius: 8 }
      },
      cancelButtonProps: {
        style: { borderRadius: 8 }
      }
    });
  };

  const formatKoefficent = (value: number): string => {
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: 16,
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
      }}
      styles={{
        body: { padding: 24 }
      }}
      hoverable
      onClick={handleCardClick}
    >
      {/* Заголовок с действиями */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16
        }}
      >
        <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between', width: '100%' }}>
          <Button
            type='text'
            icon={<EditOutlined />}
            size='small'
            style={{
              color: '#007aff',
              border: 'none',
              backgroundColor: 'transparent',
              width: 32,
              height: 32,
              borderRadius: 8
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
          />

          <Button
            type='text'
            icon={<DeleteOutlined />}
            size='small'
            loading={isDeleting}
            style={{
              color: '#ff4d4f',
              border: 'none',
              backgroundColor: 'transparent',
              width: 32,
              height: 32,
              borderRadius: 8
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          />
        </div>
      </div>
      <div>
        <Typography.Title
          level={5}
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#1d1d1f',
            lineHeight: 1.4
          }}
        >
          {formula.title}
        </Typography.Title>
      </div>
      {/* Коэффициент */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#8e8e93', fontWeight: 500 }}>{t('formulas.coefficient')}</Text>
        </div>
        <div style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#1d1d1f',
              display: 'block',
              lineHeight: 1
            }}
          >
            {formatKoefficent(formula.koefficent)}
          </Text>
        </div>
      </div>
    </Card>
  );
};
