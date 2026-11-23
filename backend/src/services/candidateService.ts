import { prisma } from '../config/db';
import { CandidateStatus } from '@prisma/client';

export interface RegisterCandidateDto {
  fullName: string;
  email: string;
  age: number;
  phoneNumber: string;
  gender?: string | null;
  highestQualification: string;
  city?: string | null;
}

export class CandidateService {
  async register(data: RegisterCandidateDto) {
    const existing = await prisma.candidate.findUnique({
      where: { email: data.email },
      include: {
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (existing) {
      const latestAttempt = existing.attempts[0];
      if (existing.status === CandidateStatus.COMPLETED || latestAttempt?.status === 'COMPLETED') {
        throw {
          statusCode: 409,
          message: 'An assessment has already been completed using this email address. Each candidate is permitted only one attempt.',
          attemptId: latestAttempt?.id,
          candidateId: existing.id,
          isCompleted: true,
        };
      }

      if (existing.status === CandidateStatus.IN_PROGRESS && latestAttempt?.status === 'IN_PROGRESS') {
        return {
          candidate: existing,
          existingAttemptId: latestAttempt.id,
          isResumed: true,
          message: 'Welcome back! You have an assessment currently in progress. Resuming your session.',
        };
      }

      // If registered but haven't started an attempt yet:
      return {
        candidate: existing,
        isResumed: false,
        message: 'Candidate registration verified. You may proceed to instructions.',
      };
    }

    const candidate = await prisma.candidate.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        age: data.age,
        phoneNumber: data.phoneNumber,
        gender: data.gender || null,
        highestQualification: data.highestQualification,
        city: data.city || null,
        status: CandidateStatus.REGISTERED,
      },
    });

    return {
      candidate,
      isResumed: false,
      message: 'Registration successful! Please review the assessment instructions before beginning.',
    };
  }
}

export const candidateService = new CandidateService();
