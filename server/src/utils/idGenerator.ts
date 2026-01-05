import { Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const PREFIXES: Record<Role, string> = {
  [Role.CUSTOMER]: 'user',
  [Role.ADMIN]: 'adm',
  [Role.SUPERVISOR]: 'sup',
  [Role.SUPPORT]: 'spt',
  [Role.CLEANER]: 'spkl',
};

export async function generateUserId(role: Role): Promise<string> {
  const prefix = PREFIXES[role];
  // Generate a unique ID using UUID v4 with the role prefix
  // This eliminates race conditions entirely
  const uniquePart = uuidv4().replace(/-/g, '').substring(0, 12);
  return `${prefix}_${uniquePart}`;
}
