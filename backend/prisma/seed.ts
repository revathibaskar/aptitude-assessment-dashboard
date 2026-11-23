import { PrismaClient, QuestionCategory, QuestionDifficulty, OptionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Database ---');

  // 1. Seed Admin
  const adminEmail = 'admin@assessment.com';
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@123456', salt);
    await prisma.admin.create({
      data: {
        name: 'Platform Administrator',
        email: adminEmail,
        passwordHash,
      },
    });
    console.log(`Admin account created: ${adminEmail} / Admin@123456`);
  } else {
    console.log(`Admin account already exists: ${adminEmail}`);
  }

  // 2. Seed Test Settings
  const settingsCount = await prisma.testSetting.count();
  if (settingsCount === 0) {
    await prisma.testSetting.create({
      data: {
        durationMinutes: 15,
        passPercentage: 60.0,
      },
    });
    console.log('Default test settings created: 15 mins, 60% pass mark');
  }

  // 3. Seed 10 Corporate Aptitude Questions
  const questionsData = [
    {
      text: "A subscription business plans a 20% price increase. What is the largest share of its customers it can lose before monthly revenue falls below today's level?",
      optionA: "16.7%",
      optionB: "20%",
      optionC: "15%",
      optionD: "18.3%",
      correctOption: OptionType.A,
      category: QuestionCategory.QUANTITATIVE,
      difficulty: QuestionDifficulty.MEDIUM,
      explanation: "Let initial price be P and customers be N, so Initial Revenue R0 = P * N. New price P' = 1.20P. Let x be customer loss fraction. New Revenue R' = 1.20P * (1 - x)N = 1.20(1 - x)R0. To prevent revenue drop: 1.20(1 - x) >= 1 => 1 - x >= 1/1.20 = 5/6 => x <= 1/6 ≈ 16.67% ≈ 16.7%.",
    },
    {
      text: "Six client meetings (P, Q, R, S, T, U) are scheduled Monday to Saturday, one per day. S is on Wednesday. R is the day immediately before U, and U is not on Saturday. Q is later in the week than both P and T. T is not on Monday. Which of the following must be true?",
      optionA: "P is on Monday",
      optionB: "Q is on Saturday",
      optionC: "R is on Thursday",
      optionD: "T is on Tuesday",
      correctOption: OptionType.B,
      category: QuestionCategory.LOGICAL_REASONING,
      difficulty: QuestionDifficulty.HARD,
      explanation: "S is on Wed. (R, U) are consecutive. Since U is not Sat, (R, U) can be either (Mon, Tue) or (Thu, Fri). In both cases, Q must be scheduled after both P and T. The latest available slot is Saturday. If Q were not on Saturday, either P or T would be on Saturday, violating 'Q is later than both P and T'. Hence, Q must be on Saturday in all valid configurations.",
    },
    {
      text: "Choose the grammatically correct sentence for a project update.",
      optionA: "Neither the manager nor the analysts was aware of the change.",
      optionB: "Neither the analysts nor the manager were aware of the change.",
      optionC: "Neither the manager nor the analysts were aware of the change.",
      optionD: "Neither the manager or the analysts were aware of the change.",
      correctOption: OptionType.C,
      category: QuestionCategory.VERBAL,
      difficulty: QuestionDifficulty.EASY,
      explanation: "With correlative conjunction 'neither... nor', the verb agrees with the subject closest to it. In sentence C, 'the analysts' is plural and is closest to the verb 'were'. In sentence A, 'was' is singular but 'analysts' is plural. In sentence B, 'manager' is singular but 'were' is plural. In sentence D, 'neither... or' is incorrect correlative pairing.",
    },
    {
      text: "A consulting firm charges $150/hour for senior consultants and $90/hour for junior consultants. On a client project, the ratio of senior to junior consultant hours logged was 3:5. If the firm's direct cost is $80/hour for seniors and $40/hour for juniors, what was the gross profit margin on this project?",
      optionA: "48.5%",
      optionB: "51.1%",
      optionC: "54.2%",
      optionD: "52.5%",
      correctOption: OptionType.B,
      category: QuestionCategory.QUANTITATIVE,
      difficulty: QuestionDifficulty.MEDIUM,
      explanation: "Consider a block of 3 senior and 5 junior hours. Total Revenue = (3 * $150) + (5 * $90) = $450 + $450 = $900. Total Cost = (3 * $80) + (5 * $40) = $240 + $200 = $440. Gross Profit = $900 - $440 = $460. Gross Margin = ($460 / $900) * 100 = 51.11% ≈ 51.1%.",
    },
    {
      text: "A fintech startup observed that customers who activated biometric two-factor authentication (2FA) experienced 80% fewer unauthorized transactions than those using SMS-based OTPs. The head of security concluded that requiring biometric 2FA for all users will reduce overall unauthorized platform transactions by 80%. Which of the following, if true, most seriously weakens the security head's conclusion?",
      optionA: "SMS-based OTP delivery incurs cellular gateway costs that biometric authentication does not.",
      optionB: "Users who proactively opt into biometric 2FA are significantly more vigilant about avoiding phishing scams than the average user.",
      optionC: "Biometric scanners on older smartphones occasionally fail to recognize registered fingerprints.",
      optionD: "Several competing financial platforms have recently adopted hardware security tokens instead of biometrics.",
      correctOption: OptionType.B,
      category: QuestionCategory.LOGICAL_REASONING,
      difficulty: QuestionDifficulty.MEDIUM,
      explanation: "The conclusion commits a correlation-versus-causation error through self-selection bias. If users who opted into biometric 2FA are already more vigilant against phishing scams, the lower unauthorized transactions were driven by user vigilance rather than biometric 2FA alone. Forcing it on non-vigilant users will not yield an 80% reduction.",
    },
    {
      text: "Identify the option that corrects the underlined portion: 'The executive committee commended the product division for having exceeded quarterly revenue targets, as well as their rapid resolution of the supply chain disruption.'",
      optionA: "as well as their rapid resolution of the supply chain disruption.",
      optionB: "and for rapidly resolving the supply chain disruption.",
      optionC: "along with resolving rapidly the disruption in supply chain.",
      optionD: "in addition to having rapidly been resolving the supply chain disruption.",
      correctOption: OptionType.B,
      category: QuestionCategory.VERBAL,
      difficulty: QuestionDifficulty.MEDIUM,
      explanation: "The sentence requires parallel grammatical structure following 'commended the product division [for...]': 'for having exceeded quarterly revenue targets and for rapidly resolving the supply chain disruption'. Option B provides precise parallelism and avoids the ambiguous pronoun 'their'.",
    },
    {
      text: "A SaaS company has fixed operating costs of $120,000 per month. It currently sells its software at $50 per user per month with variable hosting and support costs of $10 per user per month. The product team proposes a cloud tier upgrade that increases variable costs to $14 per user per month. If fixed costs remain unchanged, by what percentage must the user base expand beyond the current break-even volume to maintain break-even at a discounted price of $44 per user per month?",
      optionA: "25.0%",
      optionB: "33.3%",
      optionC: "40.0%",
      optionD: "28.5%",
      correctOption: OptionType.B,
      category: QuestionCategory.QUANTITATIVE,
      difficulty: QuestionDifficulty.HARD,
      explanation: "Current Contribution Margin = $50 - $10 = $40. Current Break-Even Volume = $120,000 / $40 = 3,000 users. New Contribution Margin = $44 - $14 = $30. New Break-Even Volume = $120,000 / $30 = 4,000 users. Percentage increase required = ((4,000 - 3,000) / 3,000) * 100 = (1,000 / 3,000) * 100 = 33.33% ≈ 33.3%.",
    },
    {
      text: "Five sprint deliverables (Alpha, Beta, Gamma, Delta, Epsilon) must be deployed sequentially across five consecutive release windows (Window 1 to Window 5). Beta must be deployed before Delta. Gamma cannot be deployed in Window 1 or Window 5. Alpha must be deployed immediately after Epsilon. If Delta is deployed in Window 3, which deliverable must be deployed in Window 2?",
      optionA: "Alpha",
      optionB: "Beta",
      optionC: "Gamma",
      optionD: "Epsilon",
      correctOption: OptionType.C,
      category: QuestionCategory.LOGICAL_REASONING,
      difficulty: QuestionDifficulty.HARD,
      explanation: "Delta is in Window 3. Beta must be before Delta, so Beta must be in Window 1 or 2. Epsilon and Alpha must be adjacent [Epsilon, Alpha]. They cannot occupy {1, 2} because that leaves no slot for Beta before Window 3. Therefore, [Epsilon, Alpha] must occupy Windows 4 and 5 (Window 4 = Epsilon, Window 5 = Alpha). The remaining deliverables {Beta, Gamma} must fill Windows 1 and 2. Since Gamma cannot be in Window 1, Gamma MUST be in Window 2, and Beta is in Window 1.",
    },
    {
      text: "Choose the word that most accurately completes the statement in an auditor's formal report: 'The internal audit revealed that the discrepancies in the inventory ledger were not intentional fraud, but rather the result of ______ oversight during the warehouse migration.'",
      optionA: "inadvertent",
      optionB: "surreptitious",
      optionC: "perfunctory",
      optionD: "ubiquitous",
      correctOption: OptionType.A,
      category: QuestionCategory.VERBAL,
      difficulty: QuestionDifficulty.EASY,
      explanation: "'Inadvertent' means not resulting from deliberate planning; unintentional. It correctly contrasts with 'intentional fraud'. 'Surreptitious' means secret/clandestine. 'Perfunctory' means carried out with minimal effort or reflection. 'Ubiquitous' means omnipresent.",
    },
    {
      text: "Consider the following corporate policy statements: 1. All senior analysts who manage cross-functional projects are eligible for executive coaching. 2. No employee eligible for executive coaching is exempted from the annual peer review. 3. Some department leads are senior analysts who manage cross-functional projects. Which of the following conclusions must logically follow?",
      optionA: "All department leads are eligible for executive coaching.",
      optionB: "Some department leads are not exempted from the annual peer review.",
      optionC: "Anyone who undergoes annual peer review is eligible for executive coaching.",
      optionD: "No senior analyst is exempted from annual peer review.",
      correctOption: OptionType.B,
      category: QuestionCategory.LOGICAL_REASONING,
      difficulty: QuestionDifficulty.MEDIUM,
      explanation: "By Statement 3, there are department leads who are senior analysts managing cross-functional projects. By Statement 1, these department leads are eligible for executive coaching. By Statement 2, those eligible for executive coaching are not exempted from annual peer review. Therefore, some department leads are not exempted from the annual peer review.",
    },
  ];

  // Upsert questions
  for (const q of questionsData) {
    const existing = await prisma.question.findFirst({
      where: { text: q.text },
    });

    if (!existing) {
      await prisma.question.create({
        data: {
          ...q,
          isActive: true,
        },
      });
    }
  }

  const totalQuestions = await prisma.question.count();
  const activeQuestions = await prisma.question.count({ where: { isActive: true } });
  console.log(`Questions seeded. Total: ${totalQuestions}, Active: ${activeQuestions}`);
  console.log('--- Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

