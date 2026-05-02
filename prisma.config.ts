import "dotenv/config";

import { defineConfig } from "prisma/config";
import { z } from "zod";

const dbUrl = z
  .string()
  .url("DATABASE_URL must be a valid Postgres connection URL")
  .parse(process.env.DATABASE_URL);

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: dbUrl,
  },
  migrations: {
    path: "prisma/migrations",
  },
});
