import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { ProfileMenuUI } from '@ui';

type ProfileMenuProps = {
  handleLogout: () => void;
};

export const ProfileMenu: FC<ProfileMenuProps> = ({ handleLogout }) => {
  const { pathname } = useLocation();
  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};