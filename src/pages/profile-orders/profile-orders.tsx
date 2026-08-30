import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchProfileOrders } from '../../services/slices/profileOrdersSlice';
import { logoutUser } from '../../services/slices/userSlice';
import { useNavigate } from 'react-router-dom';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, isLoading } = useSelector((state) => state.profileOrders);

  useEffect(() => {
    dispatch(fetchProfileOrders());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        navigate('/login');
      })
      .catch((err) => {
        console.error('Ошибка выхода:', err);
      });
  };

  if (isLoading) {
    return (
      <div className='text text_type_main-medium'>Загрузка заказов...</div>
    );
  }

  return <ProfileOrdersUI orders={orders} handleLogout={handleLogout} />;
};
