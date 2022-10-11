import { enhancePrisma } from 'blitz';
import { PrismaClient } from '@prisma/client';

const EnhancedPrisma = enhancePrisma(PrismaClient);
const db = new EnhancedPrisma();
export default db;
