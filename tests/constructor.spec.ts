import { test, expect } from '@playwright/test';

async function ensureLoggedIn(page) {
  const isLoggedIn = await page.locator('.header-user-name').isVisible().catch(() => false);
  if (isLoggedIn) {
    console.log('Уже авторизован');
    return;
  }

  console.log('🔐 Выполняем вход...');

  await page.goto('http://localhost:4000/profile');

  const email = process.env.TEST_EMAIL || 'terorf6@gmail.com';
  const password = process.env.TEST_PASSWORD || 'asdasd';

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Войти")');

  await expect(page.locator('button:has-text("Выход")')).toBeVisible({ timeout: 15000 });
  
  console.log('Вход успешен! Пользователь авторизован.');

  await page.click('a[href="/"] p:has-text("Конструктор")');

  await page.waitForSelector('li:has-text("Краторная булка N-200i")', { timeout: 10000 });
  
  console.log('Мы в конструкторе бургера!');
}

test.describe('Тестирование конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('./tests/hars/api.har', {
      url: '**/api/**',
      update: false
    });

    await page.goto('http://localhost:4000');
  });

  test('Должен добавить ингредиент в конструктор', async ({ page }) => {
    await page.waitForSelector('li:has-text("Краторная булка N-200i")', {
      timeout: 10000
    });

    const ingredient = page.locator('li', { hasText: 'Биокотлета из марсианской Магнолии' });
    const addButton = ingredient.locator('button', { hasText: 'Добавить' });
    await addButton.click();

    const constructorIngredient = page.locator('.constructor-element', {
      hasText: 'Биокотлета из марсианской Магнолии'
    });
    await expect(constructorIngredient).toBeVisible();
  });

  test('Должен открыть модальное окно с информацией об ингредиенте', async ({ page }) => {
    await page.waitForSelector('li:has-text("Краторная булка N-200i")', {
      timeout: 10000
    });

    const ingredientLink = page.locator('a[href*="643d69a5c3f7b9001cfa093c"]');
    await ingredientLink.click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Краторная булка N-200i');
  });

  test('Должен закрыть модальное окно по клику на крестик', async ({ page }) => {
    await page.waitForSelector('li:has-text("Краторная булка N-200i")', {
      timeout: 10000
    });

    const ingredientLink = page.locator('a[href*="643d69a5c3f7b9001cfa093c"]');
    await ingredientLink.click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();

    const closeButton = page.getByTestId('modal-close');
    await closeButton.click();

    await expect(modal).toBeHidden();
  });

  test('Должен создать заказ', async ({ page }) => {
    await ensureLoggedIn(page);

    await page.waitForSelector('li:has-text("Краторная булка N-200i")', { timeout: 10000 });

    console.log('Начинаем сборку бургера...');

    const bun = page.locator('li', { hasText: 'Краторная булка N-200i' });
    const addBunButton = bun.locator('button', { hasText: 'Добавить' });
    await addBunButton.click();

    const constructorBun = page.locator('.constructor-element__text', { hasText: 'Краторная булка N-200i' }).first();
    await expect(constructorBun).toBeVisible({ timeout: 5000 });
    console.log('✅ Булка добавлена в конструктор.');

    const ingredient = page.locator('li', { hasText: 'Биокотлета из марсианской Магнолии' });
    const addIngredientButton = ingredient.locator('button', { hasText: 'Добавить' });
    await addIngredientButton.click();

    const constructorIngredient = page.locator('.constructor-element', { hasText: 'Биокотлета из марсианской Магнолии' });
    await expect(constructorIngredient).toBeVisible({ timeout: 5000 });
    console.log('✅ Начинка добавлена.');

    const orderButton = page.locator('button', { hasText: 'Оформить заказ' });
    
    await expect(orderButton).toBeEnabled();
    
    console.log('Кликаем "Оформить заказ"...');
    await orderButton.click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await expect(modal).toHaveText(/109639/, { timeout: 10000 });

    const closeButton = page.getByTestId('modal-close');
    await closeButton.click();
    await expect(modal).toBeHidden();

    const emptyConstructorMessage = page.locator('.text')
      .filter({ hasText: 'Выберите булки' })
      .first();
    await expect(emptyConstructorMessage).toBeVisible({ timeout: 5000 });
    console.log('✅ Конструктор очищен.');
  });
});