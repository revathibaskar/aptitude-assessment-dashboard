export type OptionType = 'A' | 'B' | 'C' | 'D';
export type QuestionCategory = 'QUANTITATIVE' | 'LOGICAL_REASONING' | 'VERBAL';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  age: number;
  phoneNumber: string;
  gender?: string | null;
  highestQualification: string;
  city?: string | null;
  status: 'REGISTERED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface QuestionData {
  orderIndex: number;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  selectedOption: OptionType | null;
  isMarkedForReview: boolean;
  isAnswered: boolean;
}

export interface AssessmentAttempt {
  attemptId: string;
  candidate: {
    id: string;
    fullName: string;
    email: string;
  };
  status: 'IN_PROGRESS' | 'COMPLETED' | 'TIMED_OUT';
  startedAt: string;
  deadlineAt: string;
  durationMinutes: number;
  remainingSeconds: number;
  questions: QuestionData[];
}

export interface AssessmentResult {
  attemptId: string;
  candidate: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    highestQualification?: string;
  };
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattemptedQuestions: number;
  marksDeducted: number;
  timeTakenSeconds: number;
  passPercentage: number;
  isPassed: boolean;
  completedAt: string;
}

export interface QuestionAdminItem {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: OptionType;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  explanation?: string | null;
  isActive: boolean;
  createdAt: string;
}

