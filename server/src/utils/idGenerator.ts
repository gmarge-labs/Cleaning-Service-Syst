// import { Role } from '@prisma/client';
// import { v4 as uuidv4 } from 'uuid';

// const PREFIXES: Record<Role, string> = {
//   [Role.CUSTOMER]: 'user',
//   [Role.ADMIN]: 'adm',
//   [Role.SUPERVISOR]: 'sup',
//   [Role.SUPPORT]: 'spt',
//   [Role.CLEANER]: 'spkl',
// };

// export async function generateUserId(role: Role): Promise<string> {
//   const prefix = PREFIXES[role];
//   // Generate a unique ID using UUID v4 with the role prefix
//   // This eliminates race conditions entirely
//   const uniquePart = uuidv4().replace(/-/g, '').substring(0, 12);
//   return `${prefix}_${uniquePart}`;
// }
import { Role } from '@prisma/client';
import prisma from './prisma';

const PREFIXES: Record<Role, string> = {
  [Role.CUSTOMER]: 'user',
  [Role.ADMIN]: 'adm',
  [Role.SUPERVISOR]: 'sup',
  [Role.SUPPORT]: 'spt',
  [Role.CLEANER]: 'spkl',
};

export async function generateUserId(role: Role): Promise<string> {
  const prefix = PREFIXES[role];
  
  // Special handling for cleaners - use sequential numbering
  if (role === Role.CLEANER) {
    // Get the highest cleaner number
    const lastCleaner = await prisma.user.findFirst({
      where: {
        id: {
          startsWith: 'spkl_'
        }
      },
      orderBy: {
        id: 'desc'
      },
      select: {
        id: true
      }
    });

    let nextNumber = 1;
    if (lastCleaner) {
      // Extract number from ID like "spkl_0001"
      const match = lastCleaner.id.match(/spkl_(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    // Format with leading zeros (4 digits)
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    return `spkl_${formattedNumber}`;
  }

  // For other roles, use UUID-based IDs
  const { v4: uuidv4 } = await import('uuid');
  const uniquePart = uuidv4().replace(/-/g, '').substring(0, 12);
  return `${prefix}_${uniquePart}`;
}