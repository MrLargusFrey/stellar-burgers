import React, { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './app-header.module.css';
import { TAppHeaderUIProps } from './type';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';

export const AppHeaderUI: FC<TAppHeaderUIProps> = ({ userName }) => {
  const location = useLocation();

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          <Link to='/' className={styles.link}>
            <BurgerIcon type={location.pathname === '/' ? 'primary' : 'secondary'} />
            <p className={`text text_type_main-default ml-2 mr-10 ${location.pathname === '/' ? styles.active : ''}`}>
              Конструктор
            </p>
          </Link>
          <Link to='/feed' className={styles.link}>
            <ListIcon type={location.pathname === '/feed' ? 'primary' : 'secondary'} />
            <p className={`text text_type_main-default ml-2 ${location.pathname === '/feed' ? styles.active : ''}`}>
              Лента заказов
            </p>
          </Link>
        </div>
        <div className={styles.logo}>
          <Link to='/' className={styles.link}>
            <Logo className='' />
          </Link>
        </div>
        <div className={styles.link_position_last}>
          <Link to={userName ? '/profile' : '/login'} className={styles.link}>
            <ProfileIcon type={location.pathname === '/profile' ? 'primary' : 'secondary'} />
            <p className={`text text_type_main-default ml-2 ${location.pathname === '/profile' ? styles.active : ''}`}>
              {userName || 'Личный кабинет'}
            </p>
          </Link>
        </div>
      </nav>
    </header>
  );
};