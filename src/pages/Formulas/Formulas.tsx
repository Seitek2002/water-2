import React, { FC, useState } from 'react';
import { Button, Col, Empty, Input, message, Row, Space, Spin, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { FormulaCard } from 'components/FormulaCard/FormulaCard';
import { FormulaEditData, FormulaEditForm } from 'components/FormulaEditForm/FormulaEditForm';
import { FormulaForm, FormulaFormData } from 'components/FormulaForm/FormulaForm';
import { FormulaItem, IGetFormulasParams } from 'types/entities';

import { useCreateFormulaMutation, useDeleteFormulaMutation, useGetAllFormulasQuery, usePatchFormulaMutation } from 'api/Formula.api';
import { t } from 'i18next';

const { Title } = Typography;

interface FormulasProps {
  title: string;
}

interface ApiError {
  data?: Record<string, string | string[]>;
  message?: string;
}

export const Formulas: FC<FormulasProps> = ({ title }) => {
  const [searchValue, setSearchValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingFormula, setEditingFormula] = useState<FormulaItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const queryParams: IGetFormulasParams = {
    page: 1,
    page_size: 50,
    search: searchValue || undefined,
    ordering: '-created_at'
  };

  const { data: formulasResponse, isLoading, error } = useGetAllFormulasQuery(queryParams);
  const [createFormula, { isLoading: isCreating }] = useCreateFormulaMutation();
  const [patchFormula] = usePatchFormulaMutation();
  const [deleteFormula] = useDeleteFormulaMutation();

  const formulas = formulasResponse?.results || [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(e.target.value);
  };

  const handleAddNew = (): void => {
    setShowAddForm(true);
  };

  const handleCreateFormula = async (formData: FormulaFormData): Promise<void> => {
    try {
      await createFormula({
        title: formData.title,
        koefficent: formData.koefficent
      }).unwrap();

      message.success(t('formulas.messages.created'));
      setShowAddForm(false);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError?.data && typeof apiError.data === 'object') {
        const messages = Object.entries(apiError.data)
          .map(([field, msg]) => {
            const errorMsg = Array.isArray(msg) ? msg.join(', ') : msg;
            return `${field}: ${errorMsg}`;
          })
          .join('; ');
        message.error(`${t('common.errorPrefix')}${messages}`);
      } else {
        message.error(t('formulas.messages.createError'));
      }
      console.error('Create formula error:', error);
    }
  };

  const handleCancelCreate = (): void => {
    setShowAddForm(false);
  };

  const handleEditFormula = (formula: FormulaItem): void => {
    setEditingFormula(formula);
    setShowEditForm(true);
  };

  const handleUpdateFormula = async (formData: FormulaEditData): Promise<void> => {
    if (!editingFormula) return;

    try {
      setUpdatingId(editingFormula.id);

      await patchFormula({
        id: editingFormula.id,
        body: {
          title: formData.title,
          koefficent: formData.koefficent
        }
      }).unwrap();

      message.success(t('formulas.messages.updated'));
      setShowEditForm(false);
      setEditingFormula(null);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError?.data && typeof apiError.data === 'object') {
        const messages = Object.entries(apiError.data)
          .map(([field, msg]) => {
            const errorMsg = Array.isArray(msg) ? msg.join(', ') : msg;
            return `${field}: ${errorMsg}`;
          })
          .join('; ');
        message.error(`${t('common.errorPrefix')}${messages}`);
      } else {
        message.error(t('formulas.messages.updateError'));
      }
      console.error('Update formula error:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelEdit = (): void => {
    setShowEditForm(false);
    setEditingFormula(null);
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      setDeletingId(id);

      await deleteFormula(id).unwrap();

      message.success(t('formulas.messages.deleted'));
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError?.data && typeof apiError.data === 'object') {
        const messages = Object.entries(apiError.data)
          .map(([field, msg]) => {
            const errorMsg = Array.isArray(msg) ? msg.join(', ') : msg;
            return `${field}: ${errorMsg}`;
          })
          .join('; ');
        message.error(`${t('common.errorPrefix')}${messages}`);
      } else {
        message.error(t('formulas.messages.deleteError'));
      }
      console.error('Delete formula error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    message.error(t('formulas.messages.loadError'));
  }

  return (
    <DashboardLayout title={t(title)}>
      <Space direction='vertical' size={24} style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}
        >
          <Title
            level={2}
            style={{
              margin: 0,
              color: '#1d1d1f',
              fontSize: 28,
              fontWeight: 700
            }}
          >
            {t(title)}
          </Title>

          <Space size={16}>
            <Input
              placeholder={t('formulas.searchPlaceholder')}
              value={searchValue}
              onChange={handleSearchChange}
              prefix={<SearchOutlined style={{ color: '#8e8e93' }} />}
              style={{
                width: 300,
                borderRadius: 12,
                backgroundColor: '#f5f5f7',
                border: 'none'
              }}
              size='large'
            />

            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              size='large'
              style={{
                borderRadius: 12,
                backgroundColor: '#007aff',
                borderColor: '#007aff',
                fontWeight: 500
              }}
            >
              {t('formulas.add')}
            </Button>
          </Space>
        </div>

        {!isLoading && formulasResponse && (
          <div>
            <Typography.Text
              style={{
                fontSize: 16,
                color: '#8e8e93',
                fontWeight: 500
              }}
            >
              {t('formulas.foundCount', { count: formulasResponse.count })}
            </Typography.Text>
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size='large' />
            <div style={{ marginTop: 16 }}>
              <Typography.Text style={{ color: '#8e8e93' }}>{t('formulas.loading')}</Typography.Text>
            </div>
          </div>
        ) : formulas.length > 0 ? (
          <Row gutter={[24, 24]}>
            {formulas.map((formula) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={4} key={formula.id}>
                <FormulaCard formula={formula} onEdit={handleEditFormula} onDelete={handleDelete} isDeleting={deletingId === formula.id} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description={
              <div>
                <Typography.Text style={{ color: '#8e8e93', fontSize: 16 }}>
                  {searchValue ? t('formulas.nothingFound') : t('formulas.notFound')}
                </Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <Typography.Text style={{ color: '#8e8e93', fontSize: 14 }}>
                    {searchValue ? t('formulas.changeSearch') : t('formulas.startCreate')}
                  </Typography.Text>
                </div>
              </div>
            }
            style={{
              marginTop: '100px',
              padding: '50px 0'
            }}
          />
        )}
      </Space>

      <FormulaForm visible={showAddForm} loading={isCreating} onSubmit={handleCreateFormula} onCancel={handleCancelCreate} />

      <FormulaEditForm
        visible={showEditForm}
        formula={editingFormula || undefined}
        loading={updatingId === editingFormula?.id}
        onSubmit={handleUpdateFormula}
        onCancel={handleCancelEdit}
      />
    </DashboardLayout>
  );
};
