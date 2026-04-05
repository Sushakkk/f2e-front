import { normalizeUser } from 'entities/user';

import type { AuthClient } from './client';
import type { BackendAuthResponse } from './server';

export const normalizeAuthResponse = (data: BackendAuthResponse): AuthClient => ({
  user: normalizeUser(data.user),
  accessToken: data.access,
  refreshToken: data.refresh,
});
