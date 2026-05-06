import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { generateMockTransactionsForAccount } from "../lib/mockTransactions";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    include: {
      bankAccounts: true,
    },
  });

  for (const user of users) {
    for (const account of user.bankAccounts) {
      await prisma.transaction.deleteMany({
        where: {
          userId: user.id,
          bankAccountId: account.id,
        },
      });

      const transactions = generateMockTransactionsForAccount({
        userId: user.id,
        bankAccountId: account.id,
        accountType: account.accountType,
        accountCreatedAt: account.createdAt,
      });

      await prisma.transaction.createMany({
        data: transactions,
        skipDuplicates: true,
      });

      console.log(
        `Recreated ${transactions.length} transactions for ${user.email} - ${account.accountName}`
      );
    }
  }

  console.log("Transaction history generation complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });