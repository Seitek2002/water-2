import { Component, ErrorInfo, FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Card, Col, message, Row, Space, Typography } from 'antd';
import { ClearOutlined, EnvironmentOutlined, SaveOutlined } from '@ant-design/icons';
import type { MapEvent, YMap, YPlacemark } from 'types/entities/yandexMaps';

const { Title, Text } = Typography;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  alertTitle?: string;
  alertDescription?: string;
  tryAgainText?: string;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MapErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          message={this.props.alertTitle}
          description={this.props.alertDescription}
          type='error'
          showIcon
          action={
            <Button size='small' onClick={this.handleReset}>
              {this.props.tryAgainText}
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}

interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  timestamp?: string;
}

interface MapPointSelectorProps {
  title?: string;
  onCoordinatesSelect?: (coordinates: Coordinates) => void;
  onSaveToBackend?: (coordinates: Coordinates) => Promise<void>;
}

const BISHKEK_CENTER: [number, number] = [42.8746, 74.5698];

// Добавим enum для более четкого управления состояниями
enum MapLoadingState {
  INITIAL = 'initial',
  LOADING_SCRIPT = 'loading_script',
  SCRIPT_LOADED = 'script_loaded',
  INITIALIZING_MAP = 'initializing_map',
  MAP_READY = 'map_ready',
  ERROR = 'error'
}

