
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const PREFIXES: Record<Role, string> = {
  [Role.CUSTOMER]: 'user',
  [Role.ADMIN]: 'adm',
  [Role.SUPERVISOR]: 'sup',
  [Role.SUPPORT]: 'spt',
  [Role.CLEANER]: 'spkl',
};

export async function generateUserId(role: Role): Promise<string> {
  const prefix = PREFIXES[role];
  
  // Find the last user with this role, ordered by ID descending
  // We need to filter by ID starting with the prefix to be safe
  const lastUser = await prisma.user.findFirst({
    where: {
      role: role,
      id: {
        startsWith: prefix
      }
    },
    orderBy: {
      createdAt: 'desc' // Using createdAt as a proxy for order, but ideally we'd parse the ID. 
                        // However, since we are generating them sequentially, the latest created should have the highest number.
    }
  });

  if (!lastUser) {
    // First user of this role
    return `${prefix}001`;
  }

  // Extract the number part
  const idPart = lastUser.id.replace(prefix, '');
  const currentNumber = parseInt(idPart, 10);
  
  if (isNaN(currentNumber)) {
    // Fallback if for some reason the ID format is messed up
    return `${prefix}001`;
  }

  const nextNumber = currentNumber + 1;
  // Pad with zeros to ensure at least 3 digits (or 4 for cleaner as per request example spkl0001)
  // The request said: user001, adm02, spkl0001. 
  // Let's standardize on 3 digits for most, and 4 for cleaner if that was specific, or just use 3 for all for consistency?
  // User said: "user001, adm02, (for cleaner it should be spkl0001)"
  // adm02 implies 2 digits? user001 implies 3? spkl0001 implies 4?
  // Let's try to follow the examples.
  
  let padding = 3;
  if (role === Role.CLEANER) padding = 4;
  if (role === Role.ADMIN) padding = 2; 

  return `${prefix}${nextNumber.toString().padStart(padding, '0')}`;
}
