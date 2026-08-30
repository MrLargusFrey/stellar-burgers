import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  initialState
} from '../constructorSlice';
import { TConstructorIngredient } from '@utils-types';

const mockBun: TConstructorIngredient = {
  _id: '1',
  name: 'Булка',
  type: 'bun',
  proteins: 10,
  fat: 5,
  carbohydrates: 30,
  calories: 200,
  price: 100,
  image: 'image.jpg',
  image_large: 'image-large.jpg',
  image_mobile: 'image-mobile.jpg',
  id: 'test-bun-id'
};

const mockIngredient: TConstructorIngredient = {
  _id: '2',
  name: 'Начинка',
  type: 'main',
  proteins: 20,
  fat: 10,
  carbohydrates: 15,
  calories: 150,
  price: 50,
  image: 'image.jpg',
  image_large: 'image-large.jpg',
  image_mobile: 'image-mobile.jpg',
  id: 'test-ingredient-id'
};

describe('Тестирование constructorSlice', () => {
  test('Должен вернуть начальное состояние при неизвестном экшене', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  test('Должен добавить булку в конструктор', () => {
    const state = constructorReducer(initialState, addIngredient(mockBun));
    expect(state.bun).toEqual(mockBun);
    expect(state.ingredients).toHaveLength(0);
  });

  test('Должен добавить ингредиент в конструктор', () => {
    const state = constructorReducer(
      initialState,
      addIngredient(mockIngredient)
    );
    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]).toEqual(mockIngredient);
  });

  test('Должен удалить ингредиент по индексу', () => {
    const stateWithIngredient = {
      ...initialState,
      ingredients: [mockIngredient]
    };
    const newState = constructorReducer(
      stateWithIngredient,
      removeIngredient(0)
    );
    expect(newState.ingredients).toHaveLength(0);
  });

  test('Должен переместить ингредиент', () => {
    const ingredient2 = { ...mockIngredient, id: 'test-ingredient-id-2' };
    const stateWithIngredients = {
      ...initialState,
      ingredients: [mockIngredient, ingredient2]
    };
    const newState = constructorReducer(
      stateWithIngredients,
      moveIngredient({ from: 0, to: 1 })
    );
    expect(newState.ingredients[0]).toEqual(ingredient2);
    expect(newState.ingredients[1]).toEqual(mockIngredient);
  });

  test('Должен очистить конструктор', () => {
    const stateWithItems = {
      bun: mockBun,
      ingredients: [mockIngredient]
    };
    const newState = constructorReducer(stateWithItems, clearConstructor());
    expect(newState).toEqual(initialState);
  });
});
