import { Request, Response } from 'express';
import { AccountRole, AuthModel } from '../../database/models/authModel';
import { AuthenticatedRequest, getCookie } from '../middleware/authMiddleware';

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function setSessionCookie(res: Response, token: string) {
  const parts = [
    `rg_session=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ];

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }

  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res: Response) {
  const parts = [
    'rg_session=',
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0',
  ];

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }

  res.setHeader('Set-Cookie', parts.join('; '));
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const AuthController = {
  async registerCitizen(req: Request, res: Response) {
    try {
      const name = String(req.body?.name || '').trim();
      const email = String(req.body?.email || '').trim();
      const phone = String(req.body?.phone || '').trim();
      const password = String(req.body?.password || '');

      if (name.length < 2) {
        return res.status(400).json({ success: false, error: 'Enter your full name.' });
      }
      if (!isEmail(email)) {
        return res.status(400).json({ success: false, error: 'Enter a valid email address.' });
      }
      if (phone.length < 7) {
        return res.status(400).json({ success: false, error: 'Enter a valid phone number.' });
      }
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must contain at least 8 characters.' });
      }

      const user = await AuthModel.createCitizen({ name, email, phone, password });
      const token = await AuthModel.createSession(user.id);
      setSessionCookie(res, token);

      return res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      if (error?.message === 'EMAIL_ALREADY_REGISTERED') {
        return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      }
      console.error('[Auth] Citizen registration failed:', error?.message || error);
      return res.status(500).json({ success: false, error: 'Could not create the account.' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const email = String(req.body?.email || '').trim();
      const password = String(req.body?.password || '');
      const expectedRole = String(req.body?.expectedRole || '').trim() as AccountRole | '';

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const user = await AuthModel.authenticate(email, password);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      if (expectedRole && user.role !== expectedRole) {
        return res.status(403).json({
          success: false,
          error:
            expectedRole === 'authority'
              ? 'This account is not registered as a Road Authority account.'
              : expectedRole === 'admin'
              ? 'This account is not an administrator account.'
              : 'This account is not registered as a citizen account.',
        });
      }

      const token = await AuthModel.createSession(user.id);
      setSessionCookie(res, token);
      return res.json({ success: true, data: user });
    } catch (error: any) {
      console.error('[Auth] Login failed:', error?.message || error);
      return res.status(500).json({ success: false, error: 'Could not sign in right now.' });
    }
  },

  async me(req: AuthenticatedRequest, res: Response) {
    return res.json({ success: true, data: req.authUser });
  },

  async logout(req: Request, res: Response) {
    try {
      const token = getCookie(req, 'rg_session');
      if (token) {
        await AuthModel.deleteSession(token);
      }
    } catch (error: any) {
      console.warn('[Auth] Logout session cleanup failed:', error?.message || error);
    }

    clearSessionCookie(res);
    return res.json({ success: true });
  },

  async listAuthorities(req: AuthenticatedRequest, res: Response) {
    try {
      const authorities = await AuthModel.listAuthorities();
      return res.json({ success: true, data: authorities });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  async createAuthority(req: AuthenticatedRequest, res: Response) {
    try {
      const name = String(req.body?.name || '').trim();
      const email = String(req.body?.email || '').trim();
      const phone = String(req.body?.phone || '').trim();
      const password = String(req.body?.password || '');
      const agency = String(req.body?.agency || '').trim();

      if (name.length < 2 || !isEmail(email) || phone.length < 7 || agency.length < 2) {
        return res.status(400).json({ success: false, error: 'Complete all authority account fields with valid details.' });
      }
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: 'Authority password must contain at least 8 characters.' });
      }

      const authority = await AuthModel.createAuthority(
        { name, email, phone, password, agency },
        req.authUser!.id
      );
      return res.status(201).json({ success: true, data: authority });
    } catch (error: any) {
      if (error?.message === 'EMAIL_ALREADY_REGISTERED') {
        return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      }
      console.error('[Auth] Authority creation failed:', error?.message || error);
      return res.status(500).json({ success: false, error: 'Could not create the authority account.' });
    }
  },

  async setAuthorityActive(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const active = req.body?.active;
      if (typeof active !== 'boolean') {
        return res.status(400).json({ success: false, error: 'active must be true or false.' });
      }

      const authority = await AuthModel.setAuthorityActive(id, active);
      if (!authority) {
        return res.status(404).json({ success: false, error: 'Authority account not found.' });
      }
      return res.json({ success: true, data: authority });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
};
