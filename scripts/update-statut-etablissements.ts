import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Mise à jour du statut des établissements...');
  
  const result = await prisma.etablissement.updateMany({
    where: {
      statut: 'EN_ATTENTE'
    },
    data: {
      statut: 'ACTIF'
    }
  });

  console.log(`✅ ${result.count} établissement(s) mis à jour de EN_ATTENTE vers ACTIF`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
