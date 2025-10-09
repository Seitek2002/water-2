import { FC, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert, Button, message, Modal, Space, Spin } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { ObjectDetails } from 'components/ObjectDetails/ObjectDetails';

import { useDeleteObjectMutation, useGetObjectByIdQuery, useUpdateObjectTitleMutation } from 'api/Object.api';
import { t } from 'i18next';

interface ObjectDetailProps {
  title?: string;
}

export const ObjectDetail: FC<ObjectDetailProps> = ({ title = t('objectDetail.title') }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Валидация ID
  const objectId = useMemo(() => {
    const parsedId = Number(id);
    return isNaN(parsedId) || parsedId <= 0 ? null : parsedId;
  }, [id]);

  const {
    data: object,
    isLoading,
    error,
    refetch
  } = useGetObjectByIdQuery(objectId!, {
    skip: !objectId // Пропускаем запрос если ID невалидный
  });

  const [updateObjectTitle, { isLoading: isUpdating }] = useUpdateObjectTitleMutation();
  const [deleteObject, { isLoading: isDeleting }] = useDeleteObjectMutation();

  // Мемоизированные обработчики для предотвращения лишних рендеров
  const handleTitleChange = useCallback(
    async (newTitle: string): Promise<void> => {
      if (!object || !newTitle.trim()) return;

      try {
        await updateObjectTitle({
          id: object.id,
          title: newTitle.trim()
        }).unwrap();
        message.success(t('objectDetail.titleUpdated'));
      } catch (error) {
        console.error('Update title error:', error);
        const errorMessage =
          error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
            ? String(error.data.message)
            : t('objectDetail.errorUpdateTitle');
        message.error(errorMessage);
      }
    },
    [object, updateObjectTitle]
  );

  const handleDelete = useCallback((): void => {
    if (!object) return;

    Modal.confirm({
      title: t('objectDetail.confirmDeleteTitle'),
      icon: <ExclamationCircleOutlined />,
      content: t('objectDetail.confirmDeleteContent', { title: object.title }),
      okText: t('objectDetail.delete'),
      cancelText: t('objectDetail.cancel'),
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteObject(object.id).unwrap();
          message.success(t('objectDetail.deleted'));
          navigate('/dashboard/objects', { replace: true });
        } catch (error) {
          console.error('Delete object error:', error);
          const errorMessage =
            error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
              ? String(error.data.message)
              : t('objectDetail.errorDelete');
          message.error(errorMessage);
        }
      }
    });
  }, [object, deleteObject, navigate]);

  const handleBack = useCallback((): void => {
    navigate('/dashboard/objects');
  }, [navigate]);

  const handleRetry = useCallback((): void => {
    refetch();
  }, [refetch]);

  // Обработка невалидного ID
  if (!objectId) {
    return (
      <DashboardLayout title={title}>
        <Alert
          message={t('objectDetail.invalidId')}
          description={t('objectDetail.invalidIdDescription')}
          type='error'
          showIcon
          action={<Button onClick={handleBack}>{t('objectDetail.backToList')}</Button>}
        />
      </DashboardLayout>
    );
  }

  // Обработка ошибок загрузки
  if (error) {
    const isNotFound = 'status' in error && error.status === 404;

    return (
      <DashboardLayout title={title}>
        <Alert
          message={isNotFound ? t('objectDetail.notFound') : t('objectDetail.loadError')}
          description={isNotFound ? t('objectDetail.notFoundDescription') : t('objectDetail.loadErrorDescription')}
          type={isNotFound ? 'warning' : 'error'}
          showIcon
          action={
            <Space>
              {!isNotFound && <Button onClick={handleRetry}>{t('objectDetail.retry')}</Button>}
              <Button onClick={handleBack}>{t('objectDetail.backToList')}</Button>
            </Space>
          }
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={object?.title || title}>
      {/* Заголовок с кнопками */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          disabled={isDeleting}
          style={{
            borderRadius: 12,
            border: 'none',
            backgroundColor: '#f5f5f7'
          }}
        >
          {t('objectDetail.backToList')}
        </Button>

        <Space>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            loading={isDeleting}
            disabled={isUpdating}
            style={{
              borderRadius: 12
            }}
          >
            {t('objectDetail.delete')}
          </Button>
        </Space>
      </div>

      {/* Контент */}
      {isLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '100px 0'
          }}
        >
          <Spin size='large' />
        </div>
      ) : object ? (
        <ObjectDetails object={object} onTitleChange={handleTitleChange} />
      ) : (
        <Alert
          message={t('objectDetail.noData')}
          description={t('objectDetail.noDataDescription')}
          type='info'
          showIcon
          action={<Button onClick={handleRetry}>{t('objectDetail.refresh')}</Button>}
        />
      )}
    </DashboardLayout>
  );
};
