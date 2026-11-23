import { prisma } from '../config/db';
import { CandidateStatus, AttemptStatus, OptionType, QuestionCategory } from '@prisma/client';

export class AssessmentService {
  /**
   * Get assessment instructions, settings, and eligibility status
   */
  async getInstructions() {
    const settings = await prisma.testSetting.findFirst();
    const durationMinutes = settings?.durationMinutes ?? 15;
    const passPercentage = settings?.passPercentage ?? 60.0;

    const activeQuestions = await prisma.question.findMany({
      where: { isActive: true },
      select: { id: true, category: true },
    });

    const activeCount = activeQuestions.length;
    const quantCount = activeQuestions.filter((q) => q.category === QuestionCategory.QUANTITATIVE).length;
    const logicalCount = activeQuestions.filter((q) => q.category === QuestionCategory.LOGICAL_REASONING).length;
    const verbalCount = activeQuestions.filter((q) => q.category === QuestionCategory.VERBAL).length;

    const hasValidCategories = quantCount >= 3 && logicalCount >= 3 && verbalCount >= 3;
    const canStart = activeCount === 10 && hasValidCategories;

    let reasonNotReady = '';
    if (activeCount !== 10) {
      reasonNotReady = `Exactly 10 active questions are required to start the test (currently ${activeCount} active).`;
    } else if (!hasValidCategories) {
      reasonNotReady = `Questions must include at least 3 Quantitative, 3 Logical Reasoning, and 3 Verbal questions.`;
    }

    return {
      totalQuestions: 10,
      durationMinutes,
      passPercentage,
      markingScheme: {
        correct: '+2 marks',
        wrong: '-1 mark',
        unattempted: '0 marks',
        maxScore: 20,
      },
      activeCount,
      canStart,
      reasonNotReady,
    };
  }

