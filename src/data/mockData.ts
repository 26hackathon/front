// ─────────────────────────────────────────────
// Mock Data — BrickFlow AI
// 실제 API 연동 전 사용하는 목 데이터 중앙 관리 파일
// ─────────────────────────────────────────────

// ── 프로젝트 ──────────────────────────────────
export interface Project {
  id: string;
  title: string;
  info: string;
  status: string;
  time: string;
  progress: number;
  isDone: boolean;
  image: string;
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Titanic',
    info: 'Creator Expert 10294',
    status: 'Step 31/48 • 9,090피스',
    time: '어제',
    progress: 0.65,
    isDone: false,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'proj-2',
    title: 'Ferrari Daytona SP3',
    info: 'Technic 42143',
    status: '완성 • 3,778피스',
    time: '3일 전',
    progress: 1.0,
    isDone: true,
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'proj-3',
    title: 'Eiffel Tower',
    info: 'Icons 10307',
    status: 'Step 8/60 • 10,001피스',
    time: '1주 전',
    progress: 0.13,
    isDone: false,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'proj-4',
    title: 'Eiffel Tower',
    info: 'Icons 10307',
    status: 'Step 8/60 • 10,001피스',
    time: '1주 전',
    progress: 0.13,
    isDone: false,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'proj-5',
    title: 'Eiffel Tower',
    info: 'Icons 10307',
    status: 'Step 8/60 • 10,001피스',
    time: '1주 전',
    progress: 0.13,
    isDone: false,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
  },
];

// 프로젝트 이어하기 (현재 진행 중인 것)
export const MOCK_ACTIVE_PROJECT = MOCK_PROJECTS[0];

// ── 조립 단계 ─────────────────────────────────
export interface AssemblyStep {
  step: number;
  title: string;
  minutes: number;
  image: string;
}

export const MOCK_ASSEMBLY_STEPS: AssemblyStep[] = [
  { step: 1, title: '계단 조립', minutes: 2, image: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?auto=format&fit=crop&w=600&q=80' },
  { step: 2, title: '계단 조립', minutes: 3, image: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?auto=format&fit=crop&w=600&q=80' },
  { step: 3, title: '계단 조립', minutes: 3, image: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?auto=format&fit=crop&w=600&q=80' },
  { step: 4, title: '계단 조립', minutes: 3, image: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?auto=format&fit=crop&w=600&q=80' },
  { step: 5, title: '계단 조립', minutes: 4, image: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?auto=format&fit=crop&w=600&q=80' },
  { step: 6, title: '계단 조립', minutes: 3, image: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?auto=format&fit=crop&w=600&q=80' },
  { step: 7, title: '계단 조립', minutes: 5, image: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?auto=format&fit=crop&w=600&q=80' },
];

// ── 프로필 ────────────────────────────────────
export interface ActivityItem {
  id: string;
  dotColor: string;
  text: string;
  time: string;
}

export const MOCK_USER_STATS = {
  completedSets: 12,
  totalBricks: '4.2만',
  scanAccuracy: '97.3%',
};

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'act-1', dotColor: '#39D353', text: '배틀팩 #75267 — 전체 완성', time: '오늘 14:32' },
  { id: 'act-2', dotColor: '#FF9F43', text: 'Step 31 검증 완료 (Titanic)', time: '어제' },
  { id: 'act-3', dotColor: '#6C63FF', text: '에펠탑 Step 8 저장됨', time: '3일 전' },
  { id: 'act-4', dotColor: '#8B8FA3', text: '소방서 세트 스캔 완료', time: '1주 전' },
];

export interface SettingItem {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  subtitle?: string;
}

export const MOCK_APP_SETTINGS: SettingItem[] = [
  { id: 'setting-notif', icon: 'notifications', iconColor: '#FF2E2E', title: '알림', subtitle: '새 업데이트, 완료 축하' },
  { id: 'setting-dark', icon: 'moon', iconColor: '#6C63FF', title: '다크 모드', subtitle: '항상 켜짐' },
];

export const MOCK_ACCOUNT_SETTINGS: SettingItem[] = [
  { id: 'setting-privacy', icon: 'shield-checkmark', iconColor: '#10B981', title: '개인정보 및 보안' },
  { id: 'setting-help', icon: 'help-circle', iconColor: '#FF9F43', title: '도움말 및 지원' },
];
