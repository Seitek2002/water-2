import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Form, Input, message, Modal } from 'antd';
import { Table } from 'common/ui';
import { Pagination } from 'common/ui';
import { TUFilterBar } from '../components/TUFilterBar/TUFilterBar';
import { DashboardLayout } from 'components';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import { ITechnicalCondition } from 'types/entities';
import { IGetAllTechnicalConditionParams } from 'types/requests';
import { getColumns } from './TechnicalConditionsPage.helpers';
import './styles.scss';

import { useCreatePresetMutation, useGetPresetsQuery } from 'api/Presets.api';
import { useGetAllTyQuery, usePatchTyMutation } from 'api/Ty.api';
import { t } from 'i18next';

interface TUFilterValues {
  search?: string;
  ordering?: string;
  payment_ordering?: string;
  stage?: IStageEnum;
  status?: IStatus6b3Enum;
  date?: string;
  has_invoice?: boolean;
  overdue?: boolean;
  due_in_days?: number;
  type_ty?: number;
  id?: number;
  address?: string;
  payment_amount?: number;
  tu_with_loads?: boolean;
}

export const TechnicalConditionsPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : 1;
  const pageSize = Number(searchParams.get('page_size')) > 0 ? Number(searchParams.get('page_size')) : 8;

  const s = (key: string) => searchParams.get(key) || undefined;

  const search = s('search');
  const status = (s('status') as IStatus6b3Enum | undefined) || undefined;
  const stage = (s('stage') as IStageEnum | undefined) || undefined;
  const date = s('date');
  const payment_ordering = s('payment_ordering');
  const filterOrdering = s('ordering');
  const hasInvoiceStr = s('has_invoice');
  const overdueStr = s('overdue');
  const dueInDaysStr = s('due_in_days');

  const has_invoice = hasInvoiceStr === 'true' ? true : hasInvoiceStr === 'false' ? false : undefined;
  const overdue = overdueStr === 'true' ? true : overdueStr === 'false' ? false : undefined;
  const due_in_days = dueInDaysStr && !Number.isNaN(Number(dueInDaysStr)) ? Number(dueInDaysStr) : undefined;

  const typeTyStr = s('type_ty');
  const idStr = s('id');
  const addressParam = s('address');
  const paymentAmountStr = s('payment_amount');
  const tuWithLoadsStr = s('tu_with_loads');

  const type_ty = typeTyStr && !Number.isNaN(Number(typeTyStr)) ? Number(typeTyStr) : undefined;
  const id = idStr && !Number.isNaN(Number(idStr)) ? Number(idStr) : undefined;
  const address = addressParam || undefined;
  const payment_amount = paymentAmountStr && !Number.isNaN(Number(paymentAmountStr)) ? Number(paymentAmountStr) : undefined;
  const tu_with_loads = tuWithLoadsStr === 'true' ? true : tuWithLoadsStr === 'false' ? false : undefined;

  const ordering = [date, payment_ordering, filterOrdering].filter(Boolean).join(', ');

  const queryParams: IGetAllTechnicalConditionParams = {
    page,
    page_size: pageSize,
    search,
    status,
    stage,
    type_ty,
    ordering: ordering || '-created_at',
    has_invoice,
    overdue,
    due_in_days
  };

  const { data: tuData, isLoading } = useGetAllTyQuery(queryParams, {
    refetchOnMountOrArgChange: true
  });
  const [patchTy] = usePatchTyMutation();

  const { data: presetsData, isFetching: presetsLoading } = useGetPresetsQuery({ target: 'ty', page_size: 100 });
  const [createPreset, { isLoading: creatingPreset }] = useCreatePresetMutation();

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveForm] = Form.useForm();

  const [tableData, setTableData] = useState<ITechnicalCondition[]>([]);

  useEffect(() => {
    if (tuData && Array.isArray(tuData.results)) {
      let data = tuData.results;

      if (id !== undefined) {
        data = data.filter((d) => d.id === id);
      }

      if (address) {
        const addr = address.toLowerCase();
        data = data.filter((d) => (d.address || '').toLowerCase().includes(addr));
      }

      if (payment_amount !== undefined) {
        data = data.filter((d) => {
          const amt = parseFloat(String(d.payment_amount).replace(/\s/g, '').replace(',', '.'));
          return !Number.isNaN(amt) && amt === payment_amount;
        });
      }

      if (tu_with_loads !== undefined) {
        data = data.filter((d) => ((d.type || '') === 'load_increase') === tu_with_loads);
      }

      setTableData(data);
    }
  }, [tuData, id, address, payment_amount, tu_with_loads]);

  const handleFilterChange = (values: TUFilterValues) => {
    const next = new URLSearchParams(searchParams);
    const { date, payment_ordering, ordering: filterOrd, ...rest } = values;

    const setOrDelete = (key: string, val: unknown) => {
      if (val === undefined || val === null || String(val).trim() === '') next.delete(key);
      else next.set(key, String(val));
    };

    setOrDelete('date', date);
    setOrDelete('payment_ordering', payment_ordering);
    setOrDelete('ordering', filterOrd);

    Object.entries(rest).forEach(([k, v]) => setOrDelete(k, v as unknown));

    next.set('page', '1');
    next.set('page_size', String(pageSize));
    setSearchParams(next, { replace: false });
  };

  const handleAddClick = () => {
    navigate('/dashboard/applications/create');
  };

  const handleDownloadClick = (presetId?: number | string) => {
    if (presetId) {
      navigate('/dashboard/export-data', {
        state: {
          autoExport: {
            preset_id: Number(presetId),
            entity: 'technical_conditions',
            export: 'xlsx'
          }
        }
      });
    } else {
      navigate('/dashboard/export-data');
    }
  };

  const applyPreset = (preset: { query_string: string }) => {
    const next = new URLSearchParams(preset.query_string);
    next.set('page', '1');
    next.set('page_size', String(pageSize));
    setSearchParams(next, { replace: false });
  };

  const handleRequestSavePreset = () => setSaveModalOpen(true);

  const handleSavePresetOk = async () => {
    try {
      const values = await saveForm.validateFields();
      const next = new URLSearchParams(searchParams);
      next.delete('page');
      next.set('page_size', String(pageSize));
      const qs = next.toString();
      await createPreset({ name: values.name, description: values.description, target: 'ty', query_string: qs }).unwrap();
      message.success(t('technicalConditions.presets.saved', 'Шаблон сохранён'));
      setSaveModalOpen(false);
      saveForm.resetFields();
    } catch {
      // ignore
    }
  };
  const columns = useMemo(
    () =>
      getColumns({
        onClick: (record, action) => {
          switch (action) {
            case 'edit':
              navigate(`/dashboard/technical-conditions/tu-details/${record.id}`);
              break;
            case 'delete':
              patchTy({ id: record.id, body: { status: 'inactive' } });
              break;
            case 'view':
              navigate(`/dashboard/technical-conditions/tu-details/${record.id}`);
              break;
          }
        }
      }),
    [navigate, patchTy]
  );

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    next.set('page_size', String(newPageSize ?? pageSize));
    setSearchParams(next, { replace: false });
  };

  return (
    <DashboardLayout title={t('routers.technicalSpecificatio')}>
      <div className='technical-conditions-page'>
        <TUFilterBar
          initialValues={{
            search: search || undefined,
            ordering: filterOrdering,
            payment_ordering,
            status: status,
            stage: stage,
            date,
            has_invoice,
            overdue,
            due_in_days,
            type_ty,
            id,
            address,
            payment_amount,
            tu_with_loads
          }}
          onFilterChange={handleFilterChange}
          onAddClick={handleAddClick}
          onDownloadClick={handleDownloadClick}
          presets={presetsData?.results}
          presetsLoading={presetsLoading}
          onApplyPreset={applyPreset}
          onRequestSavePreset={handleRequestSavePreset}
        />
        <Modal
          open={saveModalOpen}
          title={t('technicalConditions.presets.saveTitle', 'Сохранить шаблон')}
          onOk={handleSavePresetOk}
          onCancel={() => setSaveModalOpen(false)}
          confirmLoading={creatingPreset}
          destroyOnClose
        >
          <Form form={saveForm} layout='vertical'>
            <Form.Item
              name='name'
              label={t('technicalConditions.presets.name', 'Название')}
              rules={[{ required: true, message: t('technicalConditions.presets.nameReq', 'Введите название') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name='description' label={t('technicalConditions.presets.description', 'Описание')}>
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
        <Table
          tableLayout='fixed'
          pagination={false}
          loading={isLoading}
          columns={columns}
          dataSource={tableData}
          rowKey='id'
          bordered
          scroll={{ x: 'max-content' }}
        />
        <Pagination total={tuData?.count || 0} current={page} pageSize={pageSize} onChange={handlePageChange} />
      </div>
    </DashboardLayout>
  );
};
