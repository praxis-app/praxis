import { expect, test } from '@playwright/test';
import { getOrCreateInstanceAdmin, isFirstUser } from '../lib/auth';
import { INSTANCE_ADMIN_USER } from '../lib/data';
import { AuthPage } from '../pages/auth.page';
import { ChatPage } from '../pages/chat.page';
import { NavigationPage } from '../pages/navigation.page';

test('first user can sign up from the landing page', async ({
  page,
  request,
}) => {
  if (!(await isFirstUser(request))) {
    await getOrCreateInstanceAdmin(request);
    return;
  }

  const auth = new AuthPage(page);
  const chat = new ChatPage(page);
  const navigation = new NavigationPage(page);

  await auth.gotoLanding();
  await auth.followSignupLink();
  await auth.signUp(INSTANCE_ADMIN_USER);

  await auth.expectSignedUp();
  await chat.expectChannel('general');
  await navigation.expectSignedInUser(INSTANCE_ADMIN_USER);
  await navigation.expectAccessTokenPersisted();
  expect(await isFirstUser(request)).toBe(false);
});
