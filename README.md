# 대한재활의학과의사회 홈페이지

Next.js App Router와 OpenNext를 사용해 Cloudflare Workers에서 실행합니다. D1에 회원·연회비·행사·상담·게시물·자료 메타데이터를 저장하고, 자료 원본은 비공개 R2 버킷에서 제공합니다. 공식 이미지와 무료 Noto Sans KR 글꼴은 프로젝트가 직접 제공합니다.

## 로컬 실행

Node 24.22.3 이상에서 아래 명령을 실행합니다. Windows의 Node 24.12에서는 OpenNext의 디렉터리 복사가 중단되는 현상을 확인했습니다.

```sh
npm ci
npm run db:local
npm run dev
```

회원 가입은 `/member/join`, 회원 로그인은 `/member/login`, 사무국 관리는 `/admin`입니다. 최초 관리자는 실제 담당자가 가입한 뒤, 해당 계정의 이메일과 본인 확인을 마치고 D1 콘솔에서 정확한 회원 ID 한 건의 role을 staff로 바꿉니다. 공개 가입은 항상 일반 회원을 생성합니다.

## Cloudflare Workers 배포

1. 대상 Cloudflare 계정에 Wrangler로 로그인한 뒤 전용 리소스를 준비합니다. D1 이름은 `kpa-portal-db`, 비공개 R2 버킷 이름은 `kpa-portal-files`입니다. 이미 준비된 리소스를 사용하려면 설정 파일의 이름을 해당 값으로 맞춥니다.
2. Worker 이름은 `korea-rehabilitation`이며 운영 D1의 UUID는 `wrangler.jsonc`에 설정되어 있습니다. 바인딩 이름은 D1이 `DB`, R2가 `FILES`입니다.
3. 배포 명령은 대상 D1의 미적용 마이그레이션을 먼저 실행하고 성공하면 Worker를 배포합니다. Cloudflare 빌드 토큰에 해당 D1의 편집 권한이 필요합니다.
4. `npm run cf:build`로 배포 번들을 생성합니다. `npm run preview`는 로컬 Workers 런타임을 실행합니다. 확인 후 `npm run deploy`로 빌드된 버전을 대상 Worker에 올립니다. Cloudflare 빌드 설정도 빌드 명령은 `npm run cf:build`, 배포 명령은 `npm run deploy`입니다.
5. 배포된 Worker에서 관리자 역할·회비 확인·행사 등록·R2 다운로드를 점검한 후 커스텀 도메인을 연결합니다. 로컬 데이터와 운영 D1/R2는 별개입니다.

```sh
npx wrangler d1 create kpa-portal-db
npx wrangler r2 bucket create kpa-portal-files
```

## 기존 홈페이지와 도메인 전환

기본 대표 주소는 `https://www.rm.or.kr`입니다. 대표 주소 변경 시 빌드 환경에 `NEXT_PUBLIC_SITE_URL`을 지정합니다. `NEXT_PUBLIC_LEGACY_URL`은 기존 시스템의 원문·회원용 자료를 제공하는 주소입니다. 도메인을 새 사이트로 전환하기 **전에** 기존 홈페이지가 다른 주소에서도 동작하도록 준비하고 해당 주소를 지정해 다시 빌드합니다. 대체 주소의 로그인·첨부파일·원문 연결까지 확인합니다. 기존 공개 행사·고시 일부의 쿼리 주소는 새 상세 주소로 연결됩니다.

기존 회원·연회비·행사 신청 데이터는 추후 제공될 내보내기 자료를 기준으로 이관합니다. 중복 회원의 식별 기준, 입금확인·취소·대기 상태의 대응 관계, 비밀번호 형식, 연도별 회비 건수와 합계를 대조한 뒤 운영 데이터에 반영합니다. 실제 계정 자료를 소스나 공개 폴더에 넣지 않습니다.

## 운영

- 사무국에서 공지·보험자료의 초안과 공개 상태, 병의원 공개 동의, 행사 접수·정원, 연회비·참가비 입금, 비공개 상담 답변을 관리합니다.
- 영상·문서 업로드는 사무국 자료 관리에서 진행합니다. 10MB를 넘는 파일은 비공개 R2 버킷의 `incoming/` 아래에 먼저 올리고 관리자 화면에서 기존 객체를 연결합니다.
- 실입금 확인 후 영수증이 생성됩니다. 외부 카드결제나 문자 발송 계정은 연결되어 있지 않습니다.
- 서버에서 렌더링한 개별 제목·설명·대표 URL, 사이트맵, robots.txt와 페이지별 조직·행사·질문답변·탐색경로 구조화 데이터를 제공합니다. 운영 도메인 연결 후 `/sitemap.xml`을 검색엔진에 제출할 수 있습니다.
- 공식 자산의 출처는 `lib/legacy.json`에, 글꼴 라이선스는 `public/fonts/OFL.txt`에 있습니다.
