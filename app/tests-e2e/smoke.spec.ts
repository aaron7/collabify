import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Collabify/);
});

test('can invite collaborator and share text', async ({ browser }) => {
  const hostContext = await browser.newContext();
  const collaboratorContext = await browser.newContext();

  const hostPage = await hostContext.newPage();
  const collaboratorPage = await collaboratorContext.newPage();

  // Start a new session as host
  await hostPage.goto('/new');
  await hostPage.getByRole('textbox').fill('Hello world');

  // Invite the collaborator
  await hostPage
    .locator('button')
    .filter({ hasText: 'Copy invite URL' })
    .click();
  const joinUrl = await hostPage.evaluate(() => navigator.clipboard.readText());
  await collaboratorPage.goto(joinUrl);

  // The collaborator should see the text from the host
  await expect(collaboratorPage.getByRole('textbox')).toContainText(
    'Hello world',
  );
});
