import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

// Tạo PrismaClient instance
const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"], // optional: log SQL queries
});


export const connectPostgresDB = async (): Promise<void> => {
    try {
        await prisma.$connect();
        console.log("✅ PostgresDB connected successfully");
    } catch (error) {
        console.error("❌ PostgresDB connection error:", error);
        process.exit(1); 
    }
};