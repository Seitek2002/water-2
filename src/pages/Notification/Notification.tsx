import { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Alert, Avatar, Button, Flex, List, Spin, Typography } from 'antd';
// import { DeleteOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { FilterBar } from 'components/FilterBar';
import type { INotification } from 'types/entities';
import archiverIcon from 'assets/icons/archive.svg';
import documentIcon from 'assets/icons/document.svg';
import './styles.scss';

import { useGetNotificationsQuery, useMarkAsReadMutation } from 'api/Notifications.api';
import { differenceInDays, isToday, isYesterday, parseISO } from 'date-fns';

interface IProps {
  title: string;
}

type SectionKey = 'today' | 'yesterday' | 'lastMonth' | 'earlier';

const getSectionKey = (isoDate: string): SectionKey => {
  const d = parseISO(isoDate);
  if (isToday(d)) return 'today';
  if (isYesterday(d)) return 'yesterday';
  const diff = differenceInDays(new Date(), d);
  if (diff < 30) return 'lastMonth';
  return 'earlier';
};

const getIconByType = (type: string) => {
  switch (type) {
    case 'tu_created':
      return archiverIcon;
    case 'application_created':
      return documentIcon;
    default:
      return documentIcon;
  }
};

export const Notification: FC<IProps> = ({ title }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState<string>('-created_at');
  const [optimisticRead, setOptimisticRead] = useState<Set<number>>(new Set());

  const { data, isLoading, isError, error, refetch } = useGetNotificationsQuery({ ordering });
  const [markAsRead] = useMarkAsReadMutation();

  const errorMsg = useMemo(() => {
    if (!isError || !error) return '';
    if ('status' in error) {
      const e = error as FetchBaseQueryError;
      if (typeof e.data === 'string') return e.data;
      try {
        return JSON.stringify(e.data);
      } catch {
        return 'Request error';
      }
    }
    const e = error as SerializedError;
    return e.message || 'Request error';
  }, [isError, error]);

  const sections = useMemo(() => {
    const results = data?.results ?? [];
    const grouped: Record<SectionKey, INotification[]> = {
      today: [],
      yesterday: [],
      lastMonth: [],
      earlier: []
    };
    for (const n of results) {
      const key = getSectionKey(n.created_at);
      grouped[key].push(n);
    }
    const order: SectionKey[] = ['today', 'yesterday', 'lastMonth', 'earlier'];
    return order.map((key) => ({ date: key, items: grouped[key] })).filter((section) => section.items.length > 0);
  }, [data]);

  // const handleDelete = () => {
  //   // TODO: очистка/удаление уведомлений через API, если появится эндпоинт
  //   console.log('delete');
  // };

  const handleOpen = (n: INotification) => {
    if (n.technical_condition_id) {
      navigate(`/dashboard/technical-conditions/tu-details/${n.technical_condition_id}`);
      return;
    }
    if (n.application_id) {
      navigate(`/dashboard/applications/${n.application_id}`);
      return;
    }
  };

  const handleMarkOne = async (id: number) => {
    // Оптимистично скрываем кнопку "Прочитано" сразу
    setOptimisticRead((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    try {
      await markAsRead(id).unwrap();
      console.log('[REST] markAsRead: success for id', id);
    } catch (e) {
      console.log('[REST] markAsRead: failed', id, e);
      // Откат при ошибке
      setOptimisticRead((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    refetch();
  };

  return (
    <DashboardLayout title={t(title)}>
      <div className='notification'>
        <FilterBar
          onFilterChange={(value) => console.log(value)}
          showSearch={false}
          actionButtons={
            <>
              <Button type={ordering === 'created_at' ? 'primary' : 'default'} onClick={() => setOrdering('created_at')}>
                {t('notification.active')}
              </Button>
              <Button type={ordering === '-created_at' ? 'primary' : 'default'} onClick={() => setOrdering('-created_at')}>
                {t('notification.new')}
              </Button>
              {/* <Button danger icon={<DeleteOutlined />} onClick={handleDelete} /> */}
            </>
          }
        />

        {isLoading && (
          <Flex justify='center' style={{ padding: 24 }}>
            <Spin />
          </Flex>
        )}

        {isError && (
          <Alert type='error' message={t('common.error') || 'Ошибка'} description={errorMsg} showIcon style={{ marginTop: 12 }} />
        )}

        {!isLoading &&
          !isError &&
          sections.map((section) => (
            <div key={section.date}>
              <Typography.Title level={5} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: 4 }}>
                {t(`notification.date.${section.date}`)}
              </Typography.Title>
              <List
                itemLayout='vertical'
                dataSource={section.items}
                locale={{ emptyText: t('common.noData') || 'Нет данных' }}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <Flex>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            shape='circle'
                            size={36}
                            style={{ backgroundColor: '#2F80ED', flex: '0 0 auto' }}
                            icon={
                              <img
                                src={getIconByType(item.type)}
                                alt='icon'
                                style={{ width: 22, height: 22, objectFit: 'contain', display: 'block' }}
                              />
                            }
                          />
                        }
                        title={<strong>{item.title}</strong>}
                        description={item.message}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                        <Flex gap={12} style={{ marginTop: 8 }}>
                          {/* <Button onClick={() => console.log('assign responsible', item.id)}>{t('notification.assignResponsible')}</Button> */}
                          <Button type='primary' onClick={() => handleOpen(item)}>
                            {t('notification.open')}
                          </Button>
                        </Flex>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                          <span style={{ color: '#8C8C8C', fontSize: 12 }}>{new Date(item.created_at).toLocaleString('ru-RU')}</span>
                          {!(item.is_read || optimisticRead.has(item.id)) && (
                            <Button
                              type='link'
                              style={{ padding: 0, height: 'auto', color: '#2F80ED', textDecoration: 'underline' }}
                              onClick={() => handleMarkOne(item.id)}
                            >
                              {t('notification.read')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Flex>
                  </List.Item>
                )}
              />
            </div>
          ))}

        {!isLoading && !isError && sections.length === 0 && (
          <Typography.Text style={{ color: '#8C8C8C' }}>{t('common.noData') || 'Нет данных'}</Typography.Text>
        )}
      </div>
    </DashboardLayout>
  );
};
