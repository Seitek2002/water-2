/* eslint-disable simple-import-sort/imports */
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button, Card, Space, Typography } from 'antd';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import type { IGetTyById } from 'types/entities/tu';

const { Title, Text } = Typography;

interface DataSectionProps {
  objectData: IGetTyById;
}

export const DataSection: FC<DataSectionProps> = ({ objectData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const statusRender = (status: IStatus6b3Enum) => {
    switch (status) {
      case 'active':
        return <Text type='warning'>{t('tuDetails.status.active')}</Text>;
      case 'inactive':
        return <Text type='success'>{t('tuDetails.status.inactive')}</Text>;
      case 'archived':
        return <Text type='danger'>{t('tuDetails.status.archived')}</Text>;
    }
  };

  const stageRender = (stage: IStageEnum) => {
    switch (stage) {
      case 'draft':
        return <Text type='secondary'>{t('tuDetails.stage.draft')}</Text>;
      case 'review':
        return <Text type='warning'>{t('tuDetails.stage.review')}</Text>;
      case 'approved':
        return <Text type='success'>{t('tuDetails.stage.approved')}</Text>;
      case 'done':
        return <Text type='success'>{t('tuDetails.stage.done')}</Text>;
      default:
        return <Text type='secondary'>{t('tuDetails.stage.unknown')}</Text>;
    }
  };

  return (
    <>
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.objectName')}</Title>
        <Text>{objectData?.object_name || t('tuDetails.notSpecified')}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.applicationInfo')}</Title>
        <Text strong>{t('tuDetails.labels.requestDate')}</Text> <Text>{(objectData?.request_date as string) || '—'}</Text>
        <br />
        {objectData?.status && (
          <Space>
            <Text strong>{t('common.status')}</Text>
            <Text>{statusRender(objectData?.status) || '—'}</Text>
          </Space>
        )}
        <br />
        {objectData?.stage && (
          <Space>
            <Text strong>{t('tuDetails.labels.stage')}</Text>
            <Text>{stageRender(objectData?.stage) || '—'}</Text>
          </Space>
        )}
        <br />
        <br />
        {objectData?.application ? (
          <>
            <Button type='primary' onClick={() => navigate(`/dashboard/applications/${objectData.application?.id}`)}>
              {t('tuDetails.buttons.goToApplication', 'Перейти к заявке')}
            </Button>
            <br />
          </>
        ) : (
          <br />
        )}
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.additionalCharacteristics')}</Title>
        <Text strong>{t('tuDetails.labels.connectionTarget')}</Text> <Text>{objectData?.connection_target || '—'}</Text>
        <br />
        <Text strong>{t('addTuForms.form.labels.fireFightingInner')}</Text> <Text>{objectData?.fire_fighting_inner || '—'}</Text>
        <br />
        <Text strong>{t('addTuForms.form.labels.fireFightingOuter')}</Text> <Text>{objectData?.fire_fighting_outer || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.fireInput1')}</Text> <Text>{objectData?.fire_input_1 || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.streetPass')}</Text> <Text>{objectData?.street_pass_input_1 || '—'}</Text>
        <br />
        <Text strong>{t('addTuForms.form.labels.freePressureInput1')}</Text>{' '}
        <Text>{objectData?.free_pressure_required_input_1 || '—'}</Text>
        <br />
        <Text strong>{t('addTuForms.form.labels.waterPipeDiameter1')}</Text> <Text>{objectData?.collector_diametr_fire_1 || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.fireInput2')}</Text> <Text>{objectData?.fire_input_2 || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.streetPass')}</Text> <Text>{objectData?.street_pass_input_2 || '—'}</Text>
        <br />
        <Text strong>{t('addTuForms.form.labels.freePressureInput2')}</Text>{' '}
        <Text>{objectData?.free_pressure_required_input_2 || '—'}</Text>
        <br />
        <Text strong>{t('addTuForms.form.labels.waterPipeDiameter2')}</Text> <Text>{objectData?.collector_diametr_fire_2 || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.notes')}</Text> <Text>{objectData?.notes || '—'}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.payment')}</Title>
        <Text strong>{t('tuDetails.labels.paymentInvoiceNumber')}</Text> <Text>{objectData?.payment_invoice_number || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentPaper')}</Text>{' '}
        <Text>
          {objectData?.payment_paper || '—'} {t('tuDetails.currency')}
        </Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentConnection')}</Text>{' '}
        <Text>
          {objectData?.payment_connection || '—'} {t('tuDetails.currency')}
        </Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentAmount')}</Text>{' '}
        <Text>
          {objectData?.payment_amount || '—'} {t('tuDetails.currency')}
        </Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentDeadline')}</Text> <Text>{(objectData?.payment_deadline as string) || '—'}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.customer')}</Title>
        <Text>{objectData?.customer?.full_name}</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          {t('tuDetails.titles.objectLocation')}
        </Title>
        <Text>{objectData?.address}</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          {t('tuDetails.titles.waterRequired')}
        </Title>
        <Text>
          {objectData?.water_required} {t('tuDetails.units.m3PerDay')}
        </Text>
        <Title level={4} style={{ marginTop: 16 }}>
          {t('tuDetails.titles.pressureRequired')}
        </Title>
        <Text>
          {objectData?.pressure_required} {t('tuDetails.units.mWaterCol')}
        </Text>
        <Title level={4} style={{ marginTop: 16 }}>
          {t('tuDetails.titles.sewageAmount')}
        </Title>
        <Text>{objectData?.sewage_amount || '—'}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.waterSupply')}</Title>
        <Text strong>{t('addTuForms.form.labels.waterPipe')}</Text> <Text>{objectData?.water_pipe || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.streetPass')}</Text> <Text>{objectData?.street_pass_water || '—'}</Text>
        <br />
        <Text strong>{t('addTuForms.form.labels.collectorDiameter')}</Text> <Text>{objectData?.collector_diametr_water || '—'}</Text>
        <br />
        <Text strong>{t('addTuForms.form.labels.provideWater')}</Text> <Text>{objectData?.provide_water || '—'}</Text>
      </Card>

      <Card>
        <Title level={4}>{t('tuDetails.titles.sewer')}</Title>
        <Text strong>{t('addTuForms.form.labels.sewer')}</Text> <Text>{objectData?.sewer_pipe || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.streetPass')}</Text> <Text>{objectData?.street_pass_sewer || '—'}</Text>
        <br />
        <Text strong>{t('addTuForms.form.labels.collectorDiameter')}</Text> <Text>{objectData?.collector_diametr_sewer || '—'}</Text>
        <br />
        <Text strong>{t('addTuForms.form.labels.provideSewer')}</Text> <Text>{objectData?.provide_sewer || '—'}</Text>
      </Card>
    </>
  );
};
