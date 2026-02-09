# 영업팀 일일업무보고 웹앱 (Mobile MVP)

영업사원이 이동 중에도 스마트폰으로 1분 내에 보고서를 작성할 수 있도록 최적화된 모바일 전용 웹앱입니다.

## 주요 기능

- **오늘 보고 작성**: 큰 버튼 UI와 고객사 자동 완성/생성으로 빠른 입력 지원 (방문/전화/메일).
- **고객사 히스토리**: 검색한 고객사의 과거 모든 활동을 타임라인 형태로 확인.
- **내 보고 목록**: 본인이 작성한 활동 내역 리스트.
- **관리자 대시보드**: 팀 전체 활동 통계 및 14일 이상 미방문 휴면 고객사 자동 표시.

## 기술 스택

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion
- **Backend/DB**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 시작하기

### 1. DB 설정 (Supabase)

Supabase 프로젝트를 생성한 후, SQL Editor에서 제공된 `supabase_schema.sql` 파일의 내용을 실행하여 테이블과 트리거를 생성하세요.

### 2. 환경 변수 설정

`.env.local` 파일을 열고 본인의 Supabase URL과 Anon Key를 입력하세요.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 프로젝트 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속 후 모바일 뷰(F12 -> Device Mode)로 확인하세요.

## 디자인 철학

- **Mobile-first**: 모든 UI가 한 손 조작에 최적화되어 있습니다.
- **Premium Look**: Glassmorphism 디자인과 매끄러운 애니메이션을 적용했습니다.
- **Efficiency**: 입력을 최소화하고 검색과 자동화를 극대화했습니다.
