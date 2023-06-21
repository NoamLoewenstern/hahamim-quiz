import { prisma } from "~/server/db";
import fs from "fs";
import { z } from "zod";
import { QuestionEntry, RecordEntry, ScoreEntry } from "~/lib/db/types";

const SeedData = z.object({
  questions: z.array(QuestionEntry),
  records: z.array(RecordEntry),
  scoresCount: z.array(ScoreEntry),
  // users: z.array(),
});
async function seedDevelopment() {
  const SEED_DATA_PATH = "./seed.json";
  if (!fs.existsSync(SEED_DATA_PATH)) {
    console.warn("No seed data found, skipping seeding");
    return;
  }

  const seedData = await import(SEED_DATA_PATH);

  //! drops and re-creates the database
  const seedEntries = SeedData.parse(seedData);
  console.log(
    `Deleting Current DB, and then seeding ${seedEntries.questions.length} questions, ${seedEntries.records.length} records, ${seedEntries.scoresCount.length} scoresCount`
  );

  await prisma.$transaction([
    prisma.question.deleteMany({}),
    prisma.record.deleteMany({}),
    prisma.scoreCount.deleteMany({}),

    prisma.question.createMany({ data: seedEntries.questions }),
    prisma.record.createMany({ data: seedEntries.records }),
    prisma.scoreCount.createMany({ data: seedEntries.scoresCount }),
  ]);
}

async function main() {
  const { environment } = process.env;

  try {
    switch (environment) {
      case "development":
        await prisma.$connect();
        await seedDevelopment();
        console.log("Seeding Complete!");

        break;
      case "test":
        await prisma.$connect();
        break;
      default:
        throw new Error("No 'environment' Env ariable specified");
    }
  } catch (e) {
    console.error(e);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
