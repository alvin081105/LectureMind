# LectureMind

> AI 기반 강의 분석 & 구조화 학습 플랫폼

강의 음성 파일을 업로드하면 Whisper STT와 Claude AI가 자동으로 노트를 정리하고, 퀴즈를 생성하며, 강의 품질 분석 리포트를 제공합니다.

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| 🎙️ AI 음성 인식 (STT) | Whisper AI로 MP3·MP4 강의를 텍스트로 자동 변환 |
| 📝 구조화 노트 생성 | 블룸 분류 체계 기반 Claude AI 자동 노트 정리 |
| 🧠 맞춤형 퀴즈 | 학습 수준에 맞는 퀴즈 자동 생성 및 오답 관리 |
| 📊 강의 분석 리포트 | 난이도 타임라인, 블룸 분포, AI 개선 제안 |
| 🔄 간격 반복 학습 | 망각 곡선 기반 최적 복습 일정 자동 설정 |
| 📄 PDF 내보내기 | 분석 리포트 PDF 저장 |
| 🌙 다크 모드 | 시스템 설정 연동 및 수동 전환 지원 |
| 📱 모바일 반응형 | 모든 화면 크기 지원 |

---

## 기술 스택

### Backend
- **Java 17** / **Spring Boot 3.5**
- Spring Security (JWT 인증)
- Spring Data JPA + MySQL
- WebSocket (실시간 상태 업데이트)
- OpenAI Whisper API (STT)
- Anthropic Claude API (AI 분석)
- OpenPDF (PDF 생성)

### Frontend
- **React 18** + **TypeScript**
- Tailwind CSS v4
- Zustand (상태 관리)
- React Router v7
- Axios

---

## 시작하기

### 사전 요구사항

- Java 17+
- Node.js 18+
- MySQL 8.0+

### 환경 변수 설정

`backend/src/main/resources/application-local.yaml` 파일에 아래 값을 입력하세요.

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/lecturemind
    username: your_db_user
    password: your_db_password

anthropic:
  api-key: sk-ant-...

openai:
  api-key: sk-proj-...
```

### 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

서버가 `http://localhost:8081`에서 실행됩니다.

### 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

앱이 `http://localhost:5173`에서 실행됩니다.

---

## 프로젝트 구조

```
LectureMind/
├── backend/
│   └── src/main/java/com/lecturemind/backend/
│       ├── controller/      # REST API 엔드포인트
│       ├── service/         # 비즈니스 로직
│       ├── domain/          # JPA 엔티티
│       ├── repository/      # 데이터 접근
│       ├── dto/             # 요청/응답 DTO
│       └── common/          # 설정, 예외, 유틸
└── frontend/
    └── src/
        ├── pages/           # 라우트별 페이지
        │   ├── student/     # 학생 전용 페이지
        │   └── professor/   # 교수자 전용 페이지
        ├── components/      # 재사용 컴포넌트
        ├── api/             # API 클라이언트
        ├── store/           # Zustand 상태 관리
        ├── hooks/           # 커스텀 훅
        └── types/           # TypeScript 타입 정의
```

---

## API 문서

백엔드 실행 후 Swagger UI에서 확인할 수 있습니다.

```
http://localhost:8081/swagger-ui/index.html
```

---

## 사용 흐름

```
강의 파일 업로드 (MP3/MP4)
       ↓
Whisper STT → 텍스트 변환
       ↓
Claude AI → 구조화 노트 + 퀴즈 + 분석 리포트 생성
       ↓
학생: 노트 열람 → 퀴즈 풀기 → 오답 복습 → 간격 반복
교수: 분석 리포트 확인 → PDF 내보내기 → 강의 개선
```

---

## 역할별 기능

### 학생
- 강의별 AI 노트 열람
- 맞춤형 퀴즈 응시 및 결과 확인
- 오답 노트 자동 관리
- 간격 반복 학습 경로 확인

### 교수자
- 강의 업로드 및 분석 요청
- 난이도 타임라인 · 블룸 분류 분포 확인
- AI 강의 개선 제안 열람
- 분석 리포트 PDF 내보내기

---

## 라이선스

MIT License
