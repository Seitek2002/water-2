import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router';
import { createRoot, Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { unstableSetRender } from 'antd';
import { ConfigProvider } from 'antd';
import ruRu from 'antd/es/locale/ru_RU';
import App from './App';
import '@ant-design/v5-patch-for-react-19'; // Патч для совместимости с React 19
import './i18n';
import 'antd/dist/reset.css';
import './styles/styles.scss';

import store from 'store/index';

declare global {
  interface Element {
    _reactRoot?: Root;
  }
}

unstableSetRender((node, container) => {
  (container as Element)._reactRoot ||= createRoot(container);
  const root = (container as Element)._reactRoot;

  root!.render(node);

  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    root!.unmount();
  };
});

const mainContainer = document.getElementById('root');
if (!mainContainer) {
  throw new Error('Элемент #root не найден в DOM');
}

const mainRoot = createRoot(mainContainer);
mainRoot.render(
  <StrictMode>
    <ConfigProvider locale={ruRu}>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  </StrictMode>
);
