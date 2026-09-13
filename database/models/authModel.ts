import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'crypto';
import { getAuthDatabase } from '../authStore';

export type AccountRole = 'citizen' | 'authority' | 'admin';

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: AccountRole;
  agency?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AccountRole;
  agency?: string;
  active: boolean;
}

interface SessionDoc {
  tokenHash: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

let indexesReady = false;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function createCitizenId(identity: string): string {
  const normalized = normalizeEmail(identity);
  let hash = 2166136261;

  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return `CIT-${(hash >>> 0).toString(36).toUpperCase()}`;
}

function createAuthorityId(): string {
  return `AUTH-${Date.now().toString(36).toUpperCase()}-${randomBytes(2)
    .toString('hex')
    .toUpperCase()}`;
}

function toPublicUser(user: UserDoc): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    agency: user.agency,
    active: user.active,
  };
}

async function ensureIndexes(): Promise<void> {
  if (indexesReady) return;
  const db = await getAuthDatabase();
  await Promise.all([
    db.collection<UserDoc>('users').createIndex({ email: 1 }, { unique: true }),
    db.collection<UserDoc>('users').createIndex({ id: 1 }, { unique: true }),
    db.collection<SessionDoc>('sessions').createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection<SessionDoc>('sessions').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    ),
  ]);
  indexesReady = true;
}

export const AuthModel = {
  async ensureAdminFromEnv(): Promise<void> {
    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.warn(
        '[Auth] ADMIN_EMAIL / ADMIN_PASSWORD are not configured. Admin login is disabled.'
      );
      return;
    }

    if (password.length < 8) {
      throw new Error('ADMIN_PASSWORD must contain at least 8 characters.');
    }

    await ensureIndexes();
    const db = await getAuthDatabase();
    const users = db.collection<UserDoc>('users');
    const normalizedEmail = normalizeEmail(email);
    const existing = await users.findOne({ email: normalizedEmail });

    if (existing && existing.role !== 'admin') {
      throw new Error(
        `ADMIN_EMAIL (${normalizedEmail}) already belongs to a non-admin account.`
      );
    }

    const now = new Date().toISOString();
    const adminDoc: UserDoc = {
      id: existing?.id || 'ADM-ROADGUARD-ROOT',
      name: process.env.ADMIN_NAME?.trim() || 'RoadGuard Administrator',
      email: normalizedEmail,
      phone: process.env.ADMIN_PHONE?.trim() || '',
      passwordHash: hashPassword(password),
      role: 'admin',
      agency: 'Terra Scan AI Administration',
      active: true,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await users.updateOne(
      { email: normalizedEmail },
      { $set: adminDoc },
      { upsert: true }
    );

    console.log(`[Auth] Admin account ready: ${normalizedEmail}`);
  },

  async createCitizen(input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<PublicUser> {
    await ensureIndexes();
    const db = await getAuthDatabase();
    const users = db.collection<UserDoc>('users');
    const email = normalizeEmail(input.email);

    const existing = await users.findOne({ email });
    if (existing) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }

    const now = new Date().toISOString();
    const user: UserDoc = {
      id: createCitizenId(email),
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      passwordHash: hashPassword(input.password),
      role: 'citizen',
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    await users.insertOne(user);
    return toPublicUser(user);
  },

  async createAuthority(
    input: {
      name: string;
      email: string;
      phone: string;
      password: string;
      agency: string;
    },
    adminId: string
  ): Promise<PublicUser> {
    await ensureIndexes();
    const db = await getAuthDatabase();
    const users = db.collection<UserDoc>('users');
    const email = normalizeEmail(input.email);

    const existing = await users.findOne({ email });
    if (existing) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }

    const now = new Date().toISOString();
    const user: UserDoc = {
      id: createAuthorityId(),
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      passwordHash: hashPassword(input.password),
      role: 'authority',
      agency: input.agency.trim(),
      active: true,
      createdAt: now,
      updatedAt: now,
      createdBy: adminId,
    };

    await users.insertOne(user);
    return toPublicUser(user);
  },

  async authenticate(
    emailInput: string,
    password: string
  ): Promise<PublicUser | null> {
    await ensureIndexes();
    const db = await getAuthDatabase();
    const user = await db
      .collection<UserDoc>('users')
      .findOne({ email: normalizeEmail(emailInput) });

    if (!user || !user.active) return null;
    if (!verifyPassword(password, user.passwordHash)) return null;
    return toPublicUser(user);
  },

  async getById(id: string): Promise<PublicUser | null> {
    await ensureIndexes();
    const db = await getAuthDatabase();
    const user = await db.collection<UserDoc>('users').findOne({ id });
    if (!user || !user.active) return null;
    return toPublicUser(user);
  },

  async createSession(userId: string): Promise<string> {
    await ensureIndexes();
    const db = await getAuthDatabase();
    const token = randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await db.collection<SessionDoc>('sessions').insertOne({
      tokenHash: hashSessionToken(token),
      userId,
      createdAt: now,
      expiresAt,
    });

    return token;
  },

  async getUserFromSession(token: string): Promise<PublicUser | null> {
    if (!token) return null;
    await ensureIndexes();
    const db = await getAuthDatabase();
    const sessions = db.collection<SessionDoc>('sessions');
    const session = await sessions.findOne({
      tokenHash: hashSessionToken(token),
      expiresAt: { $gt: new Date() },
    });

    if (!session) return null;
    return this.getById(session.userId);
  },

  async deleteSession(token: string): Promise<void> {
    if (!token) return;
    await ensureIndexes();
    const db = await getAuthDatabase();
    await db
      .collection<SessionDoc>('sessions')
      .deleteOne({ tokenHash: hashSessionToken(token) });
  },

  async listAuthorities(): Promise<PublicUser[]> {
    await ensureIndexes();
    const db = await getAuthDatabase();
    const users = await db
      .collection<UserDoc>('users')
      .find({ role: 'authority' })
      .sort({ createdAt: -1 })
      .toArray();
    return users.map(toPublicUser);
  },

  async setAuthorityActive(id: string, active: boolean): Promise<PublicUser | null> {
    await ensureIndexes();
    const db = await getAuthDatabase();
    const users = db.collection<UserDoc>('users');
    const existing = await users.findOne({ id, role: 'authority' });
    if (!existing) return null;

    await users.updateOne(
      { id, role: 'authority' },
      { $set: { active, updatedAt: new Date().toISOString() } }
    );

    const updated = await users.findOne({ id, role: 'authority' });
    return updated ? toPublicUser(updated) : null;
  },
};
