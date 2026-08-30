import { test, expect } from '@playwright/test';

test.describe('Тестирование конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('./tests/hars/api.har', {
      url: '**/api/**',
      update: false
    });

    await page.goto('http://localhost:4000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('li', { hasText: 'Краторная булка N-200i' }, { timeout: 10000 });
  });

  test('Должен добавить ингредиент в конструктор', async ({ page }) => {
    const ingredient = page.locator('li', { hasText: 'Сыр с астероидной плесенью' });
    const addButton = ingredient.locator('button', { hasText: 'Добавить' });
    await addButton.click();

    const constructorIngredient = page.locator('.constructor-element', { hasText: 'Сыр с астероидной плесенью' });
    await expect(constructorIngredient).toBeVisible();
  });

  test('Должен открыть модальное окно с информацией об ингредиенте', async ({ page }) => {
    const ingredientLink = page.locator('a[href*="643d69a5c3f7b9001cfa093c"]');
    await ingredientLink.click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Краторная булка N-200i');
  });

  test('Должен закрыть модальное окно по клику на крестик', async ({ page }) => {
    const ingredientLink = page.locator('a[href*="643d69a5c3f7b9001cfa093c"]');
    await ingredientLink.click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    const closeButton = page.getByTestId('modal-close');
    await closeButton.click();

    await expect(modal).toBeHidden();
  });

  test('Должен создать заказ', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      document.cookie = 'accessToken=mock-access-token; path=/';
    });

    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { email: 'test@test.com', name: 'Test User' }
        })
      });
    });

    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          order: {
            number: 12345,
            _id: 'test-order-id',
            status: 'done',
            name: 'Test Burger',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ingredients: []
          }
        })
      });
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const bun = page.locator('li', { hasText: 'Краторная булка N-200i' });
    await bun.locator('button', { hasText: 'Добавить' }).click();

    const ingredient = page.locator('li', { hasText: 'Сыр с астероидной плесенью' });
    await ingredient.locator('button', { hasText: 'Добавить' }).click();

    const orderButton = page.locator('button', { hasText: 'Оформить заказ' });
    await expect(orderButton).toBeEnabled();
    await orderButton.click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await expect(modal).toContainText('12345');

    const closeButton = page.getByTestId('modal-close');
    await closeButton.click();
    await expect(modal).toBeHidden({ timeout: 5000 });

    const emptyConstructor = page.locator('.text', { hasText: 'Выберите булки' }).first();
    await expect(emptyConstructor).toBeVisible({ timeout: 5000 });
  });
});