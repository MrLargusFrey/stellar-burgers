import { TOrder } from '@utils-types';

export type ProfileOrdersUIProps = {
  orders: TOrder[];
  handleLogout: () => void;
};
