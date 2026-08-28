import { FC, useMemo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { getOrderByNumberApi } from '@api';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const [orderData, setOrderData] = useState<TOrder | null>(null);
  const [loading, setLoading] = useState(true);
  
  const ingredients = useSelector((state) => state.ingredients.data);

  useEffect(() => {
    if (number) {
      getOrderByNumberApi(Number(number))
        .then((data) => {
          setOrderData(data.orders[0]);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [number]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (loading) {
    return <Preloader />;
  }

  if (!orderInfo) {
    return <div className="text text_type_main-medium pt-10">Заказ не найден</div>;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};