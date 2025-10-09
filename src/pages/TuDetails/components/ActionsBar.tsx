import { FC } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { IGetTyById } from 'types/entities';

import { useGetAccountingProtocolQuery } from 'api/Accounting.api';
import { useGetInvoicesByProtocolTyQuery } from 'api/Buhgalteria.api';

interface ActionsBarProps {
  id: string;
  hasPermission: (perm: string) => boolean;
  onDownloadTu: () => void;
  onAddLoad: () => void;
  onReject: () => void;
  onApprove: () => void;
  onRejectTu?: () => void;
  isDownloading: boolean;
  // New props for contract download
  onDownloadContract?: (protocol_id: string) => void;
  isContractDownloading?: boolean;
  visible?: boolean;
  data: IGetTyById;
}

export const ActionsBar: FC<ActionsBarProps> = ({
  id,
  hasPermission,
  onDownloadTu,
  onAddLoad,
  onReject,
  onApprove,
  isDownloading,
  onDownloadContract,
  isContractDownloading,
  data,
  visible = true
}) => {
  const { t } = useTranslation();
  const { data: protocolData } = useGetAccountingProtocolQuery({ technicalConditionId: id }, { skip: !id });
  const protocolId = protocolData?.id ? String(protocolData.id) : '';
  const invoicesInfo = useGetInvoicesByProtocolTyQuery({ protocol_id: protocolId }, { skip: !protocolId });
  if (!visible) return null;

  return (
    <Flex wrap justify='end' align='center' gap={16} style={{ marginBottom: 16 }}>
      {hasPermission('change_technicalcondition') &&
        (data.status === 'inactive' ? (
          <Button type='link' disabled>
            {t('routers.editTy')}
          </Button>
        ) : (
          <Link to={'/dashboard/add-tu-forms/' + id}>{t('routers.editTy')}</Link>
        ))}
      {hasPermission('view_actty') && (
        <Link to={`/dashboard/technical-conditions/history-of-loads/${id}`}>{t('routers.historyOfLoads')}</Link>
      )}
      {hasPermission('view_historicaltechnicalcondition') && (
        <Link to={`/dashboard/ty/${id}/change-history`}>{t('tuDetails.actions.changeTuData')}</Link>
      )}
      {hasPermission('view_technicalcondition') && (
        <>
          <Button icon={<DownloadOutlined />} onClick={onDownloadTu} loading={isDownloading} disabled={!id}>
            {t('tuDetails.actions.downloadTu')}
          </Button>
          <Button
            onClick={() => onDownloadContract && protocolId && onDownloadContract(protocolId)}
            icon={<DownloadOutlined />}
            loading={isContractDownloading}
            disabled={
              data.stage === 'review' ||
              !protocolId ||
              invoicesInfo.isLoading ||
              invoicesInfo.isFetching ||
              (Array.isArray(invoicesInfo.data) && invoicesInfo.data.length === 0)
            }
          >
            {t('tuDetails.actions.downloadContract')}
          </Button>
        </>
      )}
      {hasPermission('add_actty') && (
        <Button onClick={onAddLoad} icon={<PlusOutlined />} disabled={data.status === 'inactive'}>
          {t('historyOfLoads.addLoad')}
        </Button>
      )}
      {data.stage !== 'approved' && data.status !== 'inactive' && data.status !== 'archived' && (
        <>
          {hasPermission('delete_technicalcondition') && (
            <Button danger onClick={onReject}>
              {t('tuDetails.actions.rejectTu')}
            </Button>
          )}
          {hasPermission('change_technicalcondition') && (
            <Button onClick={onApprove} type='primary'>
              {t('tuDetails.actions.approveTu')}
            </Button>
          )}
        </>
      )}
    </Flex>
  );
};
