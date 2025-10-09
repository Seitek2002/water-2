import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Alert, Button, Card, Col, Flex, message, Modal, Row, Spin, Tabs, TabsProps, Typography } from 'antd';
import { CheckCircleTwoTone, ClockCircleTwoTone, EditTwoTone, FileOutlined, QuestionCircleTwoTone } from '@ant-design/icons';
import { ActionsBar } from './components/ActionsBar';
import { DataSection } from './components/DataSection';
import { DocumentsProgress } from './components/DocumentsProgress';
import { AccountingTab } from 'components/AccountingTab/AccountingTab';
import { DashboardLayout } from 'components/DashboardLayout';
import { RejectApplicationModal } from 'components/Modal/RejectApplicationModal';
import { IActEnum } from 'types/common';
import type { ITyBody } from 'types/entities';
import AddLoadModal from './AddLoadModal';
import { Architecture } from './Tabs';

import { useGetUserInfoQuery } from 'api/Auth.api';
import { useLazyDownloadContractDocxQuery } from 'api/Buhgalteria.api';
import { useGetFoldersQuery } from 'api/FileFolder.api';
import { type RefusalBody, useCreateRefusalMutation } from 'api/Refusal.api';
import {
  useCreateActTyMutation,
  useGetTyByIdQuery,
  useLazyDownloadProtocolDocxQuery,
  useLazyGetActTyByIdQuery,
  usePatchActTyMutation,
  useUpdateTyMutation
} from 'api/Ty.api';
import { usePermissions } from 'hooks/useAuth';
import { t } from 'i18next';

type WithCategory = { category?: { id?: string | number; title?: string } };

const normalize = (s?: string) => (s ? s.toLowerCase().trim() : '');
const idsEqual = (a?: string | number, b?: string | number) => String(a ?? '') === String(b ?? '');

const makeByCategory =
  <T extends WithCategory>(list?: T[]) =>
  (categoryId?: string | number, categoryTitle?: string): T[] =>
    (list ?? []).filter((item) => {
      const byId = categoryId !== undefined && idsEqual(item.category?.id, categoryId);
      const byTitle = !!categoryTitle && normalize(item.category?.title) === normalize(categoryTitle);
      return byId || byTitle;
    });

const { Title, Text } = Typography;

interface IProps {
  title: string;
}

