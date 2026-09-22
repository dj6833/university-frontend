import { test, expect } from '@playwright/test';

//set this test to ".skip" tells Playwright to track it in reports but never run it - until we re-enable the registration feature
test.skip('new user can sign up successfully', async ({ page }) => {
    // Use a timestamp to ensure a unique email for every test run
    const uniqueFullName = `test user-${Date.now()}`;
    const uniqueEmail = `testuser-${Date.now()}@example.com`;

    await page.goto('/register', { timeout: 60000 }); // Automatically prepends the baseURL

    // Fill out the registration form
    await page.fill('input[name="name"]', uniqueFullName);
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Verify successful redirection or welcome message
    await expect(page).toHaveURL('/',{ timeout: 60000 }); // Checks if we are at the root
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Check for an element only visible when logged in - mine is a hidden span so come back to this
    //const logoutButton = page.getByRole('button', { name: /logout/i });
    //await expect(logoutButton).toBeVisible();
});

test('sign up disabled and advises user on sign-up attempt', async ({ page }) => {
    const uniqueFullName = `test user-${Date.now()}`;
    const uniqueEmail = `testuser-${Date.now()}@example.com`;

    await page.goto('/register', { timeout: 60000 });

    // Fill out the registration form
    await page.fill('input[name="name"]', uniqueFullName);
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Verify that the URL DID NOT change (user stays safely on the register page)
    await expect(page).toHaveURL('/register');

    // Locate and verify the toast error message
    // Adjust the text exact string snippet if your custom toast message varies slightly
    const toastMessage = page
        .getByLabel('Notifications alt+T')
        .getByText('New user registration is disabled');

    await expect(toastMessage).toBeVisible({ timeout: 10000 });
});