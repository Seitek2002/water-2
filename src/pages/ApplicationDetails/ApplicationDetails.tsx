import { FC, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { TabsProps } from 'antd';
import { Alert, Button, Card, message, Modal, Spin, Tabs, Tag, Typography } from 'antd';
import {
  ArrowDownOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { RejectApplicationModal } from 'components/Modal';

import {
  useApproveApplicationMutation,
  useDeleteApplicationFileMutation,
  useGetApplicationByIdQuery,
  useUploadApplicationFilesMutation
} from 'api/Application.api';
import { RefusalBody, useCreateRefusalMutation, useLazySearchRefusalQuery } from 'api/Refusal.api';
import { useCreateTyFromApplicationMutation } from 'api/Ty.api';
import { usePermissions } from 'hooks/useAuth';
import { t } from 'i18next';

type ApplicationFileItem = string | { id: number; file: string; created_at?: string };

type RefusalItem = {
  causes?: { id: number; title: string }[];
  comment?: string;
  created_at?: string;
  refusal_files?: { title?: string; file: string }[];
};

const tabItems: TabsProps['items'] = [
  { key: 'data', label: t('applicationDetails.tabs.data') },
  { key: 'documents', label: t('applicationDetails.tabs.documents') }
];

export const ApplicationDetails: FC<{ title?: string }> = ({ title = 'routers.ApplicationDetails' }) => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('data');
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const { data, isLoading, isError, refetch } = useGetApplicationByIdQuery(id || '');
  const [deleteApplicationFile] = useDeleteApplicationFileMutation();
  const [uploadApplicationFiles] = useUploadApplicationFilesMutation();
  const [approveApplication, { isSuccess: isApproveSuccess, isError: isApproveError }] = useApproveApplicationMutation();
  const [createRefuse, { isSuccess: isRejectSuccess, isError: isRejectError }] = useCreateRefusalMutation();
  const [triggerRefusalSearch, { data: refusalSearch, isFetching: isRefusalFetching }] = useLazySearchRefusalQuery();
  const [createTy] = useCreateTyFromApplicationMutation();

  const [isRefusalInfoOpen, setIsRefusalInfoOpen] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openRejectModal = () => setIsRejectModalOpen(true);
  const closeRejectModal = () => setIsRejectModalOpen(false);

  const handleReject = (values: RefusalBody) => {
    closeRejectModal();
    createRefuse({ ...values, application: String(id || '') });
  };

  const handleApprove = () => {
    approveApplication({ applicationId: String(id) });
    createTy({ application_id: Number(id) });
  };

  const onPdfClick = () => {
    navigate('/dashboard/export-data');
  };

  useEffect(() => {
    if (isApproveSuccess) {
      message.success(t('applicationDetails.messages.approveSuccess'));
    }
    if (isApproveError) {
      message.error(t('applicationDetails.messages.approveError'));
    }
    if (isRejectSuccess) {
      message.success(t('applicationDetails.messages.rejectSuccess'));
    }
    if (isRejectError) {
      message.error(t('applicationDetails.messages.rejectError'));
    }
  }, [isApproveError, isApproveSuccess, isRejectError, isRejectSuccess]);

  useEffect(() => {
    if (isApproveSuccess || isRejectSuccess) {
      refetch();
    }
  }, [isApproveSuccess, isRejectSuccess, refetch]);

  return (
    <DashboardLayout title={t(title) + id}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <Button onClick={onPdfClick} icon={<DownloadOutlined />}>
          {t('applicationDetails.buttons.pdf')}
        </Button>
        {hasPermission('change_application') && (
          <Button disabled={Boolean(data?.ty_id)} onClick={() => navigate(`/dashboard/applications/${id}/edit`)}>
            {t('applicationDetails.buttons.edit')}
          </Button>
        )}

        {hasPermission('view_historicalapplication') && (
          <Button onClick={() => navigate(`/dashboard/applications/${id}/change-history`)}>{t('routers.changeHistory')}</Button>
        )}
        {data?.status === 'pending' && (
          <>
            <Button onClick={openRejectModal}>{t('applications.actions.reject')}</Button>
            <Button type='primary' onClick={handleApprove}>
              {t('applications.actions.approve')}
            </Button>
          </>
        )}
        {data?.status === 'approved' && (
          <Button
            disabled={!hasPermission('add_technicalcondition')}
            type='primary'
            onClick={() => navigate(`/dashboard/add-tu-forms/${data.ty_id}`)}
          >
            {t('applications.actions.create')}
          </Button>
        )}
        {data?.status === 'contracted' && data?.ty_id && (
          <Button type='primary' onClick={() => navigate(`/dashboard/technical-conditions/tu-details/${data.ty_id}`)}>
            {t('applications.actions.goToTu')}
          </Button>
        )}
        {hasPermission('delete_application') && data?.status === 'rejected' && (
          <Button
            danger
            onClick={async () => {
              if (id) {
                try {
                  await triggerRefusalSearch({ application: Number(id) });
                } catch {
                  // noop
                }
              }
              setIsRefusalInfoOpen(true);
            }}
          >
            {t('applications.actions.decline')}
          </Button>
        )}
      </div>
      <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }} />
      {isLoading ? (
        <Spin />
      ) : isError ? (
        <Alert type='error' message={t('applicationDetails.loadError')} />
      ) : data ? (
        <>
          {activeTab === 'data' && (
            <>
              <Card style={{ marginBottom: 24 }}>
                <Typography.Title level={4}>{t('applicationDetails.labels.objectName')}</Typography.Title>
                <Typography.Text>{data.object}</Typography.Text>
              </Card>
              <Card>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.registrationDate')}</b>
                  <div>{data.created_at ? new Date(data.created_at).toLocaleDateString() : ''}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.customer')}</b>
                  <div>{data.customer.full_name}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.address')}</b>
                  <div>{data.address}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.waterRequired')}</b>
                  <div>{data.waterRequired}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.wastewater')}</b>
                  <div>{data.firefightingExpenses}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.status')}</b>
                  <div>
                    <Tag color={data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'error' : 'processing'}>
                      {data.status === 'approved'
                        ? t('applicationDetails.status.approved')
                        : data.status === 'rejected'
                          ? t('applicationDetails.status.rejected')
                          : data.status === 'pending'
                            ? t('applicationDetails.status.pending')
                            : t('applicationDetails.status.tuConcluded')}
                    </Tag>
                  </div>
                </div>
              </Card>
            </>
          )}
          {activeTab === 'documents' && (
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
              <Typography.Title level={5} style={{ marginBottom: 16 }}>
                {t('applicationDetails.documentsTitle')}
              </Typography.Title>
              <div style={{ marginBottom: 16 }}>
                <Button type='primary' icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
                  {t('applicationDetails.buttons.addFile')}
                </Button>
                <input
                  ref={fileInputRef}
                  type='file'
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    if (files.length > 0 && id) {
                      try {
                        await uploadApplicationFiles({ application: Number(id), files });
                        refetch();
                        // Можно добавить message.success('Файл успешно загружен');
                      } catch {
                        // Можно добавить message.error('Ошибка при загрузке файла');
                      }
                    }
                    e.target.value = '';
                  }}
                />
              </div>
              {data.application_files && data.application_files.length > 0 ? (
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>{t('applicationDetails.table.name')}</th>
                      <th style={{ textAlign: 'left' }}>{t('applicationDetails.table.uploadDate')}</th>
                      <th style={{ textAlign: 'left' }}>{t('applicationDetails.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.application_files as ApplicationFileItem[]).map((file) => (
                      <tr key={typeof file === 'string' ? file : `id-${file.id}`}>
                        <td>
                          {(() => {
                            const fileUrl = typeof file === 'string' ? file : file.file;
                            const name = fileUrl.split('/').pop() || '';
                            const ext = name.split('.').pop()?.toLowerCase();
                            if (ext === 'pdf') return <FilePdfOutlined style={{ color: '#d4380d', fontSize: 18, marginRight: 8 }} />;
                            if (['doc', 'docx'].includes(ext || ''))
                              return <FileWordOutlined style={{ color: '#1890ff', fontSize: 18, marginRight: 8 }} />;
                            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext || ''))
                              return <FileImageOutlined style={{ color: '#52c41a', fontSize: 18, marginRight: 8 }} />;
                            return <FileOutlined style={{ fontSize: 18, marginRight: 8 }} />;
                          })()}
                          <a href={typeof file === 'string' ? file : file.file} target='_blank' rel='noopener noreferrer'>
                            {(typeof file === 'string' ? file : file.file).split('/').pop()}
                          </a>
                        </td>
                        <td>{typeof file !== 'string' && file.created_at ? new Date(file.created_at).toLocaleDateString() : ''}</td>
                        <td>
                          {typeof file !== 'string' && (
                            <Button
                              type='text'
                              danger
                              icon={
                                <span style={{ fontWeight: 'bold', fontSize: 18 }}>
                                  <DeleteOutlined />
                                </span>
                              }
                              onClick={() => {
                                Modal.confirm({
                                  title: t('architectureDetails.titles.delete'),
                                  content: t('architectureDetails.confirmDelete'),
                                  okText: t('architectureDetails.buttons.delete'),
                                  cancelText: t('architectureDetails.buttons.cancel'),
                                  okButtonProps: { danger: true },
                                  onOk: async () => {
                                    try {
                                      await deleteApplicationFile({ id: file.id }).unwrap();
                                      message.success(t('applicationDetails.messages.fileDeleted'));
                                      refetch();
                                    } catch {
                                      message.error(t('applicationDetails.messages.fileDeleteError'));
                                    }
                                  }
                                });
                              }}
                            />
                          )}
                          <Button
                            type='text'
                            icon={
                              <span style={{ fontWeight: 'bold', fontSize: 18 }}>
                                <ArrowDownOutlined />
                              </span>
                            }
                            href={typeof file === 'string' ? file : file.file}
                            target='_blank'
                            rel='noopener noreferrer'
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography.Text type='secondary'>{t('applicationDetails.noDocs')}</Typography.Text>
              )}
            </div>
          )}
        </>
      ) : null}
      <Modal
        open={isRefusalInfoOpen}
        title={t('applicationDetails.refusal.title')}
        onCancel={() => setIsRefusalInfoOpen(false)}
        footer={null}
      >
        {isRefusalFetching ? (
          <Spin />
        ) : Array.isArray(refusalSearch) && (refusalSearch as RefusalItem[]).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(refusalSearch as RefusalItem[]).map((item, idx) => (
              <div key={idx} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.refusal.causes')}:</b>{' '}
                  {Array.isArray(item.causes) && item.causes.length ? item.causes.map((c) => c.title).join(', ') : t('common.noData')}
                </div>
                {item.comment && (
                  <div style={{ marginBottom: 8 }}>
                    <b>{t('applicationDetails.refusal.comment')}:</b>
                    {item.comment}
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.refusal.date')}:</b>{' '}
                  {item.created_at ? new Date(item.created_at).toLocaleString() : t('common.noData')}
                </div>
                {Array.isArray(item.refusal_files) && item.refusal_files.length > 0 && (
                  <div>
                    <b>{t('applicationDetails.refusal.files')}:</b>
                    <ul style={{ marginTop: 4 }}>
                      {item.refusal_files.map((f, i) => (
                        <li key={i}>
                          <a href={f.file} target='_blank' rel='noopener noreferrer'>
                            {f.title || (f.file ? String(f.file).split('/').pop() : t('applicationDetails.refusal.untitledFile'))}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Typography.Text type='secondary'>{t('applicationDetails.refusal.noData')}</Typography.Text>
        )}
      </Modal>
      <RejectApplicationModal open={isRejectModalOpen} onCancel={closeRejectModal} onReject={handleReject} />
    </DashboardLayout>
  );
};
