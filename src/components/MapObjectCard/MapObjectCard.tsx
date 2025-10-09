import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Tag, Typography } from 'antd';

import { type MapObject } from 'api/GeoPartal.api';
import { getTypeIcon } from 'utils/mapHelpers';

const { Text } = Typography;

interface MapObjectCardProps {
  selectedObject: MapObject;
}

type ObjectStatus = 'active' | 'inactive' | 'archived';
type ObjectStage = 'draft' | 'approved' | 'completed';

const STAGE_COLORS: Record<ObjectStage, string> = {
  draft: 'orange',
  approved: 'blue',
  completed: 'green'
};

const STATUS_COLORS: Record<ObjectStatus, string> = {
  active: 'green',
  inactive: 'default',
  archived: 'orange'
};

const getStageColor = (stage: ObjectStage): string => {
  return STAGE_COLORS[stage] || 'default';
};

const getStatusColor = (status: ObjectStatus): string => {
  return STATUS_COLORS[status] || 'default';
};

export const MapObjectCard: FC<MapObjectCardProps> = ({ selectedObject }) => {
  const { t } = useTranslation();

  const getStageLabel = (stage: ObjectStage): string => {
    switch (stage) {
      case 'draft':
        return t('tuDetails.stage.draft');
      case 'approved':
        return t('tuDetails.stage.approved');
      case 'completed':
        return t('tuDetails.stage.done');
      default:
        return '';
    }
  };

  const getStatusLabel = (status: ObjectStatus): string => {
    switch (status) {
      case 'active':
        return t('tuDetails.status.active');
      case 'inactive':
        return t('tuDetails.status.inactive');
      case 'archived':
        return t('tuDetails.status.archived');
      default:
        return '';
    }
  };

  return (
    <Card
      title={
        <span>
          {getTypeIcon(selectedObject.type_ty)} #{selectedObject.id}
        </span>
      }
      style={{ width: '100%', maxWidth: 400 }}
      size='small'
    >
      <div style={{ lineHeight: '1.8' }}>
        <div style={{ marginBottom: 8 }}>
          <Text strong>{t('yandexMap.labels.request')}:</Text> {selectedObject.request_number}
        </div>

        <div style={{ marginBottom: 8 }}>
          <Text strong>{t('applicationDetails.table.name')}:</Text> {selectedObject.object_name}
        </div>

        <div style={{ marginBottom: 8 }}>
          <Text strong>{t('yandexMap.labels.address')}:</Text>
          <br />
          <Text type='secondary' style={{ fontSize: '12px' }}>
            {selectedObject.address}
          </Text>
        </div>

        {selectedObject.type_ty && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>{t('objectForm.labels.type')}:</Text>{' '}
            <Tag color='blue'>
              {getTypeIcon(selectedObject.type_ty)} {selectedObject.type_ty}
            </Tag>
          </div>
        )}

        <div style={{ marginBottom: 8 }}>
          <Text strong>{t('yandexMap.labels.status')}:</Text>{' '}
          <Tag color={getStatusColor(selectedObject.status)}>{getStatusLabel(selectedObject.status)}</Tag>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Text strong>{t('yandexMap.labels.stage')}:</Text>{' '}
          <Tag color={getStageColor(selectedObject.stage)}>{getStageLabel(selectedObject.stage)}</Tag>
        </div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            {t('common.coordinates')}: {selectedObject.x.toFixed(6)}, {selectedObject.y.toFixed(6)}
          </Text>
        </div>
      </div>
    </Card>
  );
};
