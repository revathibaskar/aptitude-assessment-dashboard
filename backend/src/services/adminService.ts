import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { QuestionCategory, QuestionDifficulty, OptionType } from '@prisma/client';

export class AdminService {
  /**
   * Admin Authentication
   */
  async login(email: string, passwordPlain: string) {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw { statusCode: 401, message: 'Invalid email address or password.' };
    }

    const isMatch = await bcrypt.compare(passwordPlain, admin.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid email address or password.' };
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    };
  }

  /**
   * Dashboard Statistics & Charts
   */
  async getDashboardStats() {
    const totalCandidates = await prisma.candidate.count();
    const completedAttempts = await prisma.testAttempt.findMany({
      where: { status: 'COMPLETED' },
      select: {
        totalScore: true,
        percentage: true,
        isPassed: true,
        createdAt: true,
      },
    });

    const testsCompleted = completedAttempts.length;

    let averageScore = 0;
    let passRate = 0;
    let highestScore = 0;

    let passCount = 0;
    let failCount = 0;

    // Buckets for score distribution: <0, 0-4, 5-8, 9-12, 13-16, 17-20
    const scoreBuckets = {
      'Below 0': 0,
      '0 - 4': 0,
      '5 - 8': 0,
      '9 - 12': 0,
      '13 - 16': 0,
      '17 - 20': 0,
    };

    if (testsCompleted > 0) {
      let sumScore = 0;
      highestScore = completedAttempts[0].totalScore ?? 0;

      for (const att of completedAttempts) {
        const score = att.totalScore ?? 0;
        sumScore += score;
        if (score > highestScore) highestScore = score;
        if (att.isPassed) passCount++;
        else failCount++;

        if (score < 0) scoreBuckets['Below 0']++;
        else if (score <= 4) scoreBuckets['0 - 4']++;
        else if (score <= 8) scoreBuckets['5 - 8']++;
        else if (score <= 12) scoreBuckets['9 - 12']++;
        else if (score <= 16) scoreBuckets['13 - 16']++;
        else scoreBuckets['17 - 20']++;
      }

      averageScore = Number((sumScore / testsCompleted).toFixed(1));
      passRate = Number(((passCount / testsCompleted) * 100).toFixed(1));
    }

    const scoreDistribution = Object.entries(scoreBuckets).map(([range, count]) => ({
      range,
      count,
    }));

    const passFailDistribution = [
      { name: 'Passed', value: passCount, color: '#10b981' },
      { name: 'Failed', value: failCount, color: '#ef4444' },
    ];

    // Recent 5 completed attempts
    const recentAttempts = await prisma.testAttempt.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: 5,
      include: {
        candidate: {
          select: { fullName: true, email: true },
        },
      },
    });

    return {
      summary: {
        totalCandidates,
        testsCompleted,
        averageScore,
        passRate,
        highestScore,
      },
      charts: {
        scoreDistribution,
        passFailDistribution,
      },
      recentAttempts: recentAttempts.map((a) => ({
        id: a.id,
        candidateName: a.candidate.fullName,
        candidateEmail: a.candidate.email,
        totalScore: a.totalScore,
        percentage: a.percentage,
        isPassed: a.isPassed,
        completedAt: a.completedAt,
      })),
    };
  }

  /**
   * Question Management
   */
  async getQuestions(filter?: { category?: QuestionCategory; isActive?: boolean; search?: string }) {
    const where: any = {};

    if (filter?.category) {
      where.category = filter.category;
    }
    if (filter?.isActive !== undefined) {
      where.isActive = filter.isActive;
    }
    if (filter?.search) {
      where.text = { contains: filter.search, mode: 'insensitive' };
    }

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const activeCount = await prisma.question.count({ where: { isActive: true } });

    return {
      questions,
      activeCount,
      targetActiveCount: 10,
    };
  }

  async addQuestion(data: {
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: OptionType;
    category: QuestionCategory;
    difficulty: QuestionDifficulty;
    explanation?: string | null;
    isActive?: boolean;
  }) {
    if (data.isActive) {
      const activeCount = await prisma.question.count({ where: { isActive: true } });
      if (activeCount >= 10) {
        throw {
          statusCode: 400,
          message: 'Cannot activate question. Exactly 10 active questions are allowed in the system. Deactivate another question first.',
        };
      }
    }

    return prisma.question.create({
      data: {
        text: data.text,
        optionA: data.optionA,
        optionB: data.optionB,
        optionC: data.optionC,
        optionD: data.optionD,
        correctOption: data.correctOption,
        category: data.category,
        difficulty: data.difficulty,
        explanation: data.explanation || null,
        isActive: data.isActive ?? false,
      },
    });
  }

  async updateQuestion(
    id: string,
    data: {
      text?: string;
      optionA?: string;
      optionB?: string;
      optionC?: string;
      optionD?: string;
      correctOption?: OptionType;
      category?: QuestionCategory;
      difficulty?: QuestionDifficulty;
      explanation?: string | null;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Question not found.' };
    }

    // If activating a previously inactive question, verify count <= 10
    if (data.isActive === true && !existing.isActive) {
      const activeCount = await prisma.question.count({ where: { isActive: true } });
      if (activeCount >= 10) {
        throw {
          statusCode: 400,
          message: 'Cannot activate question. Maximum 10 active questions allowed. Please deactivate an existing question first.',
        };
      }
    }

    return prisma.question.update({
      where: { id },
      data,
    });
  }

  async deleteQuestion(id: string) {
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Question not found.' };
    }

    // Historical test attempts use AttemptQuestion snapshots, so deletion of the question record
    // safely detaches foreign key questionId (setNull) without mutating past attempts or results.
    await prisma.question.delete({ where: { id } });
    return { success: true, message: 'Question deleted successfully.' };
  }

  /**
   * Candidate Results Management: Search, Filter, Sort, Pagination
   */
  async getCandidates(params: {
    page?: number;
    limit?: number;
    search?: string;
    statusFilter?: 'ALL' | 'PASSED' | 'FAILED';
    sortBy?: 'date' | 'score' | 'name';
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (params.statusFilter === 'PASSED') {
      where.attempts = {
        some: {
          status: 'COMPLETED',
          isPassed: true,
        },
      };
    } else if (params.statusFilter === 'FAILED') {
      where.attempts = {
        some: {
          status: 'COMPLETED',
          isPassed: false,
        },
      };
    }

    const orderBy: any[] = [];
    if (params.sortBy === 'score') {
      // Order by candidate name or custom
      orderBy.push({ fullName: params.sortOrder || 'asc' });
    } else if (params.sortBy === 'name') {
      orderBy.push({ fullName: params.sortOrder || 'asc' });
    } else {
      orderBy.push({ createdAt: params.sortOrder || 'desc' });
    }

    const [total, candidates] = await prisma.$transaction([
      prisma.candidate.count({ where }),
      prisma.candidate.findMany({
        where,
        include: {
          attempts: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // Format candidate records
    const formatted = candidates.map((c) => {
      const latestAttempt = c.attempts[0];
      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phoneNumber: c.phoneNumber,
        age: c.age,
        gender: c.gender,
        highestQualification: c.highestQualification,
        city: c.city,
        status: c.status,
        attemptId: latestAttempt?.id || null,
        score: latestAttempt?.totalScore ?? null,
        percentage: latestAttempt?.percentage ?? null,
        isPassed: latestAttempt?.isPassed ?? null,
        attemptDate: latestAttempt?.completedAt || latestAttempt?.createdAt || c.createdAt,
      };
    });

    // If sorting by score, sort formatted array
    if (params.sortBy === 'score') {
      formatted.sort((a, b) => {
        const scoreA = a.score ?? -999;
        const scoreB = b.score ?? -999;
        return params.sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      });
    }

    return {
      candidates: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Candidate Detail View with full question breakdown
   */
  async getCandidateDetail(candidateId: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        attempts: {
          orderBy: { createdAt: 'desc' },
          include: {
            attemptQuestions: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!candidate) {
      throw { statusCode: 404, message: 'Candidate not found.' };
    }

    const latestAttempt = candidate.attempts[0] || null;

    return {
      candidate: {
        id: candidate.id,
        fullName: candidate.fullName,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber,
        age: candidate.age,
        gender: candidate.gender,
        highestQualification: candidate.highestQualification,
        city: candidate.city,
        registeredAt: candidate.createdAt,
        status: candidate.status,
      },
      attempt: latestAttempt
        ? {
            id: latestAttempt.id,
            status: latestAttempt.status,
            startedAt: latestAttempt.startedAt,
            completedAt: latestAttempt.completedAt,
            durationMinutes: latestAttempt.durationMinutes,
            passPercentage: latestAttempt.passPercentage,
            totalScore: latestAttempt.totalScore,
            percentage: latestAttempt.percentage,
            correctCount: latestAttempt.correctCount,
            incorrectCount: latestAttempt.incorrectCount,
            unattemptedCount: latestAttempt.unattemptedCount,
            marksDeducted: latestAttempt.marksDeducted,
            isPassed: latestAttempt.isPassed,
            questions: latestAttempt.attemptQuestions.map((q) => ({
              orderIndex: q.orderIndex,
              questionText: q.questionText,
              options: {
                A: q.optionA,
                B: q.optionB,
                C: q.optionC,
                D: q.optionD,
              },
              category: q.category,
              difficulty: q.difficulty,
              selectedOption: q.selectedOption,
              correctOption: q.correctOption,
              isCorrect: q.isCorrect,
              marksAwarded: q.marksAwarded,
              explanation: q.explanation,
            })),
          }
        : null,
    };
  }

  /**
   * Export candidate results to CSV with formula injection protection
   */
  async exportResultsToCsv(params: {
    search?: string;
    statusFilter?: 'ALL' | 'PASSED' | 'FAILED';
  }) {
    const where: any = {};

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (params.statusFilter === 'PASSED') {
      where.attempts = {
        some: {
          status: 'COMPLETED',
          isPassed: true,
        },
      };
    } else if (params.statusFilter === 'FAILED') {
      where.attempts = {
        some: {
          status: 'COMPLETED',
          isPassed: false,
        },
      };
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Sanitizer for CSV Formula Injection:
    // If field starts with =, +, -, @, \t, \r, prepend single quote '
    const sanitizeCsvCell = (val: any): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      // Escape quotes
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'Candidate Name',
      'Email ID',
      'Phone Number',
      'Age',
      'Gender',
      'Highest Qualification',
      'City',
      'Status',
      'Score (out of 20)',
      'Percentage (%)',
      'Correct Answers',
      'Incorrect Answers',
      'Unattempted',
      'Result Status',
      'Attempt Date',
    ];

    const rows = candidates.map((c) => {
      const att = c.attempts[0];
      return [
        sanitizeCsvCell(c.fullName),
        sanitizeCsvCell(c.email),
        sanitizeCsvCell(c.phoneNumber),
        sanitizeCsvCell(c.age),
        sanitizeCsvCell(c.gender || 'N/A'),
        sanitizeCsvCell(c.highestQualification),
        sanitizeCsvCell(c.city || 'N/A'),
        sanitizeCsvCell(c.status),
        sanitizeCsvCell(att?.totalScore !== null && att?.totalScore !== undefined ? att.totalScore : 'N/A'),
        sanitizeCsvCell(att?.percentage !== null && att?.percentage !== undefined ? `${att.percentage}%` : 'N/A'),
        sanitizeCsvCell(att?.correctCount ?? 'N/A'),
        sanitizeCsvCell(att?.incorrectCount ?? 'N/A'),
        sanitizeCsvCell(att?.unattemptedCount ?? 'N/A'),
        sanitizeCsvCell(att?.isPassed !== null && att?.isPassed !== undefined ? (att.isPassed ? 'PASSED' : 'FAILED') : 'NOT COMPLETED'),
        sanitizeCsvCell(att?.completedAt ? new Date(att.completedAt).toISOString() : 'N/A'),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Settings Management
   */
  async getSettings() {
    let settings = await prisma.testSetting.findFirst();
    if (!settings) {
      settings = await prisma.testSetting.create({
        data: {
          durationMinutes: 15,
          passPercentage: 60.0,
        },
      });
    }
    return settings;
  }

  async updateSettings(durationMinutes: number, passPercentage: number) {
    let settings = await prisma.testSetting.findFirst();
    if (!settings) {
      return prisma.testSetting.create({
        data: { durationMinutes, passPercentage },
      });
    }

    return prisma.testSetting.update({
      where: { id: settings.id },
      data: {
        durationMinutes,
        passPercentage,
      },
    });
  }
}

export const adminService = new AdminService();