  /**
   * Start a new test attempt for a registered candidate
   */
  async startAssessment(candidateId: string) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { attempts: true },
    });

    if (!candidate) {
      throw { statusCode: 404, message: 'Candidate not found.' };
    }

    // Check if candidate already completed or has an existing attempt
    const completedAttempt = candidate.attempts.find((a) => a.status === AttemptStatus.COMPLETED);
    if (completedAttempt) {
      throw {
        statusCode: 400,
        message: 'You have already completed your assessment attempt. Multiple attempts are not permitted.',
        attemptId: completedAttempt.id,
      };
    }

    // Check if candidate already has an active IN_PROGRESS attempt
    const activeAttempt = candidate.attempts.find((a) => a.status === AttemptStatus.IN_PROGRESS);
    if (activeAttempt) {
      // Check if deadline has passed
      if (new Date() > activeAttempt.deadlineAt) {
        await this.submitAssessment(activeAttempt.id, true);
        throw {
          statusCode: 400,
          message: 'Your previous test session has timed out and was automatically submitted.',
          attemptId: activeAttempt.id,
        };
      }

      // Resume existing active attempt
      const attemptDetails = await this.getAssessment(activeAttempt.id);
      return {
        isResumed: true,
        ...attemptDetails,
      };
    }

    // Validate 10 active questions rule
    const activeQuestions = await prisma.question.findMany({
      where: { isActive: true },
    });

    if (activeQuestions.length !== 10) {
      throw {
        statusCode: 400,
        message: `Assessment cannot start. Exactly 10 active questions are required (found ${activeQuestions.length}).`,
      };
    }

    // Validate category requirement: at least 3 in each category
    const quantCount = activeQuestions.filter((q) => q.category === QuestionCategory.QUANTITATIVE).length;
    const logicalCount = activeQuestions.filter((q) => q.category === QuestionCategory.LOGICAL_REASONING).length;
    const verbalCount = activeQuestions.filter((q) => q.category === QuestionCategory.VERBAL).length;

    if (quantCount < 3 || logicalCount < 3 || verbalCount < 3) {
      throw {
        statusCode: 400,
        message: 'Assessment cannot start: The active question bank must contain at least 3 questions in Quantitative, Logical Reasoning, and Verbal categories.',
      };
    }

    // Get current settings
    const settings = await prisma.testSetting.findFirst();
    const durationMinutes = settings?.durationMinutes ?? 15;
    const passPercentage = settings?.passPercentage ?? 60.0;

    const startedAt = new Date();
    const deadlineAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);

    // Shuffle questions with Fisher-Yates
    const shuffled = [...activeQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Create attempt and question snapshots in transaction
    const attempt = await prisma.$transaction(async (tx) => {
      const createdAttempt = await tx.testAttempt.create({
        data: {
          candidateId: candidate.id,
          status: AttemptStatus.IN_PROGRESS,
          startedAt,
          deadlineAt,
          durationMinutes,
          passPercentage,
        },
      });

      // Insert AttemptQuestion snapshots
      const attemptQuestionsData = shuffled.map((q, idx) => ({
        attemptId: createdAttempt.id,
        questionId: q.id,
        orderIndex: idx + 1,
        questionText: q.text,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        category: q.category,
        difficulty: q.difficulty,
        explanation: q.explanation,
      }));

      await tx.attemptQuestion.createMany({
        data: attemptQuestionsData,
      });

      await tx.candidate.update({
        where: { id: candidate.id },
        data: { status: CandidateStatus.IN_PROGRESS },
      });

      return createdAttempt;
    });

    return this.getAssessment(attempt.id);
  }

  /**
   * Get current assessment state for candidate (safe: no answers or explanations exposed)
   */
  async getAssessment(attemptId: string) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        attemptQuestions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!attempt) {
      throw { statusCode: 404, message: 'Assessment attempt not found.' };
    }

    const now = new Date();

    // Check if time expired and status still IN_PROGRESS
    if (attempt.status === AttemptStatus.IN_PROGRESS && now > attempt.deadlineAt) {
      await this.submitAssessment(attempt.id, true);
      const completed = await this.getResult(attempt.id);
      return {
        attemptId: attempt.id,
        status: AttemptStatus.COMPLETED,
        isExpired: true,
        result: completed,
      };
    }

    const remainingSeconds = Math.max(
      0,
      Math.floor((attempt.deadlineAt.getTime() - now.getTime()) / 1000)
    );

    // Sanitize questions: strip correctOption and explanation!
    const sanitizedQuestions = attempt.attemptQuestions.map((q) => ({
      orderIndex: q.orderIndex,
      category: q.category,
      difficulty: q.difficulty,
      questionText: q.questionText,
      options: {
        A: q.optionA,
        B: q.optionB,
        C: q.optionC,
        D: q.optionD,
      },
      selectedOption: q.selectedOption,
      isMarkedForReview: q.isMarkedForReview,
      isAnswered: q.selectedOption !== null,
    }));

    return {
      attemptId: attempt.id,
      candidate: attempt.candidate,
      status: attempt.status,
      startedAt: attempt.startedAt,
      deadlineAt: attempt.deadlineAt,
      durationMinutes: attempt.durationMinutes,
      remainingSeconds,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Save or clear candidate's selected answer for a question
   */
  async saveAnswer(attemptId: string, orderIndex: number, selectedOption: OptionType | null) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw { statusCode: 404, message: 'Assessment attempt not found.' };
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw { statusCode: 400, message: 'This assessment is already completed.' };
    }

    if (new Date() > attempt.deadlineAt) {
      await this.submitAssessment(attemptId, true);
      throw { statusCode: 400, message: 'Test duration has elapsed. Your answers were submitted.' };
    }

    await prisma.attemptQuestion.update({
      where: {
        attemptId_orderIndex: {
          attemptId,
          orderIndex,
        },
      },
      data: {
        selectedOption,
        answeredAt: selectedOption ? new Date() : null,
      },
    });

    return { success: true, orderIndex, selectedOption };
  }

  /**
   * Toggle Mark for Review for a question
   */
  async markForReview(attemptId: string, orderIndex: number, isMarkedForReview: boolean) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw { statusCode: 404, message: 'Assessment attempt not found.' };
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw { statusCode: 400, message: 'This assessment is already completed.' };
    }

    if (new Date() > attempt.deadlineAt) {
      await this.submitAssessment(attemptId, true);
      throw { statusCode: 400, message: 'Test duration has elapsed.' };
    }

    await prisma.attemptQuestion.update({
      where: {
        attemptId_orderIndex: {
          attemptId,
          orderIndex,
        },
      },
      data: {
        isMarkedForReview,
      },
    });

    return { success: true, orderIndex, isMarkedForReview };
  }

  /**
   * Submit assessment and calculate score server-side
   */
  async submitAssessment(attemptId: string, isAutoSubmit = false) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        attemptQuestions: true,
        candidate: true,
      },
    });

    if (!attempt) {
      throw { statusCode: 404, message: 'Assessment attempt not found.' };
    }

    if (attempt.status === AttemptStatus.COMPLETED) {
      return this.getResult(attemptId);
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let marksDeducted = 0;

    // Evaluate each question using its snapshot
    const questionUpdates = attempt.attemptQuestions.map((q) => {
      let isCorrect: boolean | null = null;
      let marksAwarded = 0;

      if (q.selectedOption === null || q.selectedOption === undefined) {
        unattemptedCount++;
        isCorrect = null;
        marksAwarded = 0;
      } else if (q.selectedOption === q.correctOption) {
        correctCount++;
        isCorrect = true;
        marksAwarded = 2.0;
      } else {
        incorrectCount++;
        isCorrect = false;
        marksAwarded = -1.0;
        marksDeducted += 1.0;
      }

      return prisma.attemptQuestion.update({
        where: { id: q.id },
        data: {
          isCorrect,
          marksAwarded,
        },
      });
    });

    // Score calculations
    // Net Score = (Correct * 2) - (Incorrect * 1)
    const totalScore = correctCount * 2 - incorrectCount * 1;
    // Percentage = (Net Score / 20) * 100
    const percentage = Number(((totalScore / 20.0) * 100).toFixed(2));
    const isPassed = percentage >= attempt.passPercentage;
    const completedAt = new Date();

    // Execute in transaction
    await prisma.$transaction([
      ...questionUpdates,
      prisma.testAttempt.update({
        where: { id: attemptId },
        data: {
          status: AttemptStatus.COMPLETED,
          completedAt,
          totalScore,
          percentage,
          correctCount,
          incorrectCount,
          unattemptedCount,
          marksDeducted,
          isPassed,
        },
      }),
      prisma.candidate.update({
        where: { id: attempt.candidateId },
        data: { status: CandidateStatus.COMPLETED },
      }),
    ]);

    return this.getResult(attemptId);
  }

  /**
   * Get final score summary and result for candidate
   */
  async getResult(attemptId: string) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            highestQualification: true,
          },
        },
      },
    });

    if (!attempt) {
      throw { statusCode: 404, message: 'Result not found.' };
    }

    if (attempt.status !== AttemptStatus.COMPLETED && attempt.status !== AttemptStatus.TIMED_OUT) {
      throw { statusCode: 400, message: 'Assessment has not been completed yet.' };
    }

    const timeTakenSeconds = attempt.completedAt
      ? Math.max(0, Math.floor((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000))
      : attempt.durationMinutes * 60;

    return {
      attemptId: attempt.id,
      candidate: attempt.candidate,
      totalScore: attempt.totalScore ?? 0,
      maxPossibleScore: 20,
      percentage: attempt.percentage ?? 0,
      correctAnswers: attempt.correctCount ?? 0,
      incorrectAnswers: attempt.incorrectCount ?? 0,
      unattemptedQuestions: attempt.unattemptedCount ?? 0,
      marksDeducted: attempt.marksDeducted ?? 0,
      timeTakenSeconds,
      passPercentage: attempt.passPercentage,
      isPassed: attempt.isPassed ?? false,
      completedAt: attempt.completedAt,
    };
  }
}

export const assessmentService = new AssessmentService();
