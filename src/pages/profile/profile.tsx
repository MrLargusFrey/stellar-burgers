import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { getUser, updateUser, logoutUser } from '../../services/slices/userSlice';
import { useNavigate } from 'react-router-dom';

export const Profile: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const loading = useSelector((state) => state.user.loading);

  const [formValue, setFormValue] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  const [updateUserError, setUpdateUserError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!user && !loading) {
      dispatch(getUser());
    }
  }, [dispatch, user, loading]); // <- Добавлены зависимости

  useEffect(() => {
    if (user) {
      setFormValue((prevState) => ({
        ...prevState,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setUpdateUserError(undefined);
    const updatedData: { name?: string; email?: string; password?: string } = {};
    if (formValue.name !== user?.name) updatedData.name = formValue.name;
    if (formValue.email !== user?.email) updatedData.email = formValue.email;
    if (formValue.password) updatedData.password = formValue.password;
    
    dispatch(updateUser(updatedData))
      .unwrap()
      .catch((err) => {
        setUpdateUserError(err.message || 'Ошибка обновления профиля');
      });
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    setFormValue({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

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

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      updateUserError={updateUserError}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
      handleInputChange={handleInputChange}
      handleLogout={handleLogout}
    />
  );
};