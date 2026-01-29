import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaMariaDb(connectionString)
const prisma = new PrismaClient({ adapter });

export { prisma };