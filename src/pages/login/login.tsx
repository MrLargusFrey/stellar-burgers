import { FC, SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginUI } from '@ui-pages';
import { useDispatch } from '../../services/store';
import { loginUser } from '../../services/slices/userSlice';

export const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const dispatch = useDispatch();

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
      })
      .catch((err) => {
        setError(err.message || 'Ошибка входа');
      });
  };

  return (
    <LoginUI
      errorText={error}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};