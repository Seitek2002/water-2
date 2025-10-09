import { useEffect } from 'react';
import { useNavigate, useRoutes } from 'react-router';
import { notification } from 'antd';
import { checkError } from 'common/helpers';

import { useLazyGetUserInfoQuery } from 'api/Auth.api';
import { routerConfig } from 'routes/routes';

function App() {
  const navigate = useNavigate();
  const routes = useRoutes(routerConfig);
  const [getUserInfo] = useLazyGetUserInfoQuery();

  useEffect(() => {
    async function checkAccount() {
      const { error } = await getUserInfo();

      const { code = '', detail = '' } = !!error && 'status' in error ? (error?.data as { code?: string; detail?: string }) : {};

      if (checkError({ error, status: 401 }) && code && detail) {
        navigate('/');
        notification.error({
          message: 'Ошибка при входе в аккаунт',
          description: 'Пожалуйста, пройдите заново авторизацию что бы иметь доступ к платформе',
          duration: 5
        });
        localStorage.clear();
      }
    }
    checkAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div>{routes}</div>
    </>
  );
}

export default App;