export const TuDetails: FC<IProps> = ({ title }) => {
  const { id } = useParams<{ id: string }>();
  const userQuery = useGetUserInfoQuery();
  const foldersQuery = useGetFoldersQuery({ ty_id: id || '' });
  const { hasPermission } = usePermissions();

  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data: objectData,
    isLoading,
    isError,
    refetch
  } = useGetTyByIdQuery(
    {
      tyId: id || ''
    },
    {
      skip: !id
    }
  );

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || '1');
  const [isAddLoadVisible, setIsAddLoadVisible] = useState<boolean>(false);
  const [triggerDownload, { isFetching: isDownloading }] = useLazyDownloadProtocolDocxQuery();
  const [triggerContractDownload, { isFetching: isContractDownloading }] = useLazyDownloadContractDocxQuery();
  const [updateTy] = useUpdateTyMutation();
  const [patchActTy] = usePatchActTyMutation();
  const [createAct] = useCreateActTyMutation();
  const [triggerGetAct, { isFetching: isActFetching }] = useLazyGetActTyByIdQuery();
  const [createRefusal] = useCreateRefusalMutation();

  // Act TY sequential statuses and labels
  const ACT_ORDER: IActEnum[] = ['draft', 'review', 'approved', 'done'];
  const actStatusLabels: Record<IActEnum, string> = {
    draft: t('tuDetails.act.actions.upload', 'Загрузить акт'),
    review: t('tuDetails.act.actions.toReview', 'На рассмотрение'),
    approved: t('tuDetails.act.actions.approve', 'Утвердить'),
    done: t('tuDetails.act.actions.finish', 'Завершить')
  };
  const nextActStatus = useMemo(() => {
    if (!objectData?.act) return 'draft' as IActEnum;
    const idx = ACT_ORDER.indexOf(objectData.act.status as IActEnum);
    return idx >= 0 && idx < ACT_ORDER.length - 1 ? (ACT_ORDER[idx + 1] as IActEnum) : null;
  }, [objectData?.act]);

  const isTuApproved = objectData?.stage === 'approved';

  const getActStatusLabel = (st?: IActEnum) => {
    const map: Record<IActEnum, string> = {
      draft: t('tuDetails.act.status.draft', 'Черновик'),
      review: t('tuDetails.act.status.review', 'На рассмотрении'),
      approved: t('tuDetails.act.status.approved', 'Утвержден'),
      done: t('tuDetails.act.status.done', 'Завершен')
    };
    return st ? map[st] : t('tuDetails.act.status.none', 'Нет акта');
  };

  const getActStatusIcon = (st?: IActEnum) => {
    switch (st) {
      case 'draft':
        return <EditTwoTone twoToneColor='#fa8c16' />;
      case 'review':
        return <ClockCircleTwoTone twoToneColor='#327BE8' />;
      case 'approved':
        return <CheckCircleTwoTone twoToneColor='#52c41a' />;
      case 'done':
        return <CheckCircleTwoTone twoToneColor='#389e0d' />;
      default:
        return <QuestionCircleTwoTone twoToneColor='#8c8c8c' />;
    }
  };

  const openActStatusModal = (status: IActEnum) => {
    if (!id) return;
    if (objectData?.stage !== 'approved') {
      message.warning(t('tuDetails.act.messages.mustBeApproved', 'Действие доступно только после утверждения ТУ'));
      return;
    }
    if (objectData?.act) {
      Modal.confirm({
        title: t('tuDetails.act.confirm.changeTitle', 'Изменить статус акта?'),
        content: t('tuDetails.act.confirm.changeContent', 'Вы действительно хотите изменить статус акта?'),
        okText: t('common.yes', 'Да'),
        cancelText: t('common.cancel', 'Отмена'),
        onOk: async () => {
          try {
            await patchActTy({ id: objectData.act!.id, body: { status } }).unwrap();
            message.success(t('tuDetails.act.messages.statusUpdated', 'Статус акта обновлён'));
            refetch();
          } catch {
            message.error(t('tuDetails.act.messages.statusUpdateFailed', 'Не удалось изменить статус акта'));
          }
        }
      });
    } else {
      Modal.confirm({
        title: t('tuDetails.act.confirm.createTitle', 'Создать акт подтверждения?'),
        content: t('tuDetails.act.confirm.createContent', 'Будет создан акт. Продолжить?'),
        okText: t('common.yes', 'Да'),
        cancelText: t('common.cancel', 'Отмена'),
        onOk: async () => {
          try {
            await createAct({ ty: id, status }).unwrap();
            message.success(t('tuDetails.act.messages.uploadSuccess', 'Акт загружен'));
            refetch();
          } catch {
            message.error(t('tuDetails.act.messages.statusUpdateFailed', 'Не удалось изменить статус акта'));
          }
        }
      });
    }
  };

  const handleRejectClick = (): void => {
    setIsModalVisible(true);
  };

  const handleApproveClick = async () => {
    if (!id) return;
    try {
      await updateTy({ id, body: { ...objectData, stage: 'approved' } as unknown as ITyBody }).unwrap();
      message.success(t('tuDetails.messages.approved', 'ТУ одобрены'));
      refetch();
    } catch (e) {
      console.error('Failed to approve TU', e);
      message.error(t('tuDetails.messages.approveFailed', 'Не удалось одобрить ТУ'));
    }
  };

  const handleRejectTu = async () => {
    if (!id) return;
    try {
      await updateTy({ id, body: { ...objectData, status: 'rejected' } as unknown as ITyBody }).unwrap();
      message.success(t('tuDetails.messages.tuRejected', 'ТУ отклонено'));
      refetch();
    } catch (e) {
      console.error('Failed to reject TU', e);
      message.error(t('tuDetails.messages.tuRejectFailed', 'Не удалось отказать ТУ'));
    }
  };

  const handleRejectSubmit = async (data: RefusalBody) => {
    if (!id) return;
    try {
      await createRefusal({
        ty: id,
        causes_ids: (data.causes_ids as (number | string)[]).map((v) => Number(v)),
        comment: data.comment,
        refusal_files: data.refusal_files || []
      }).unwrap();
      message.success(t('tuDetails.messages.rejected', 'Отказ создан'));
      setIsModalVisible(false);
      refetch();
    } catch (e) {
      console.error('Failed to create refusal', e);
      message.error(t('tuDetails.messages.rejectFailed', 'Не удалось создать отказ'));
    }
  };

  const handleModalCancel = (): void => {
    setIsModalVisible(false);
  };

  const handleTabChange = (key: string): void => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    next.set('tab', key);
    setSearchParams(next);
  };

  const commonFolders = useMemo(
    () => [...(foldersQuery.data?.custom || []), ...(foldersQuery.data?.required || [])],
    [foldersQuery.data?.custom, foldersQuery.data?.required]
  );
  const getRequiredByCategory = useMemo(() => makeByCategory(foldersQuery.data?.required), [foldersQuery.data?.required]);
  const getCustomByCategory = useMemo(() => makeByCategory(foldersQuery.data?.custom), [foldersQuery.data?.custom]);

  const getCategoryLabel = useCallback((title: string) => {
    switch (title.toLowerCase()) {
      case 'архитектура':
        return t('tuDetails.tabs.architecture');
      case 'документы':
        return t('tuDetails.tabs.documents');
      case 'бухгалтерия':
        return t('tuDetails.tabs.accounting');
      default:
        return title;
    }
  }, []);

  const dynamicTabs: TabsProps['items'] = useMemo(
    () =>
      userQuery.data?.user.allowed_categories?.map((category, index) => {
        let content: React.ReactNode = <Text>{t('tuDetails.contentNotImplemented', { title: category.title })}</Text>;

        switch (category.title.toLowerCase()) {
          case 'бухгалтерия':
            content = id ? <AccountingTab data={objectData} technicalConditionId={id} /> : null;
            break;
          default:
            content = (
              <Architecture
                categoryId={category.id}
                documentsRequire={getRequiredByCategory(category.id, category.title)}
                documentsCustom={getCustomByCategory(category.id, category.title)}
              />
            );
            break;
        }

        return {
          key: category.title.toLowerCase() === 'бухгалтерия' ? 'accounting' : `dynamic-${index + 2}`,
          label: getCategoryLabel(category.title),
          children: content
        };
      }) || [],
    [userQuery.data?.user.allowed_categories, getCategoryLabel, id, objectData, getRequiredByCategory, getCustomByCategory]
  );

  const tabItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: '1',
        label: t('tuDetails.tabs.data'),
        children: objectData ? <DataSection objectData={objectData} /> : null
      },
      ...dynamicTabs
    ],
    [objectData, dynamicTabs]
  );

  useEffect(() => {
    const validKeys = (tabItems || []).map((i) => i?.key as string);
    const urlTab = searchParams.get('tab') || '1';
    const next = validKeys.includes(urlTab) ? urlTab : '1';
    if (next !== activeTab) {
      setActiveTab(next);
    }
  }, [searchParams, tabItems, activeTab]);

  const handleAddLoad = () => {
    setIsAddLoadVisible(true);
  };

  const handleDownloadTu = async () => {
    if (!id) return;
    try {
      const { blob, filename } = await triggerDownload({ tyId: id }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `technical_condition_${id}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download TU DOCX', error);
    }
  };

  const handleDownloadContract = async (protocol_id: string) => {
    if (!id) return;
    const customerType = objectData?.customer?.type;
    if (!customerType) {
      console.error('Cannot download contract: missing customer type');
      return;
    }
    try {
      const { blob, filename } = await triggerContractDownload({ ty_id: protocol_id, customer_type: customerType }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `contract_${id}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download contract DOCX', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title={`${t(title)} ${id}`}>
        <Flex justify='center' align='center' style={{ minHeight: 200 }}>
          <Spin size='large' />
        </Flex>
      </DashboardLayout>
    );
  }

  if (isError || !objectData) {
    return (
      <DashboardLayout title={`${t(title)} ${id}`}>
        <Alert message={t('tuDetails.loadError')} description={t('tuDetails.loadErrorDescription')} type='error' showIcon />
      </DashboardLayout>
    );
  }

  const folders = foldersQuery.data; // где foldersQuery.data имеет тип IFileFolderFolder

  // Подсчитываем общее число необходимых папок
  const totalRequiredFolders = folders?.required?.length ?? 0;

  // Подсчитываем, сколько из них имеют filled === true
  const filledRequiredFolders = folders?.required?.filter((item) => item.filled).length ?? 0;

  // Вычисляем процент (если totalRequiredFolders > 0)
  const percent = totalRequiredFolders > 0 ? (filledRequiredFolders / totalRequiredFolders) * 100 : 0;

  return (
    <DashboardLayout title={`${t(title)} ${id}`}>
      <ActionsBar
        visible={activeTab === '1'}
        id={id || ''}
        hasPermission={hasPermission}
        onDownloadTu={handleDownloadTu}
        onAddLoad={handleAddLoad}
        onReject={handleRejectClick}
        onApprove={handleApproveClick}
        onRejectTu={handleRejectTu}
        isDownloading={isDownloading}
        onDownloadContract={handleDownloadContract}
        isContractDownloading={isContractDownloading}
        data={objectData}
      />

      <Row gutter={24}>
        <Col span={activeTab === '1' ? 16 : 24}>
          <Tabs activeKey={activeTab} items={tabItems} onChange={handleTabChange} />
        </Col>
        {activeTab === '1' && (
          <Col span={8}>
            <DocumentsProgress percent={percent} commonFolders={commonFolders} />

            <Card>
              <Title level={4}>{t('tuDetails.titles.confirmationAct')}</Title>
              {objectData.act?.file && (
                <Row justify='start' align='middle' gutter={8}>
                  <Col>
                    <FileOutlined style={{ color: '#1677ff' }} />
                  </Col>
                  <Col>
                    <Typography.Link onClick={() => window.open(objectData.act!.file!, '_blank')}>
                      {decodeURIComponent(objectData.act!.file!.split('/').pop() || 'act.docx')}
                    </Typography.Link>
                  </Col>
                </Row>
              )}
              <Row justify='space-between' align='middle'>
                <Text>{getActStatusLabel(objectData.act?.status as IActEnum | undefined)}</Text>
                {getActStatusIcon(objectData.act?.status as IActEnum | undefined)}
              </Row>
              <br />
              {objectData.act && (
                <Button
                  loading={isActFetching}
                  onClick={async () => {
                    try {
                      const res = (await triggerGetAct({ id: objectData.act!.id }).unwrap()) as import('types/requests').IActTyResponse;
                      const fileUrl = res?.file || undefined;
                      if (!fileUrl) {
                        message.warning(t('tuDetails.act.messages.fileRequired', 'Выберите файл акта'));
                        return;
                      }
                      try {
                        const response = await fetch(fileUrl, { credentials: 'include' });
                        if (!response.ok) throw new Error('download failed');
                        const blob = await response.blob();
                        const nameFromUrl = fileUrl.split('/').pop() || `act_${objectData.act!.id}`;
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = nameFromUrl;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error('[ACT GET] download file failed', err);
                        // Fallback — открыть в новой вкладке
                        window.open(fileUrl, '_blank');
                      }
                    } catch (e) {
                      console.error('[ACT GET] failed', e);
                      message.error(t('tuDetails.act.messages.statusUpdateFailed', 'Не удалось изменить статус акта'));
                    }
                  }}
                >
                  {t('tuDetails.act.actions.download', 'Скачать акт')}
                </Button>
              )}
              {isTuApproved && nextActStatus && (
                <Button
                  type='primary'
                  style={{ marginTop: 8, marginLeft: objectData.act ? 8 : 0 }}
                  onClick={() => openActStatusModal(nextActStatus)}
                >
                  {actStatusLabels[nextActStatus]}
                </Button>
              )}
            </Card>
          </Col>
        )}
      </Row>

      <RejectApplicationModal open={isModalVisible} onCancel={handleModalCancel} onReject={handleRejectSubmit} />
      <AddLoadModal visible={isAddLoadVisible} onClose={() => setIsAddLoadVisible(false)} tyId={id || ''} />
    </DashboardLayout>
  );
};
