import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Avatar, Badge, Button, Divider, Flex, List, Popover, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import type { INotification } from 'types/entities';
import archiverIcon from 'assets/icons/archive.svg';
import documentIcon from 'assets/icons/document.svg';
import './styles.scss';

import { useMarkAllAsReadMutation, useMarkAsReadMutation } from 'api/Notifications.api';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNotificationsWS } from 'hooks/useNotificationsWS';

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

export const NotificationsBell = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  // Локальное состояние уведомлений для поповера, управляемое событиями WebSocket
  const [wsItems, setWsItems] = useState<INotification[]>([]);

  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const ws = useNotificationsWS({
    enabled: true,
    onNotification: (n) => {
      // Вставляем/обновляем пришедшее уведомление в локальном состоянии поповера
      setWsItems((prev) => {
        const map = new Map<number, INotification>(prev.map((x) => [x.id, x]));
        map.set(n.id, n);
        return Array.from(map.values());
      });
    },
    onUnreadList: (list) => {
      // Список непрочитанных: мержим каждое уведомление
      setWsItems((prev) => {
        const map = new Map<number, INotification>(prev.map((x) => [x.id, x]));
        for (const n of list) {
          map.set(n.id, n);
        }
        return Array.from(map.values());
      });
    }
  });

  // Запрашиваем начальные данные у WS (если сервер поддерживает такой экшен)
  useEffect(() => {
    if (ws.connected && wsItems.length === 0) {
      try {
        ws.send({ action: 'get_unread' });
      } catch {
        // ignore
      }
    }
  }, [ws.connected, wsItems.length]);

  const unreadCount = useMemo(() => wsItems.filter((n) => !n.is_read).length, [wsItems]);

  const itemsToShow = useMemo(() => {
    // показываем до 5 последних из локального WS-списка
    return [...wsItems].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 5);
  }, [wsItems]);

  const handleMarkAll = async () => {
    console.log('[UI] Mark all as read clicked');
    // Оптимистично обновляем локальный список поповера
    setWsItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    // WS-экшен (если сервер слушает — синхронизируется быстрее)
    ws.sendMarkAllAsRead();
    // Обязательный REST-запрос
    try {
      await markAllAsRead().unwrap();
      console.log('[REST] markAllAsRead: success');
    } catch (e) {
      console.log('[REST] markAllAsRead: failed', e);
    }
  };

  const handleMarkOne = async (id: number) => {
    // Оптимистично обновляем локальное состояние поповера
    setWsItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    // Try WS (если сервер слушает WS-экшены — сработает быстрее)
    try {
      ws.sendMarkAsRead?.(id);
    } catch {
      // ignore
    }
    // Обязательный REST-запрос
    try {
      await markAsRead(id).unwrap();
      console.log('[REST] markAsRead: success for id', id);
    } catch (e) {
      console.log('[REST] markAsRead: failed', id, e);
      // В случае ошибки можно откатить локальный optimistic-апдейт (опционально)
      setWsItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
    }
  };

  const content = (
    <div className='notif-popover'>
      <Flex align='center' justify='space-between' className='notif-popover__header'>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('routers.notifications')}
        </Typography.Title>
        <Button type='link' onClick={handleMarkAll} loading={isMarkingAll}>
          {t('notification.markAllAsRead')}
        </Button>
      </Flex>

      <>
        <List
          itemLayout='horizontal'
          dataSource={itemsToShow}
          locale={{ emptyText: t('common.noData') }}
          renderItem={(item) => (
            <List.Item className='notif-popover__item'>
              <Flex align='start' justify='space-between' style={{ width: '100%' }}>
                <Flex gap={12}>
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
                  <div>
                    <Typography.Text strong className='notif-popover__title'>
                      {item.title}
                    </Typography.Text>
                    <div className='notif-popover__message'>{item.message}</div>
                    <div className='notif-popover__time'>
                      {formatDistanceToNow(parseISO(item.created_at), { addSuffix: true, locale: ru })}
                    </div>
                    {!item.is_read && (
                      <Button
                        type='link'
                        style={{ padding: 0, height: 'auto', color: '#2F80ED', textDecoration: 'underline' }}
                        onClick={() => handleMarkOne(item.id)}
                      >
                        {t('notification.read')}
                      </Button>
                    )}
                  </div>
                </Flex>
                {!item.is_read && <span className='notif-popover__dot' />}
              </Flex>
            </List.Item>
          )}
        />

        <Divider style={{ margin: '8px 0 12px' }} />
        <div style={{ textAlign: 'center' }}>
          <Button
            type='link'
            onClick={() => {
              setOpen(false);
              navigate('/dashboard/notifications');
            }}
          >
            {t('notification.seeAll')}
          </Button>
        </div>
      </>
    </div>
  );

  return (
    <Popover
      placement='bottomRight'
      trigger='click'
      open={open}
      onOpenChange={setOpen}
      overlayClassName='notif-popover__overlay'
      content={content}
    >
      <Badge dot={unreadCount > 0}>
        <Button icon={<BellOutlined />} />
      </Badge>
    </Popover>
  );
};
