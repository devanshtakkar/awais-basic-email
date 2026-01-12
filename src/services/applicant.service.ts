import { prisma } from '../lib/prisma.js';
import { Logger } from '../utils/logger.js';
import { Applicants } from '../generated/prisma/client.js';

const applicantLogger = new Logger('ApplicantService');

export class ApplicantService {
  async getApplicants(limit: number, country?: string): Promise<Applicants[]> {
    try {
      const applicants = await prisma.applicants.findMany({
        where: country ? { country } : undefined,
        take: limit,
      });

      applicantLogger.info(`Found ${applicants.length} applicant(s)${country ? ` from ${country}` : ''}`);

      return applicants;
    } catch (error) {
      applicantLogger.error(`Failed to fetch applicants: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async getApplicantById(id: string): Promise<Applicants | null> {
    try {
      const applicant = await prisma.applicants.findUnique({
        where: { id },
      });

      if (!applicant) {
        applicantLogger.warn(`Applicant with id '${id}' not found`);
      }

      return applicant;
    } catch (error) {
      applicantLogger.error(`Failed to fetch applicant '${id}': ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async getApplicantByEmail(email: string): Promise<Applicants | null> {
    try {
      const applicant = await prisma.applicants.findUnique({
        where: { email },
      });

      if (!applicant) {
        applicantLogger.warn(`Applicant with email '${email}' not found`);
      }

      return applicant;
    } catch (error) {
      applicantLogger.error(`Failed to fetch applicant by email '${email}': ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async countApplicants(country?: string): Promise<number> {
    try {
      const count = await prisma.applicants.count({
        where: country ? { country } : undefined,
      });

      applicantLogger.info(`Total applicants${country ? ` from ${country}` : ''}: ${count}`);

      return count;
    } catch (error) {
      applicantLogger.error(`Failed to count applicants: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

export const applicantService = new ApplicantService();
