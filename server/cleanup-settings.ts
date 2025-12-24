import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up system settings...');
  
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'default' }
  });

  if (settings) {
    const addonPrices = settings.addonPrices as any;
    if (addonPrices['Carpet Cleaning']) {
      console.log('Removing "Carpet Cleaning" from addonPrices...');
      delete addonPrices['Carpet Cleaning'];
      
      await prisma.systemSettings.update({
        where: { id: 'default' },
        data: {
          addonPrices: addonPrices
        }
      });
      console.log('Successfully updated settings.');
    } else {
      console.log('"Carpet Cleaning" not found in addonPrices.');
    }
  } else {
    console.log('Default settings not found.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
