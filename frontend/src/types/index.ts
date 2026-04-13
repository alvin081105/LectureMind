// ─── Auth ───────────────────────────────────────────────────────────────────

export type Role = 'STUDENT' | 'PROFESSOR';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// 백엔드 LoginResponse: { accessToken, refreshToken, user: { id, email, name, role } }
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// 백엔드 TokenResponse (refresh): { accessToken, refreshToken }
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── Lecture ─────────────────────────────────────────────────────────────────

export type LectureStatus = 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// 백엔드 LectureResponse
export interface Lecture {
  lectureId: number;
  title: string;
  status: LectureStatus;
  duration?: string;
  fileSize?: string;
  createdAt: string;
}

// 백엔드 LectureDetailResponse
export interface LectureDetailResponse {
  lectureId: number;
  title: string;
  status: LectureStatus;
  transcript?: string;
  duration?: string;
  fileSize?: string;
  createdAt: string;
  hasNote: boolean;
  hasAnalysis: boolean;
}

// 백엔드 LectureStatusResponse
export interface LectureStatusResponse {
  lectureId: number;
  status: LectureStatus;
}

// ─── Bloom ────────────────────────────────────────────────────────────────────

export type BloomLevel =
  | 'REMEMBER'
  | 'UNDERSTAND'
  | 'APPLY'
  | 'ANALYZE'
  | 'EVALUATE'
  | 'CREATE';

// ─── Note ─────────────────────────────────────────────────────────────────────

export interface NoteSection {
  id: string;
  title: string;
  content: string;
  bloomLevel: BloomLevel;
  children?: NoteSection[];
}

// 백엔드 NoteResponse
export interface Note {
  noteId: number;
  lectureId: number;
  title: string;
  sections: NoteSection[];  // content 필드명이 sections
  keywords: string[];
  createdAt: string;
}

// 백엔드 NoteListResponse
export interface NoteListItem {
  noteId: number;
  lectureId: number;
  title: string;
  keywordCount: number;
  createdAt: string;
}

// 백엔드 NoteGenerateResponse (비동기 - noteId만 반환)
export interface NoteGenerateResponse {
  noteId: number;
  lectureId: number;
  status: string;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export type QuizType =
  | 'OX'
  | 'MULTIPLE_CHOICE'
  | 'FILL_BLANK'
  | 'SCENARIO'
  | 'SHORT_ANSWER';

// 백엔드 QuizSetResponse.QuizItem
export interface Quiz {
  quizId: number;
  bloomLevel: BloomLevel;
  type: QuizType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

// 백엔드 QuizSetResponse
export interface QuizSet {
  quizSetId: number;
  noteId: number;
  quizzes: Quiz[];
}

// 백엔드 QuizSubmitRequest.Answer
export interface QuizAnswer {
  quizId: number;
  userAnswer: string;
}

// 백엔드 QuizResultResponse
export interface QuizResult {
  quizSetId: number;
  totalCount: number;
  correctCount: number;
  scorePercent: number;
  scoreByLevel: Record<BloomLevel, { total: number; correct: number }>;
  results: {
    quizId: number;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    feedback?: string;
  }[];
  weakLevels: BloomLevel[];
  submittedAt: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

// 백엔드 ChatSessionResponse
export interface ChatSession {
  sessionId: number;
  noteId: number;
  lectureTitle: string;
  createdAt: string;
}

// 백엔드 ChatMessageResponse
export interface ChatMessage {
  messageId: number;
  role: string;       // 'USER' | 'ASSISTANT'
  content: string;
  bloomLevel?: BloomLevel;
  suggestion?: string;
  createdAt: string;
}

// ─── Analysis (Professor) ─────────────────────────────────────────────────────

export type AnalysisStatus = 'ANALYZING' | 'COMPLETED' | 'FAILED';

export type IssueType =
  | 'DIFFICULTY_SPIKE'
  | 'MISSING_PREREQUISITE'
  | 'INSUFFICIENT_EXPLANATION';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DifficultyPoint {
  time: string;
  difficulty: number;
  issueType?: IssueType;
}

export interface Improvement {
  id: string;
  targetSection: string;
  startTime: string;
  endTime?: string;
  issueType: IssueType;
  issue: string;
  suggestion: string;
  priority: Priority;
}

export interface AnalysisSummary {
  topic: string;
  duration: string;
  conceptCount: number;
  bloomDistribution: Record<BloomLevel, number>;
}

// 백엔드 AnalysisResponse
export interface Analysis {
  analysisId: number;
  lectureId: number;
  status: AnalysisStatus;
  summary?: AnalysisSummary;
  difficultyTimeline?: DifficultyPoint[];
  improvements?: Improvement[];
  createdAt: string;
}

// 백엔드 AnalysisListResponse
export interface AnalysisListItem {
  analysisId: number;
  lectureId: number;
  lectureTitle: string;
  status: AnalysisStatus;
  issueCount: number;
  highPriorityCount: number;
  createdAt: string;
}

// 백엔드 AnalysisGenerateResponse (비동기)
export interface AnalysisGenerateResponse {
  analysisId: number;
  lectureId: number;
  status: string;
}

// ─── Learning Path ────────────────────────────────────────────────────────────

// 백엔드 DiagnosisResponse
export interface LearningDiagnosis {
  lectureId: number;
  lectureTitle: string;
  overallScore: number;
  levelScores: Record<string, number>;
  weakLevels: string[];
  strongLevels: string[];
  recommendation: string;
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
}

// 백엔드 ReviewScheduleResponse
export interface ReviewSchedule {
  lectureId: number;
  lectureTitle: string;
  lastReviewDate?: string;
  nextReviewDate: string;
  reviewCount: number;
  retentionRate: number;
  isOverdue: boolean;
}

// ─── API Common ───────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
