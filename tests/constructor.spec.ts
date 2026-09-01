import { test, expect } from '@playwright/test';

async function ensureLoggedIn(page) {
  // 1. Проверяем, не залогинены ли мы уже (по имени в шапке)
  const isLoggedIn = await page.locator('.header-user-name').isVisible().catch(() => false);
  if (isLoggedIn) {
    console.log('✅ Уже авторизован');
    return;
  }

  console.log('🔐 Выполняем вход...');

  // 2. Переходим на страницу входа (если вдруг мы не там)
  await page.goto('http://localhost:4000/profile');

  // 3. Вводим данные
  const email = process.env.TEST_EMAIL || 'terorf6@gmail.com';
  const password = process.env.TEST_PASSWORD || 'asdasd';

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Войти")');

  // 4. ЖДЕМ НЕ URL, А СОСТОЯНИЯ АВТОРИЗАЦИИ
  // Ждем появления кнопки "Выход" или имени пользователя в меню.
  // Это значит, что токены сохранились и приложение считает нас залогиненными.
  await expect(page.locator('button:has-text("Выход")')).toBeVisible({ timeout: 15000 });
  
  console.log('✅ Вход успешен! Пользователь авторизован.');

  // 5. ЯВНО ПЕРЕХОДИМ В КОНСТРУКТОР
  // В Stellar Burgers после входа остаешься в профиле. Нужно кликнуть меню.
  // Селектор ищет ссылку с текстом "Конструктор" в навигационном меню.
  await page.click('a[href="/"] p:has-text("Конструктор")');
  
  // Альтернатива, если первый селектор не сработает (попробуй этот):
  // await page.click('nav a[href="/"]'); 

  // 6. Теперь ждем загрузки ингредиентов на главной странице
  await page.waitForSelector('li:has-text("Краторная булка N-200i")', { timeout: 10000 });
  
  console.log('✅ Мы в конструкторе бургера!');
}

test.describe('Тестирование конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('./tests/hars/api.har', {
      url: '/api/**',
      update: false
    });

    await page.goto('http://localhost:4000');
  });

  test('Должен добавить ингредиент в конструктор', async ({ page }) => {
    await page.waitForSelector('li:has-text("Краторная булка N-200i")', {
      timeout: 10000
    });

    const ingredient = page.locator('li', { hasText: 'Сыр с астероидной плесенью' });
    const addButton = ingredient.locator('button', { hasText: 'Добавить' });
    await addButton.click();

    const constructorIngredient = page.locator('.constructor-element', {
      hasText: 'Сыр с астероидной плесенью'
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

    await page.waitForSelector('li:has-text("Краторная булка N-200i")', {
      timeout: 10000
    });

    const bun = page.locator('li', { hasText: 'Краторная булка N-200i' });
    await bun.locator('button', { hasText: 'Добавить' }).click();

    const ingredient = page.locator('li', { hasText: 'Сыр с астероидной плесенью' });
    await ingredient.locator('button', { hasText: 'Добавить' }).click();

    const orderButton = page.locator('button', { hasText: 'Оформить заказ' });
    await expect(orderButton).toBeEnabled();
    await orderButton.click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible({ timeout: 10000 });
    await expect(modal).toHaveText(/\d{5,6}/, { timeout: 30000 });

    const closeButton = page.getByTestId('modal-close');
    await closeButton.click();
    await expect(modal).toBeHidden();

    const emptyConstructorMessage = page.locator('.text')
      .filter({ hasText: 'Выберите булки' })
      .first();
    await expect(emptyConstructorMessage).toBeVisible();
  });
});