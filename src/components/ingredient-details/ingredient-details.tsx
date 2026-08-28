import { FC, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';

export const IngredientDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: ingredients, loading } = useSelector((state) => state.ingredients);
  
  const ingredientData = ingredients.find((item) => item._id === id);

  if (loading) {
    return <Preloader />;
  }

  if (!ingredientData) {
    return <div className="text text_type_main-medium pt-10">Ингредиент не найден</div>;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};