const MapPointSelectorCore: FC<MapPointSelectorProps> = ({ title, onCoordinatesSelect, onSaveToBackend }) => {
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [loadingState, setLoadingState] = useState<MapLoadingState>(MapLoadingState.INITIAL);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();
  const computedTitle = title ?? t('mapPointSelector.title');

  const mapRef = useRef<YMap | null>(null);
  const placemarkRef = useRef<YPlacemark | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const initializationAttempted = useRef(false);

  // Создание/обновление метки на карте
  const updatePlacemark = useCallback(
    (coords: number[], address?: string) => {
      if (!mapRef.current || !window.ymaps) return;

      const map = mapRef.current;
      const ymaps = window.ymaps;

      try {
        // Удаляем существующую метку
        if (placemarkRef.current) {
          map.geoObjects.remove(placemarkRef.current);
          placemarkRef.current = null;
        }

        // Создаем новую метку
        const placemark = new ymaps.Placemark(
          coords,
          {
            balloonContent: address
              ? `${address}<br>${t('common.coordinates')}: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
              : `${t('common.coordinates')}: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
            hintContent: t('mapPointSelector.hint.dragToMove')
          },
          {
            preset: 'islands#redDotIcon',
            draggable: true
          }
        );

        // Обработчик перетаскивания
        placemark.events.add('dragend', () => {
          if (!placemarkRef.current) return;

          try {
            const newCoords = placemarkRef.current.geometry.getCoordinates();
            const newCoordinates: Coordinates = {
              latitude: parseFloat(newCoords[0].toFixed(6)),
              longitude: parseFloat(newCoords[1].toFixed(6))
            };

            setSelectedCoordinates(newCoordinates);
            onCoordinatesSelect?.(newCoordinates);
            getAddressByCoords(newCoords);
          } catch (error) {
            console.warn('Ошибка при перетаскивании:', error);
          }
        });

        map.geoObjects.add(placemark);
        placemarkRef.current = placemark;
      } catch (error) {
        console.error('Ошибка создания метки:', error);
      }
    },
    [onCoordinatesSelect]
  );

  const getAddressByCoords = useCallback(async (coords: number[]) => {
    if (!window.ymaps) return;

    try {
      const result = await window.ymaps.geocode(coords);
      const firstGeoObject = result.geoObjects.get(0);
      const address = firstGeoObject?.getAddressLine?.();

      if (address) {
        setSelectedCoordinates((prev) => (prev ? { ...prev, address } : null));

        if (placemarkRef.current) {
          placemarkRef.current.properties.set(
            'balloonContent',
            `${address}<br>${t('common.coordinates')}: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
          );
        }
      }
    } catch (error) {
      console.warn('Ошибка геокодирования:', error);
    }
  }, []);

  // Инициализация карты
  const initializeMap = useCallback(() => {
    if (!window.ymaps || !mapContainerRef.current || initializationAttempted.current) {
      return;
    }

    console.log('Начинаем инициализацию карты...');
    setLoadingState(MapLoadingState.INITIALIZING_MAP);
    initializationAttempted.current = true;

    window.ymaps.ready(() => {
      if (!mapContainerRef.current || !window.ymaps || mapRef.current) {
        return;
      }

      try {
        console.log('Создание экземпляра карты...');
        const map = new window.ymaps.Map(mapContainerRef.current, {
          center: BISHKEK_CENTER,
          zoom: 11,
          controls: ['zoomControl', 'fullscreenControl']
        });

        // Обработчик клика по карте
        map.events.add('click', (e: MapEvent) => {
          try {
            const coords = e.get('coords');
            const newCoordinates: Coordinates = {
              latitude: parseFloat(coords[0].toFixed(6)),
              longitude: parseFloat(coords[1].toFixed(6))
            };

            setSelectedCoordinates(newCoordinates);
            onCoordinatesSelect?.(newCoordinates);
            updatePlacemark(coords);
            getAddressByCoords(coords);
          } catch (error) {
            console.error('Ошибка обработки клика:', error);
          }
        });

        mapRef.current = map;
        setLoadingState(MapLoadingState.MAP_READY);
        console.log('Карта успешно инициализирована');
      } catch (error) {
        console.error('Ошибка инициализации карты:', error);
        setLoadingState(MapLoadingState.ERROR);
        message.error(t('mapPointSelector.errors.initMap'));
      }
    });
  }, [onCoordinatesSelect, updatePlacemark, getAddressByCoords]);

  useEffect(() => {
    if (loadingState === MapLoadingState.MAP_READY) return;

    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');

    if (window.ymaps) {
      console.log('Yandex Maps API уже доступен');
      setLoadingState(MapLoadingState.SCRIPT_LOADED);
      initializeMap();
    } else if (!existingScript && loadingState === MapLoadingState.INITIAL) {
      console.log('Загружаем скрипт Yandex Maps...');
      setLoadingState(MapLoadingState.LOADING_SCRIPT);

      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=0bfec104-5c26-4035-8b22-4c4d55448777';

      script.onload = () => {
        console.log('Скрипт Yandex Maps загружен');
        setLoadingState(MapLoadingState.SCRIPT_LOADED);
        setTimeout(() => {
          initializeMap();
        }, 100);
      };

      script.onerror = (error) => {
        console.error('Ошибка загрузки скрипта Yandex Maps:', error);
        setLoadingState(MapLoadingState.ERROR);
        message.error(t('mapPointSelector.errors.loadMap'));
      };

      document.head.appendChild(script);
    } else if (existingScript && loadingState === MapLoadingState.INITIAL) {
      setLoadingState(MapLoadingState.LOADING_SCRIPT);

      const checkInterval = setInterval(() => {
        if (window.ymaps) {
          clearInterval(checkInterval);
          setLoadingState(MapLoadingState.SCRIPT_LOADED);
          initializeMap();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.ymaps || !mapRef.current) {
          setLoadingState(MapLoadingState.ERROR);
          message.error(t('mapPointSelector.messages.timeout'));
        }
      }, 10000);
    }
  }, [loadingState, initializeMap]);

  const handleSavePoint = async () => {
    if (!selectedCoordinates) {
      message.warning(t('mapPointSelector.messages.selectPointFirst'));
      return;
    }

    const pointData: Coordinates = {
      ...selectedCoordinates,
      description: description.trim() || undefined,
      timestamp: new Date().toISOString()
    };

    setIsSaving(true);

    try {
      if (onSaveToBackend) {
        await onSaveToBackend(pointData);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Готово для отправки:', pointData);
      }

      onCoordinatesSelect?.(pointData);
      message.success(t('mapPointSelector.messages.saved'));
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      message.error(t('mapPointSelector.messages.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedCoordinates(null);
    setDescription('');

    if (mapRef.current && placemarkRef.current) {
      try {
        mapRef.current.geoObjects.remove(placemarkRef.current);
        placemarkRef.current = null;
      } catch (error) {
        console.warn('Ошибка удаления метки:', error);
      }
    }

    message.info(t('mapPointSelector.messages.cleared'));
  };

  // Определяем текст загрузки и состояние
  const getLoadingText = () => {
    switch (loadingState) {
      case MapLoadingState.INITIAL:
        return t('mapPointSelector.loading.preparing');
      case MapLoadingState.LOADING_SCRIPT:
        return t('mapPointSelector.loading.loadingMap');
      case MapLoadingState.SCRIPT_LOADED:
        return t('mapPointSelector.loading.scriptLoaded');
      case MapLoadingState.INITIALIZING_MAP:
        return t('mapPointSelector.loading.initializingMap');
      case MapLoadingState.MAP_READY:
        return null;
      case MapLoadingState.ERROR:
        return t('mapPointSelector.loading.loadError');
      default:
        return t('mapPointSelector.loading.loading');
    }
  };

  const isLoading = loadingState !== MapLoadingState.MAP_READY;
  const isError = loadingState === MapLoadingState.ERROR;
  const loadingText = getLoadingText();

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ marginBottom: '20px' }}>
        <EnvironmentOutlined style={{ marginRight: '8px' }} />
        {computedTitle}
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={t('mapPointSelector.card.clickToSelect')} style={{ height: '500px' }} loading={false}>
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '420px',
                backgroundColor: '#f5f5f5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isError && (
                <div style={{ textAlign: 'center' }}>
                  <Text type='danger'>{t('mapPointSelector.errors.loadMapTitle')}</Text>
                  <br />
                  <Button type='link' onClick={() => window.location.reload()} style={{ marginTop: '8px' }}>
                    {t('mapPointSelector.actions.reloadPage')}
                  </Button>
                </div>
              )}
              {!isLoading && !isError && loadingState === MapLoadingState.MAP_READY && null}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={t('mapPointSelector.card.selectedCoordinates')}>
            <Space direction='vertical' style={{ width: '100%' }} size='middle'>
              {selectedCoordinates ? (
                <>
                  <div>
                    <Text strong>{t('common.latitude')}:</Text>
                    <br />
                    <Text code>{selectedCoordinates.latitude}</Text>
                  </div>
                  <div>
                    <Text strong>{t('common.longitude')}:</Text>
                    <br />
                    <Text code>{selectedCoordinates.longitude}</Text>
                  </div>
                  {selectedCoordinates.address && (
                    <div>
                      <Text strong>{t('mapPointSelector.labels.address')}:</Text>
                      <br />
                      <Text>{selectedCoordinates.address}</Text>
                    </div>
                  )}
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button type='primary' icon={<SaveOutlined />} onClick={handleSavePoint} loading={isSaving}>
                      {t('common.save')}
                    </Button>
                    <Button danger icon={<ClearOutlined />} onClick={handleClearSelection} disabled={isSaving}>
                      {t('mapPointSelector.actions.clear')}
                    </Button>
                  </Space>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <EnvironmentOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <div style={{ marginTop: '16px' }}>
                    <Text type='secondary'>{isLoading ? loadingText : t('mapPointSelector.card.clickToSelect')}</Text>
                  </div>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export const MapPointSelector: FC<MapPointSelectorProps> = (props) => {
  const { t } = useTranslation();
  return (
    <MapErrorBoundary
      alertTitle={t('mapPointSelector.errors.loadMapTitle')}
      alertDescription={t('mapPointSelector.errors.loadMap')}
      tryAgainText={t('mapPointSelector.actions.tryAgain')}
    >
      <MapPointSelectorCore {...props} />
    </MapErrorBoundary>
  );
};

export default MapPointSelector;
