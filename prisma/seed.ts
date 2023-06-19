import { prisma } from "~/server/db";
import seedData from "./seed.json";
import { z } from "zod";
import { QuestionEntry, RecordEntry, ScoreEntry } from "~/lib/db/types";

const SeedData = z.object({
  questions: z.array(QuestionEntry),
  records: z.array(RecordEntry),
  scoresCount: z.array(ScoreEntry),
  // users: z.array(),
});

async function seedDevelopment() {
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
  console.log("Seeding Complete!");
}
// const options = {
//   environment: { type: "string" },
// } as const;

async function main() {
  // const {
  //   values: { environment },
  // } = parseArgs({ options });
  const { environment } = process.env;

  try {
    switch (environment) {
      case "development":
        await prisma.$connect();
        await seedDevelopment();
        break;
      case "test":
        await prisma.$connect();
        break;
      default:
        console.log("No 'environment' Env ariable specified");

        break;
    }
  } catch (e) {
    console.error(e);
  }
  await prisma.$disconnect();
}

main();
