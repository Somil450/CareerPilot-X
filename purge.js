const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
  await prisma.opportunity.deleteMany(); 
  await prisma.aIMemory.deleteMany(); 
  await prisma.autopilotTask.deleteMany();
  console.log('Purged fake records.'); 
} 

main().catch(console.error).finally(() => prisma.$disconnect());
