import { test, expect } from '@playwright/test';

test('new user can sign up successfully', async ({ page }) => {
    // Use a timestamp to ensure a unique email for every test run
    const uniqueFullName = `test user-${Date.now()}`;
    const uniqueEmail = `testuser-${Date.now()}@example.com`;

    await page.setExtraHTTPHeaders({
        'x-vercel-protection-bypass': 'SNa9mDWNzszyoKEoQUCqHRedzAUrRfN4',
    });

    await page.goto('/register', { timeout: 60000 }); // Automatically prepends the baseURL

    // Fill out the registration form
    await page.fill('input[name="name"]', uniqueFullName);
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Verify successful redirection or welcome message
    await expect(page).toHaveURL('/'); // Checks if we are at the root
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Check for an element only visible when logged in - mine is a hidden span so come back to this
    //const logoutButton = page.getByRole('button', { name: /logout/i });
    //await expect(logoutButton).toBeVisible();
});
