import { NextFunction, Request, Response } from 'express';
import { AccountRole, AuthModel, PublicUser } from '../../database/models/authModel';

export interface AuthenticatedRequest extends Request {
  authUser?: PublicUser;
  sessionToken?: string;
}

export function getCookie(req: Request, name: string): string {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';');

  for (const item of cookies) {
    const [rawKey, ...rawValueParts] = item.trim().split('=');
    if (rawKey === name) {
      return decodeURIComponent(rawValueParts.join('='));
    }
  }

  return '';
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = getCookie(req, 'rg_session');
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const user = await AuthModel.getUserFromSession(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid.' });
    }

    req.authUser = user;
    req.sessionToken = token;
    return next();
  } catch (error: any) {
    console.error('[Auth] Session validation failed:', error?.message || error);
    return res.status(500).json({ success: false, error: 'Authentication service unavailable.' });
  }
}

export function requireRole(...roles: AccountRole[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    await requireAuth(req, res, () => {
      const role = req.authUser?.role;
      if (!role || !roles.includes(role)) {
        return res.status(403).json({ success: false, error: 'You do not have permission to perform this action.' });
      }
      return next();
    });
  };
}
