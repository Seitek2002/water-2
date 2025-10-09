import { FC } from 'react';
import { Card, Tag, Typography } from 'antd';
import { EditableText } from 'components/EditableText';
import { ObjectItem } from 'types/entities/objects';

import { t } from 'i18next';

const { Text, Link } = Typography;

interface ObjectCardProps {
  object: ObjectItem;
  onTitleChange?: (id: number, newTitle: string) => void;
  onCardClick?: (id: number) => void;
}

export const ObjectCard: FC<ObjectCardProps> = ({ object, onTitleChange, onCardClick }) => {
  const handleTitleChange = (newTitle: string): void => {
    if (onTitleChange) {
      onTitleChange(object.id, newTitle);
    }
  };

  const handleCardClick = (): void => {
    if (onCardClick) {
      onCardClick(object.id);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'активен':
        return 'success';
      case 'inactive':
      case 'неактивен':
        return 'default';
      case 'pending':
      case 'в ожидании':
        return 'processing';
      case 'rejected':
      case 'отклонен':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'active':
      case 'активен':
        return t('customers.status.active');
      case 'inactive':
      case 'не активен':
      case 'неактивен':
        return t('customers.status.inactive');
      case 'pending':
      case 'в ожидании':
        return t('applications.statusTag.pending');
      case 'rejected':
      case 'отклонен':
      case 'отказано':
        return t('applications.statusTag.rejected');
      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getFullAddress = (): string => {
    return `${object.address_street}${object.address_number ? `, ${object.address_number}` : ''}`;
  };

  return (
    <Card
      hoverable
      style={{
        borderRadius: 12,
        border: '1px solid #e8e8e8',
        marginBottom: 16,
        cursor: 'pointer',
        height: 200,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease'
      }}
      styles={{
        body: {
          padding: 16,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
      onClick={handleCardClick}
    >
      {/* Заголовок - строго 2 строки */}
      <div
        style={{
          marginBottom: 12,
          height: 44, // Фиксированная высота для 2 строк
          display: 'flex',
          alignItems: 'flex-start'
        }}
      >
        <div style={{ flex: 1, paddingRight: 8, height: '100%' }}>
          <EditableText
            initialValue={object.title}
            onChange={handleTitleChange}
            renderDisplay={(value) => (
              <Typography.Title
                level={5}
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1d1d1f',
                  lineHeight: '1.57', // 22px line height
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  height: '44px' // Точно 2 строки
                }}
              >
                {value}
              </Typography.Title>
            )}
          />
        </div>
        <Link
          style={{
            color: '#007aff',
            textDecoration: 'none',
            fontSize: 12,
            flexShrink: 0,
            fontWeight: 500
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onCardClick) {
              onCardClick(object.id);
            }
          }}
        >
          {t('objectCard.more')}
        </Link>
      </div>

      {/* Контент */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 6 }}>
            <Text
              type='secondary'
              style={{
                fontSize: 12,
                color: '#8e8e93',
                lineHeight: '1.4'
              }}
            >
              {t('objectCard.createdAt')}: {formatDate(object.created_at)}
            </Text>
          </div>

          <div style={{ marginBottom: 6 }}>
            <Text
              type='secondary'
              style={{
                fontSize: 12,
                color: '#8e8e93',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {t('objectCard.address')}: {getFullAddress()}
            </Text>
          </div>

          {object.kadastr_number && (
            <div style={{ marginBottom: 6 }}>
              <Text
                type='secondary'
                style={{
                  fontSize: 12,
                  color: '#8e8e93',
                  lineHeight: '1.4',
                  wordBreak: 'break-word',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {t('objectCard.cadastral')}: {object.kadastr_number}
              </Text>
            </div>
          )}
        </div>

        {/* Статус внизу */}
        <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            type='secondary'
            style={{
              fontSize: 12,
              color: '#8e8e93',
              marginRight: 8
            }}
          >
            {t('objectCard.status')}:
          </Text>
          <Tag
            color={getStatusColor(object.status)}
            style={{
              borderRadius: 8,
              border: 'none',
              fontSize: 11,
              padding: '2px 8px',
              margin: 0
            }}
          >
            {getStatusLabel(object.status)}
          </Tag>
        </div>
      </div>
    </Card>
  );
};
