import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type RaidMode = "remote" | "local";
export type PostKind = "shiny" | "ditto" | "shadow" | "hundo";

export type Member = {
  id: string;
  name: string;
  code: string;
  vip: boolean;
  ready: boolean;
  dps?: number;
  isSelf?: boolean;
};

export type Formation = { id: string; name: string; description: string; dps: number };
export type SpeedrunEntry = {
  id: string;
  team: string;
  boss: string;
  seconds: number;
  reward: number;
  badge: string;
};
export type Siren = {
  id: string;
  host: string;
  message: string;
  roomId: string;
  createdAt: number;
  expiresAt: number;
};
export type Lottery = {
  enabled: boolean;
  entries: string[];
  winner?: string;
  pot: number;
  proofs?: Record<string, string>;
  verified?: string[];
};
export type BillingRecord = {
  id: string;
  username: string;
  type: "manual_adjust" | "reward" | "charge" | "lottery" | "deposit";
  amount: number;
  reason: string;
  balanceAfter: number;
  createdAt: number;
};

export type Room = {
  id: string;
  boss: string;
  gym: string;
  cp: number;
  type: string;
  minutes: number;
  mode: RaidMode;
  capacity: number;
  hostName: string;
  hostCode: string;
  password: string;
  queue: Member[];
  launched: boolean;
  battleEndsAt?: number;
  battleEnded?: boolean;
  settled?: boolean;
  createdAt: number;
  formationId: string;
  lottery: Lottery;
};

export type Comment = { id: string; author: string; text: string };

export type Post = {
  id: string;
  author: string;
  kind: PostKind;
  text: string;
  location: string;
  image?: string;
  iv: { a: number; d: number; s: number };
  likes: number;
  liked: boolean;
  comments: Comment[];
  createdAt: number;
};

export type Profile = {
  trainerName: string;
  gameCode: string;
  friendCode: string;
  level: number;
  vip: boolean;
  coins: number;
  badges: string[];
};

export type AuthUser = {
  username: string;
  role: "player" | "admin";
  trainerCode: string;
};
export type LoginResult = false | "player" | "admin";

export type FinanceOrder = {
  id: string;
  kind: "deposit";
  username: string;
  amount: number;
  coins: number;
  status: "pending" | "approved" | "rejected";
  proof?: string;
  accountInfo: string;
  contact: string;
  createdAt: number;
};

export type Account = { username: string; password: string; profile: Profile };
export type FriendRequest = {
  id: string;
  from: string;
  to: string;
  status: "pending" | "accepted";
};
export type ChatMessage = {
  id: string;
  from: string;
  to?: string;
  roomId?: string;
  text: string;
  image?: string;
  createdAt: number;
};
export type SecurityLog = {
  id: string;
  category: "chat" | "billing" | "lottery" | "auth";
  severity: "info" | "warning" | "critical";
  actor: string;
  action: string;
  detail: string;
  createdAt: number;
};

export const CHAT_SAFETY_NOTICE = "本平台仅供组队交流，严禁私下进行宝可梦、账号或道具买卖交易";
const BLOCKED_CHAT_TERMS = [
  "买卖",
  "出售",
  "软妹币",
  "微信转账",
  "支付宝",
  "rmb",
  "rmt",
  "卖怪",
  "买怪",
];

export function hasBlockedChatTerm(text: string) {
  const normalized = text.toLowerCase();
  return BLOCKED_CHAT_TERMS.some((term) => normalized.includes(term));
}

type StoredAccount = {
  username: string;
  password: string;
  profile: Profile;
};

export const FORMATIONS: Formation[] = [
  { id: "mega", name: "Mega 核心爆发", description: "高压速推，适合竞速榜冲刺", dps: 920 },
  { id: "weather", name: "天气增幅队", description: "稳定输出，兼顾容错与续航", dps: 760 },
  { id: "counter", name: "属性克制队", description: "针对 Boss 弱点，均衡高效", dps: 830 },
];

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "5500123488htk";
const LEGACY_ADMIN_NAMES = new Set(["wudi", "wudi0693"]);
const SIREN_DURATION_MS = 10 * 1000;
const SIREN_COST = 5;
const DEPOSIT_PACKAGES = [
  { id: "mini", label: "$0.99", usd: 0.99, coins: 100 },
  { id: "starter", label: "$4.99", usd: 4.99, coins: 500 },
  { id: "classic", label: "$9.99", usd: 9.99, coins: 1000 },
  { id: "vip", label: "$19.99", usd: 19.99, coins: 2000 },
] as const;

const WORDS = [
  "Pikachu",
  "Bulbasaur",
  "Charmander",
  "Squirtle",
  "Eevee",
  "Snorlax",
  "Gengar",
  "Lapras",
  "Dratini",
  "Mewtwo",
];

export function generatePassword() {
  const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];
  const a = pick();
  let b = pick();
  let c = pick();
  while (b === a) b = pick();
  while (c === a || c === b) c = pick();
  return `${a}-${b}-${c}`;
}

function randCode() {
  const n = () => String(Math.floor(1000 + Math.random() * 9000));
  return `${n()} ${n()} ${n()}`;
}

const uid = () => Math.random().toString(36).slice(2, 10);

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readStoredList<T>(key: string, fallback: T[] = []): T[] {
  const value = readStored<unknown>(key, []);
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function writeStored<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Ignore unavailable or full storage. */
  }
}

function removeStored(key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* Ignore unavailable storage. */
  }
}

function seedFinanceOrders(): FinanceOrder[] {
  return [
    {
      id: "ORD-24091",
      kind: "deposit",
      username: "MistyGo",
      amount: 6,
      coins: 300,
      status: "pending",
      proof: "",
      accountInfo: "USDT TRC20 · TQnexus-demo",
      contact: "Telegram @mistygo",
      createdAt: Date.now() - 3600000,
    },
  ];
}

function seedRooms(): Room[] {
  return [
    {
      id: uid(),
      boss: "Mewtwo",
      gym: "Shibuya Crossing Gym",
      cp: 54148,
      type: "Psychic",
      minutes: 38,
      mode: "remote",
      capacity: 10,
      hostName: "NeonTrainer",
      hostCode: randCode(),
      password: generatePassword(),
      launched: false,
      createdAt: Date.now() - 120000,
      queue: [
        { id: uid(), name: "ShinyHunterJP", code: randCode(), vip: true, ready: true, dps: 840 },
        { id: uid(), name: "KimRaidKing", code: randCode(), vip: false, ready: true, dps: 710 },
        { id: uid(), name: "阿杰打团", code: randCode(), vip: false, ready: false, dps: 620 },
      ],
      formationId: "counter",
      lottery: { enabled: true, entries: ["ShinyHunterJP", "KimRaidKing"], pot: 10 },
    },
    {
      id: uid(),
      boss: "Rayquaza",
      gym: "KLCC Park Gym",
      cp: 51968,
      type: "Dragon",
      minutes: 21,
      mode: "local",
      capacity: 5,
      hostName: "NeonTrainer",
      hostCode: randCode(),
      password: generatePassword(),
      launched: false,
      createdAt: Date.now() - 300000,
      queue: [{ id: uid(), name: "MistyGo", code: randCode(), vip: false, ready: false, dps: 650 }],
      formationId: "weather",
      lottery: { enabled: false, entries: [], pot: 0 },
    },
  ];
}

function seedPosts(): Post[] {
  return [
    {
      id: uid(),
      author: "ShinyHunterJP",
      kind: "shiny",
      text: "街中で色違いゲット！5000回目の遭遇でようやく…",
      location: "Shibuya, Tokyo",
      image: "shiny",
      iv: { a: 15, d: 14, s: 15 },
      likes: 128,
      liked: false,
      comments: [
        { id: uid(), author: "KimRaidKing", text: "축하합니다! 부럽네요 🔥" },
        { id: uid(), author: "阿杰打团", text: "运气太好了吧！" },
      ],
      createdAt: Date.now() - 600000,
    },
    {
      id: uid(),
      author: "NeonTrainer",
      kind: "shadow",
      text: "Shadow catch of the night — 96% and ready for the raid meta.",
      location: "KLCC Park",
      image: "shadow",
      iv: { a: 15, d: 14, s: 14 },
      likes: 74,
      liked: false,
      comments: [{ id: uid(), author: "MistyGo", text: "Nice one!" }],
      createdAt: Date.now() - 1800000,
    },
    {
      id: uid(),
      author: "NeonTrainer",
      kind: "hundo",
      text: "百分百个体值，直接满级培养！",
      location: "Bukit Bintang",
      iv: { a: 15, d: 15, s: 15 },
      likes: 210,
      liked: false,
      comments: [],
      createdAt: Date.now() - 5400000,
    },
  ];
}

type StoreValue = {
  profile: Profile;
  setProfile: (p: Profile) => void;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  register: (username: string, password: string, trainerCode: string) => boolean;
  login: (username: string, password: string) => LoginResult;
  logout: () => void;
  rooms: Room[];
  posts: Post[];
  createRoom: (
    r: Omit<Room, "id" | "queue" | "launched" | "createdAt" | "formationId" | "lottery" | "gym"> & {
      formationId?: string;
      lottery?: Lottery;
      gym?: string;
    },
  ) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  toggleReady: (roomId: string, memberId: string) => void;
  kick: (roomId: string, memberId: string) => void;
  launchRoom: (roomId: string) => void;
  endBattle: (roomId: string) => void;
  removeRoom: (roomId: string) => void;
  addPost: (p: Omit<Post, "id" | "likes" | "liked" | "comments" | "createdAt" | "author">) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  removePost: (postId: string) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  copy: (text: string, msg: string) => void;
  sirens: Siren[];
  broadcastSiren: (roomId: string) => void;
  leaderboard: SpeedrunEntry[];
  setFormation: (roomId: string, formationId: string) => void;
  toggleLottery: (roomId: string) => void;
  joinLottery: (roomId: string) => void;
  submitLotteryProof: (roomId: string, proof: string) => void;
  settleRoom: (roomId: string, catchType: "shiny" | "hundo" | "normal") => void;
  forceSettleLottery: (
    roomId: string,
    decision: "winner" | "refund" | "confiscate",
    winner?: string,
  ) => void;
  addCoins: (amount: number, reason: string) => void;
  buyVip: () => void;
  accounts: Account[];
  frozenAccounts: string[];
  financeOrders: FinanceOrder[];
  billingRecords: BillingRecord[];
  submitDeposit: (
    input: Omit<FinanceOrder, "id" | "kind" | "username" | "status" | "createdAt">,
  ) => void;
  reviewFinanceOrder: (id: string, decision: "approved" | "rejected") => void;
  toggleFrozenAccount: (username: string) => void;
  updateAccount: (username: string, profile: Profile, password?: string) => void;
  toggleAccountVip: (username: string) => void;
  resetAccountPassword: (username: string, password: string) => void;
  resetAccountFriendCode: (username: string) => void;
  manualAdjustBalance: (username: string, amount: number, reason: string) => void;
  forceLaunchRoom: (roomId: string) => void;
  forceKickMember: (roomId: string, memberId: string) => void;
  isAccountFrozen: (username: string) => boolean;
  securityLogs: SecurityLog[];
  friendRequests: FriendRequest[];
  friends: string[];
  onlineUsers: string[];
  sendFriendRequest: (username: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  sendRoomMessage: (roomId: string, text: string, image?: string) => void;
  roomMessages: (roomId: string) => ChatMessage[];
  sendDirectMessage: (username: string, text: string, image?: string) => void;
  directMessages: (username: string) => ChatMessage[];
  directChatTarget: string | null;
  openDirectChat: (username: string) => void;
  closeDirectChat: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const defaultProfile: Profile = {
  trainerName: "GuestTrainer",
  gameCode: "GUESTTRAINER",
  friendCode: "0000 0000 0000",
  level: 1,
  vip: false,
  coins: 100,
  badges: [],
};
const adminProfile: Profile = {
  trainerName: "GM Admin",
  gameCode: "GM-ADMIN",
  friendCode: "0000 0000 0000",
  level: 99,
  vip: true,
  coins: 0,
  badges: ["GM"],
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(defaultProfile);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const stored = readStoredList<Account>("raid-nexus-accounts");
    return stored.filter((account) => !LEGACY_ADMIN_NAMES.has(account.username.toLowerCase()));
  });
  const [frozenAccounts, setFrozenAccounts] = useState<string[]>(() =>
    readStoredList<string>("raid-nexus-frozen"),
  );
  const [financeOrders, setFinanceOrders] = useState<FinanceOrder[]>(() =>
    readStoredList("raid-nexus-finance", seedFinanceOrders()),
  );
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>(() =>
    readStoredList<BillingRecord>("raid-nexus-billing"),
  );
  const [rooms, setRooms] = useState<Room[]>(() => {
    const stored = readStored<unknown>("raid-nexus-rooms", null);
    return Array.isArray(stored) ? (stored as Room[]) : seedRooms();
  });
  const [posts, setPosts] = useState<Post[]>(() => seedPosts());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [sirens, setSirens] = useState<Siren[]>([]);
  const [leaderboard] = useState<SpeedrunEntry[]>([
    {
      id: "1",
      team: "Tokyo Night Shift",
      boss: "Rayquaza",
      seconds: 74,
      reward: 300,
      badge: "极速战神",
    },
    {
      id: "2",
      team: "KLCC Counterforce",
      boss: "Mewtwo",
      seconds: 89,
      reward: 200,
      badge: "极速战神",
    },
    { id: "3", team: "Seoul Spark", boss: "Kyogre", seconds: 103, reward: 100, badge: "极速战神" },
  ]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() =>
    readStoredList<FriendRequest>("raid-nexus-friend-requests"),
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    readStoredList<ChatMessage>("raid-nexus-chat-messages"),
  );
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [directChatTarget, setDirectChatTarget] = useState<string | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(() =>
    readStoredList<SecurityLog>("raid-nexus-security-logs"),
  );

  useEffect(() => {
    const raw = localStorage.getItem("raid-nexus-profile");
    if (raw) {
      try {
        const storedProfile = { ...defaultProfile, ...JSON.parse(raw) } as Profile;
        setProfileState(
          LEGACY_ADMIN_NAMES.has(storedProfile.trainerName.toLowerCase())
            ? defaultProfile
            : storedProfile,
        );
      } catch {
        /* ignore */
      }
    }
    const savedUser = localStorage.getItem("raid-nexus-auth");
    if (savedUser) {
      try {
        const saved = JSON.parse(savedUser) as AuthUser;
        if (saved.username === ADMIN_USERNAME && saved.role === "admin") {
          setAuthUser({ ...saved, username: ADMIN_USERNAME, role: "admin" });
          setProfileState(adminProfile);
        } else if (
          saved.role === "player" &&
          !LEGACY_ADMIN_NAMES.has(saved.username.toLowerCase())
        ) {
          setAuthUser(saved);
        } else {
          removeStored("raid-nexus-auth");
        }
      } catch {
        localStorage.removeItem("raid-nexus-auth");
      }
    }
  }, []);

  useEffect(() => {
    writeStored("raid-nexus-accounts", accounts);
  }, [accounts]);

  useEffect(() => {
    if (authUser?.role !== "player") return;
    writeStored("raid-nexus-profile", profile);
    setAccounts((current) => {
      let changed = false;
      const next = current.map((account) => {
        if (account.username !== authUser.username) return account;
        changed = account.profile !== profile;
        return changed ? { ...account, profile } : account;
      });
      if (!changed) return current;
      writeStored("raid-nexus-accounts", next);
      return next;
    });
  }, [profile, authUser]);

  useEffect(() => writeStored("raid-nexus-rooms", rooms), [rooms]);
  useEffect(() => writeStored("raid-nexus-finance", financeOrders), [financeOrders]);
  useEffect(() => writeStored("raid-nexus-billing", billingRecords), [billingRecords]);
  useEffect(() => writeStored("raid-nexus-frozen", frozenAccounts), [frozenAccounts]);
  useEffect(() => writeStored("raid-nexus-friend-requests", friendRequests), [friendRequests]);
  useEffect(() => writeStored("raid-nexus-chat-messages", chatMessages), [chatMessages]);
  useEffect(() => writeStored("raid-nexus-security-logs", securityLogs), [securityLogs]);

  useEffect(() => {
    const presenceKey = "raid-nexus-presence";
    const markOnline = () => {
      const current = readStored<Record<string, number>>(presenceKey, {});
      current[profile.trainerName] = Date.now();
      writeStored(presenceKey, current);
      setOnlineUsers(
        Object.entries(current)
          .filter(([, stamp]) => Date.now() - stamp < 30000)
          .map(([name]) => name),
      );
    };
    markOnline();
    const timer = window.setInterval(markOnline, 10000);
    const receive = () => markOnline();
    window.addEventListener("storage", receive);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("storage", receive);
    };
  }, [profile.trainerName]);

  const setProfile = (p: Profile) => {
    setProfileState(p);
    writeStored("raid-nexus-profile", p);
  };

  const replaceAccounts = (next: Account[]) => {
    setAccounts(next);
    writeStored("raid-nexus-accounts", next);
  };

  const addSecurityLog = (
    category: SecurityLog["category"],
    severity: SecurityLog["severity"],
    action: string,
    detail: string,
    actor = authUser?.username ?? profile.trainerName,
  ) => {
    setSecurityLogs((current) =>
      [
        { id: uid(), category, severity, actor, action, detail, createdAt: Date.now() },
        ...current,
      ].slice(0, 500),
    );
  };

  const showToast = (msg: string) => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = window.setTimeout(() => {
      toastTimerRef.current = null;
      setToast(null);
    }, 1800);
  };

  useEffect(
    () => () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const copy = (text: string, msg: string) => {
    void navigator.clipboard?.writeText(text);
    showToast(msg);
  };

  const broadcastSiren = (roomId: string) => {
    const room = rooms.find((item) => item.id === roomId);
    const canManage = room && (room.hostName === profile.trainerName || isAdmin);
    if (!room || !canManage) return;
    if (profile.coins < SIREN_COST) {
      showToast(`金币不足，需要 ${SIREN_COST} 金币广播警报`);
      return;
    }

    const siren: Siren = {
      id: uid(),
      host: room.hostName || profile.trainerName,
      message: `${room.boss} 队伍紧急发车，10 秒倒计时启动，未到场玩家请及时确认。`,
      roomId,
      createdAt: Date.now(),
      expiresAt: Date.now() + SIREN_DURATION_MS,
    };

    setSirens((prev) => [...prev, siren]);
    setProfileState((current) => ({ ...current, coins: current.coins - SIREN_COST }));
    setBillingRecords((current) => [
      {
        id: uid(),
        username: authUser?.username ?? profile.trainerName,
        type: "reward",
        amount: -SIREN_COST,
        reason: `房间警报：${room.boss}`,
        balanceAfter: profile.coins - SIREN_COST,
        createdAt: Date.now(),
      },
      ...current,
    ]);
    try {
      writeStored("raid-nexus-siren", siren);
    } catch {
      /* ignore storage errors */
    }
    showToast("全服紧急发车警报已广播，显示 10 秒");
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSirens((current) => current.filter((siren) => siren.expiresAt > Date.now()));
    }, 250);
    return () => window.clearInterval(timer);
  }, []);

  const isAuthenticated = authUser !== null;
  const isAdmin = authUser?.username === ADMIN_USERNAME && authUser.role === "admin";
  const isAccountFrozen = (username: string) => frozenAccounts.includes(username);

  const register = (username: string, password: string, trainerCode: string) => {
    const normalized = username.trim();
    const existing = readStoredList<StoredAccount>("raid-nexus-accounts");
    if (
      !normalized ||
      normalized.toLowerCase() === ADMIN_USERNAME ||
      LEGACY_ADMIN_NAMES.has(normalized.toLowerCase()) ||
      password.length < 6 ||
      !/^\d{12}$/.test(trainerCode) ||
      existing.some((account) => account.username.toLowerCase() === normalized.toLowerCase())
    ) {
      showToast("注册信息无效：用户名需唯一，密码至少 6 位，训练家代码需为 12 位数字");
      return false;
    }
    const nextProfile: Profile = {
      ...defaultProfile,
      trainerName: normalized,
      gameCode: normalized.toUpperCase(),
      friendCode: trainerCode,
      vip: false,
      coins: 100,
      badges: [],
    };
    const nextAccounts = [...existing, { username: normalized, password, profile: nextProfile }];
    writeStored("raid-nexus-accounts", nextAccounts);
    writeStored("raid-nexus-profile", nextProfile);
    const nextUser: AuthUser = { username: normalized, role: "player", trainerCode };
    writeStored("raid-nexus-auth", nextUser);
    setAccounts(nextAccounts);
    setProfileState(nextProfile);
    setAuthUser(nextUser);
    showToast("注册成功，已自动登录");
    return true;
  };

  const login = (username: string, password: string): LoginResult => {
    const normalized = username.trim();
    if (normalized === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const adminUser: AuthUser = { username: ADMIN_USERNAME, role: "admin", trainerCode: "" };
      writeStored("raid-nexus-auth", adminUser);
      setAuthUser(adminUser);
      setProfileState(adminProfile);
      addSecurityLog("auth", "info", "GM 登录", "唯一超级管理员登录成功", ADMIN_USERNAME);
      showToast("管理员登录成功");
      return "admin";
    }
    const existing = readStoredList<StoredAccount>("raid-nexus-accounts");
    const account = existing.find(
      (item) =>
        item.username.toLowerCase() === normalized.toLowerCase() && item.password === password,
    );
    if (!account || frozenAccounts.includes(account.username)) {
      showToast("账号或密码错误");
      return false;
    }
    const nextUser: AuthUser = {
      username: account.username,
      role: "player",
      trainerCode: account.profile.friendCode,
    };
    writeStored("raid-nexus-auth", nextUser);
    writeStored("raid-nexus-profile", account.profile);
    setProfileState(account.profile);
    setAuthUser(nextUser);
    showToast("登录成功");
    return "player";
  };

  const logout = () => {
    removeStored("raid-nexus-auth");
    setAuthUser(null);
    setProfileState(defaultProfile);
  };

  const toggleFrozenAccount = (username: string) => {
    if (!isAdmin || username === ADMIN_USERNAME) return;
    const nextFrozen = frozenAccounts.includes(username)
      ? frozenAccounts.filter((item) => item !== username)
      : [...frozenAccounts, username];
    setFrozenAccounts(nextFrozen);
    addSecurityLog(
      "auth",
      "warning",
      nextFrozen.includes(username) ? "封禁账号" : "解封账号",
      username,
    );
  };

  const updateAccount = (username: string, nextProfile: Profile, password?: string) => {
    if (!isAdmin || username === ADMIN_USERNAME) return;
    const nextAccounts = accounts.map((account) =>
      account.username === username
        ? { ...account, profile: nextProfile, ...(password ? { password } : {}) }
        : account,
    );
    replaceAccounts(nextAccounts);
    if (authUser?.username === username) setProfileState(nextProfile);
  };

  const toggleAccountVip = (username: string) => {
    if (!isAdmin) return;
    const account = accounts.find((item) => item.username === username);
    if (account) updateAccount(username, { ...account.profile, vip: !account.profile.vip });
  };

  const resetAccountPassword = (username: string, password: string) => {
    if (!isAdmin || username === ADMIN_USERNAME || password.length < 6) return;
    const account = accounts.find((item) => item.username === username);
    if (account) updateAccount(username, account.profile, password);
  };

  const resetAccountFriendCode = (username: string) => {
    if (!isAdmin) return;
    const account = accounts.find((item) => item.username === username);
    if (!account) return;
    updateAccount(username, { ...account.profile, friendCode: randCode() });
    addSecurityLog("auth", "warning", "重置好友码", username);
    showToast(`${username} 的好友码已重置`);
  };

  const submitDeposit = (
    input: Omit<FinanceOrder, "id" | "kind" | "username" | "status" | "createdAt">,
  ) => {
    const order: FinanceOrder = {
      ...input,
      id: `ORD-${Date.now().toString().slice(-6)}`,
      kind: "deposit",
      username: profile.trainerName,
      status: "pending",
      createdAt: Date.now(),
    };
    setFinanceOrders((current) => [order, ...current]);
    showToast("充值订单已提交，等待管理员审核");
  };

  const reviewFinanceOrder = (id: string, decision: "approved" | "rejected") => {
    const order = financeOrders.find((item) => item.id === id);
    if (!order || order.status !== "pending") return;
    setFinanceOrders((current) =>
      current.map((item) => (item.id === id ? { ...item, status: decision } : item)),
    );
    if (decision === "approved") {
      const next = accounts.map((account) =>
        account.profile.trainerName === order.username || account.username === order.username
          ? {
              ...account,
              profile: { ...account.profile, coins: account.profile.coins + order.coins },
            }
          : account,
      );
      replaceAccounts(next);
      if (authUser?.username === order.username || profile.trainerName === order.username)
        setProfileState((current) => ({ ...current, coins: current.coins + order.coins }));
    }
    showToast(decision === "approved" ? "订单审核通过" : "订单已退回");
  };

  const manualAdjustBalance = (username: string, amount: number, reason: string) => {
    if (!isAdmin || username === ADMIN_USERNAME) return;
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed === 0) return;
    const target = accounts.find((account) => account.username === username);
    if (!target) return;
    const nextCoins = Math.max(0, target.profile.coins + parsed);
    const nextAccounts = accounts.map((account) =>
      account.username === username
        ? { ...account, profile: { ...account.profile, coins: nextCoins } }
        : account,
    );
    replaceAccounts(nextAccounts);
    setBillingRecords((current) => [
      {
        id: uid(),
        username,
        type: "manual_adjust",
        amount: parsed,
        reason: reason.trim() || "手动调账",
        balanceAfter: nextCoins,
        createdAt: Date.now(),
      },
      ...current,
    ]);
    if (authUser?.username === username)
      setProfileState((current) => ({ ...current, coins: nextCoins }));
    addSecurityLog(
      "billing",
      "warning",
      "人工调账",
      `${username} ${parsed > 0 ? "+" : ""}${parsed} 金币：${reason.trim() || "手动调账"}`,
    );
    showToast(`余额已调整 ${parsed > 0 ? "+" : ""}${parsed} 金币`);
  };

  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.key === "raid-nexus-accounts" && event.newValue) {
        try {
          const next = JSON.parse(event.newValue) as unknown;
          if (Array.isArray(next)) setAccounts(next as Account[]);
        } catch {
          /* ignore malformed sync */
        }
      }
      if (event.key === "raid-nexus-frozen" && event.newValue) {
        try {
          const next = JSON.parse(event.newValue) as unknown;
          if (Array.isArray(next)) setFrozenAccounts(next as string[]);
        } catch {
          /* ignore malformed sync */
        }
      }
      if (event.key === "raid-nexus-finance" && event.newValue) {
        try {
          const next = JSON.parse(event.newValue) as unknown;
          if (Array.isArray(next)) setFinanceOrders(next as FinanceOrder[]);
        } catch {
          /* ignore malformed sync */
        }
      }
      if (event.key === "raid-nexus-rooms" && event.newValue) {
        try {
          const next = JSON.parse(event.newValue) as unknown;
          if (Array.isArray(next)) setRooms(next as Room[]);
        } catch {
          /* ignore malformed sync */
        }
      }
      if (event.key === "raid-nexus-billing" && event.newValue) {
        try {
          const next = JSON.parse(event.newValue) as unknown;
          if (Array.isArray(next)) setBillingRecords(next as BillingRecord[]);
        } catch {
          /* ignore malformed sync */
        }
      }
      if (event.key !== "raid-nexus-siren" || !event.newValue) return;
      try {
        setSirens((prev) => [...prev, JSON.parse(event.newValue!) as Siren]);
      } catch {
        /* ignore malformed demo events */
      }
    };
    window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, []);

  const value: StoreValue = useMemo(
    () => ({
      profile,
      setProfile,
      authUser,
      isAuthenticated,
      isAdmin,
      register,
      login,
      logout,
      rooms,
      posts,
      toast,
      showToast,
      copy,
      sirens: sirens.filter((siren) => siren.expiresAt > Date.now()),
      leaderboard,
      broadcastSiren,
      setFormation: (roomId, formationId) =>
        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId && (room.hostName === profile.trainerName || isAdmin)
              ? { ...room, formationId }
              : room,
          ),
        ),
      toggleLottery: (roomId) =>
        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId &&
            !room.launched &&
            (room.hostName === profile.trainerName || isAdmin)
              ? { ...room, lottery: { ...room.lottery, enabled: !room.lottery.enabled } }
              : room,
          ),
        ),
      joinLottery: (roomId) => {
        const room = rooms.find((item) => item.id === roomId);
        const isParticipant =
          room?.hostName === profile.trainerName || room?.queue.some((member) => member.isSelf);
        if (
          !room ||
          room.launched ||
          !isParticipant ||
          !room.lottery.enabled ||
          room.lottery.entries.includes(profile.trainerName)
        ) {
          showToast("彩池已关闭或你已参与");
          return;
        }
        if (profile.coins < 5) {
          showToast("金币不足，需要 5 金币入池");
          return;
        }
        setRooms((prev) =>
          prev.map((item) => {
            if (item.id !== roomId) return item;
            return {
              ...item,
              lottery: {
                ...item.lottery,
                entries: [...item.lottery.entries, profile.trainerName],
                pot: item.lottery.pot + 5,
              },
            };
          }),
        );
        setProfileState((current) => ({ ...current, coins: current.coins - 5 }));
        setBillingRecords((current) => [
          {
            id: uid(),
            username: authUser?.username ?? profile.trainerName,
            type: "lottery",
            amount: -5,
            reason: `彩池投注：${room.boss}`,
            balanceAfter: profile.coins - 5,
            createdAt: Date.now(),
          },
          ...current,
        ]);
        showToast("已参与彩池，扣除 5 金币");
      },
      submitLotteryProof: (roomId, proof) => {
        const room = rooms.find((item) => item.id === roomId);
        const isParticipant =
          room?.hostName === profile.trainerName || room?.queue.some((member) => member.isSelf);
        if (
          !room ||
          !isParticipant ||
          !room.lottery.entries.includes(profile.trainerName) ||
          !proof.trim()
        )
          return;
        setRooms((prev) =>
          prev.map((item) =>
            item.id === roomId
              ? {
                  ...item,
                  lottery: {
                    ...item.lottery,
                    proofs: { ...(item.lottery.proofs ?? {}), [profile.trainerName]: proof },
                  },
                }
              : item,
          ),
        );
        showToast("闪光证明已提交，等待队长审核");
      },
      settleRoom: (roomId, catchType) => {
        const room = rooms.find((item) => item.id === roomId);
        if (
          !room ||
          (room.hostName !== profile.trainerName && !isAdmin) ||
          !room.lottery.enabled ||
          room.lottery.entries.length === 0 ||
          (!room.battleEnded && !isAdmin) ||
          room.settled
        )
          return;
        const winners = Object.keys(room.lottery.proofs ?? {});
        if (catchType === "normal" || winners.length === 0) {
          setRooms((prev) =>
            prev.map((item) =>
              item.id === roomId
                ? {
                    ...item,
                    settled: true,
                    lottery: { ...item.lottery, enabled: false, pot: 0, winner: "已全额退回" },
                  }
                : item,
            ),
          );
          const refunds = room.lottery.entries.length * 5;
          const nextAccounts = accounts.map((account) =>
            room.lottery.entries.includes(account.profile.trainerName)
              ? { ...account, profile: { ...account.profile, coins: account.profile.coins + 5 } }
              : account,
          );
          replaceAccounts(nextAccounts);
          if (room.lottery.entries.includes(profile.trainerName)) {
            setProfileState((current) => ({ ...current, coins: current.coins + 5 }));
          }
          showToast(`无有效闪光证明，彩池 ${refunds} 金币已退回下注玩家`);
          return;
        }
        if (winners.length === 0) return;
        const prize = Math.floor(room.lottery.pot / winners.length);
        setRooms((prev) =>
          prev.map((item) =>
            item.id === roomId
              ? {
                  ...item,
                  lottery: {
                    ...item.lottery,
                    enabled: false,
                    winner: winners.join("、"),
                    verified: winners,
                    pot: 0,
                  },
                  settled: true,
                }
              : item,
          ),
        );

        const nextAccounts = accounts.map((account) => {
          if (!winners.includes(account.profile.trainerName)) return account;
          return {
            ...account,
            profile: { ...account.profile, coins: account.profile.coins + prize },
          };
        });
        replaceAccounts(nextAccounts);
        if (winners.includes(profile.trainerName)) {
          setProfileState((current) => ({ ...current, coins: current.coins + prize }));
        }
        setBillingRecords((current) => [
          {
            id: uid(),
            username: winners.join(",") || profile.trainerName,
            type: "lottery",
            amount: prize * winners.length,
            reason: `${catchType === "shiny" ? "闪光" : "100IV"}彩池分奖：${winners.join("、")}`,
            balanceAfter: profile.coins + prize * winners.length,
            createdAt: Date.now(),
          },
          ...current,
        ]);
        addSecurityLog(
          "lottery",
          "info",
          "彩池结算",
          `${room.boss} · ${winners.join("、")} · ${room.lottery.pot} 金币`,
        );
        showToast(
          `${winners.join("、")} 平分彩池 ${room.lottery.pot} 金币，单人分得 ${prize} 金币`,
        );
      },
      forceSettleLottery: (roomId, decision, winner) => {
        if (!isAdmin) return;
        const room = rooms.find((item) => item.id === roomId);
        if (!room || room.lottery.pot <= 0 || room.settled) return;
        const entries = room.lottery.entries;
        const pot = room.lottery.pot;
        if (decision === "winner") {
          if (!winner || !entries.includes(winner)) {
            showToast("指定玩家必须是本房间下注者");
            return;
          }
          const nextAccounts = accounts.map((account) =>
            account.profile.trainerName === winner
              ? { ...account, profile: { ...account.profile, coins: account.profile.coins + pot } }
              : account,
          );
          replaceAccounts(nextAccounts);
          if (profile.trainerName === winner)
            setProfileState((current) => ({ ...current, coins: current.coins + pot }));
        } else if (decision === "refund") {
          const nextAccounts = accounts.map((account) =>
            entries.includes(account.profile.trainerName)
              ? { ...account, profile: { ...account.profile, coins: account.profile.coins + 5 } }
              : account,
          );
          replaceAccounts(nextAccounts);
          if (entries.includes(profile.trainerName))
            setProfileState((current) => ({ ...current, coins: current.coins + 5 }));
        }
        const label =
          decision === "winner"
            ? `GM 指定 ${winner} 独占`
            : decision === "refund"
              ? "GM 全额退款"
              : "GM 没收彩池";
        setRooms((prev) =>
          prev.map((item) =>
            item.id === roomId
              ? {
                  ...item,
                  settled: true,
                  lottery: {
                    ...item.lottery,
                    enabled: false,
                    pot: 0,
                    winner: decision === "winner" ? winner : label,
                    verified: decision === "winner" ? [winner!] : [],
                  },
                }
              : item,
          ),
        );
        setBillingRecords((current) => [
          {
            id: uid(),
            username: ADMIN_USERNAME,
            type: "lottery",
            amount: decision === "confiscate" ? 0 : pot,
            reason: `${label}：${room.boss}`,
            balanceAfter: 0,
            createdAt: Date.now(),
          },
          ...current,
        ]);
        addSecurityLog(
          "lottery",
          "critical",
          "GM 强制裁决",
          `${room.boss} · ${label} · ${pot} 金币`,
          ADMIN_USERNAME,
        );
        showToast(`${label}完成，共处理 ${pot} 金币`);
      },
      addCoins: (amount, reason) => {
        setProfileState((current) => {
          const next = { ...current, coins: current.coins + amount };
          writeStored("raid-nexus-profile", next);
          return next;
        });
        setBillingRecords((current) => [
          {
            id: uid(),
            username: authUser?.username ?? profile.trainerName,
            type: "reward",
            amount,
            reason,
            balanceAfter: profile.coins + amount,
            createdAt: Date.now(),
          },
          ...current,
        ]);
        showToast(`${reason} +${amount} 金币`);
      },
      buyVip: () => {
        if (profile.vip) {
          showToast("VIP 已开启");
          return;
        }
        if (profile.coins < 199) {
          showToast("金币不足，需要 199 金币");
          return;
        }
        setProfileState((current) => {
          const next = { ...current, coins: current.coins - 199, vip: true };
          writeStored("raid-nexus-profile", next);
          return next;
        });
        showToast("VIP 插队特权已开启");
      },
      forceLaunchRoom: (roomId) => {
        if (!isAdmin) return;
        const room = rooms.find((item) => item.id === roomId);
        if (!room || room.launched) return;
        setRooms((prev) =>
          prev.map((item) =>
            item.id === roomId
              ? {
                  ...item,
                  launched: true,
                  battleEnded: false,
                  settled: false,
                  battleEndsAt: Date.now() + Math.max(1, item.minutes) * 60 * 1000,
                }
              : item,
          ),
        );
        addSecurityLog(
          "auth",
          "critical",
          "GM 强制发车",
          `${room.boss} · ${room.id}`,
          ADMIN_USERNAME,
        );
        showToast("房间已强制发车");
      },
      forceKickMember: (roomId, memberId) => {
        if (!isAdmin) return;
        const room = rooms.find((item) => item.id === roomId);
        const member = room?.queue.find((item) => item.id === memberId);
        if (!room || !member) return;
        setRooms((prev) =>
          prev.map((item) =>
            item.id === roomId
              ? { ...item, queue: item.queue.filter((entry) => entry.id !== memberId) }
              : item,
          ),
        );
        addSecurityLog(
          "auth",
          "warning",
          "GM 移出队员",
          `${member.name} from ${room.boss}`,
          ADMIN_USERNAME,
        );
        showToast(`${member.name} 已被移出房间`);
      },
      createRoom: (r) =>
        setRooms((prev) => [
          {
            ...r,
            id: uid(),
            gym: r.gym ?? "Raid Nexus Gym",
            queue: [],
            launched: false,
            createdAt: Date.now(),
            formationId: r.formationId ?? "counter",
            lottery: r.lottery ?? { enabled: false, entries: [], pot: 0 },
          },
          ...prev,
        ]),
      joinRoom: (roomId) =>
        setRooms((prev) =>
          prev.map((room) => {
            if (room.id !== roomId || room.launched) return room;
            if (room.queue.some((m) => m.isSelf)) return room;
            const me: Member = {
              id: uid(),
              name: profile.trainerName,
              code: profile.friendCode,
              vip: profile.vip,
              ready: false,
              dps: 680,
              isSelf: true,
            };
            if (room.queue.length >= room.capacity) return room;

            const nextQueue = !profile.vip
              ? [...room.queue, me]
              : (() => {
                  const lastVip = room.queue.reduce((acc, m, i) => (m.vip ? i + 1 : acc), 0);
                  const next = [...room.queue];
                  next.splice(lastVip, 0, me);
                  return next;
                })();

            if (nextQueue.length >= room.capacity) {
              setChatMessages((current) => current.filter((message) => message.roomId !== room.id));
              return {
                ...room,
                queue: nextQueue,
                launched: true,
                lottery: { ...room.lottery, enabled: false },
              };
            }

            return { ...room, queue: nextQueue };
          }),
        ),
      leaveRoom: (roomId) =>
        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId ? { ...room, queue: room.queue.filter((m) => !m.isSelf) } : room,
          ),
        ),
      toggleReady: (roomId, memberId) =>
        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  queue: room.queue.map((m) => (m.id === memberId ? { ...m, ready: !m.ready } : m)),
                }
              : room,
          ),
        ),
      kick: (roomId, memberId) =>
        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId
              ? { ...room, queue: room.queue.filter((m) => m.id !== memberId) }
              : room,
          ),
        ),
      launchRoom: (roomId) => {
        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId && (room.hostName === profile.trainerName || isAdmin)
              ? {
                  ...room,
                  launched: true,
                  battleEnded: false,
                  settled: false,
                  battleEndsAt: Date.now() + Math.max(1, room.minutes) * 60 * 1000,
                  lottery: { ...room.lottery },
                }
              : room,
          ),
        );
        setChatMessages((current) => current.filter((message) => message.roomId !== roomId));
      },
      endBattle: (roomId) => {
        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId &&
            !room.battleEnded &&
            (room.hostName === profile.trainerName || isAdmin)
              ? { ...room, battleEnded: true, battleEndsAt: Date.now() }
              : room,
          ),
        );
        showToast("战斗已结束，请上传闪光截图并提交审核");
      },
      removeRoom: (roomId) =>
        setRooms((prev) => {
          const room = prev.find((item) => item.id === roomId);
          if (room)
            setChatMessages((current) => current.filter((message) => message.roomId !== roomId));
          return prev.filter(
            (room) => room.id !== roomId || (room.hostName !== profile.trainerName && !isAdmin),
          );
        }),
      addPost: (p) =>
        setPosts((prev) => [
          {
            ...p,
            id: uid(),
            author: profile.trainerName,
            likes: 0,
            liked: false,
            comments: [],
            createdAt: Date.now(),
          },
          ...prev,
        ]),
      toggleLike: (postId) =>
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
          ),
        ),
      addComment: (postId, text) =>
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [...p.comments, { id: uid(), author: profile.trainerName, text }],
                }
              : p,
          ),
        ),
      removePost: (postId) => setPosts((prev) => prev.filter((p) => p.id !== postId)),
      friendRequests,
      friends: Array.from(
        new Set(
          friendRequests
            .filter((request) => request.status === "accepted")
            .flatMap((request) =>
              request.from === profile.trainerName
                ? [request.to]
                : request.to === profile.trainerName
                  ? [request.from]
                  : [],
            ),
        ),
      ),
      onlineUsers,
      sendFriendRequest: (username) => {
        const target = username.trim();
        if (!target || target === profile.trainerName) return;
        if (
          !accounts.some(
            (account) => account.profile.trainerName === target || account.username === target,
          )
        ) {
          showToast("未找到该玩家");
          return;
        }
        if (
          friendRequests.some(
            (request) =>
              request.from === profile.trainerName &&
              request.to === target &&
              request.status === "pending",
          )
        ) {
          showToast("好友申请已发送");
          return;
        }
        setFriendRequests((current) => [
          ...current,
          { id: uid(), from: profile.trainerName, to: target, status: "pending" },
        ]);
        showToast("好友申请已发送");
      },
      acceptFriendRequest: (requestId) =>
        setFriendRequests((current) =>
          current.map((request) =>
            request.id === requestId && request.to === profile.trainerName
              ? { ...request, status: "accepted" }
              : request,
          ),
        ),
      sendRoomMessage: (roomId, text, image) => {
        const room = rooms.find((item) => item.id === roomId);
        const canChat =
          room &&
          (room.hostName === profile.trainerName ||
            room.queue.some((member) => member.isSelf) ||
            isAdmin);
        if (!canChat) return;
        if (!text.trim() && !image) return;
        if (hasBlockedChatTerm(text)) {
          addSecurityLog("chat", "warning", "敏感词拦截", `房间 ${roomId}：${text.slice(0, 120)}`);
          showToast("消息包含受限交易内容，无法发送");
          return;
        }
        setChatMessages((current) => [
          ...current,
          {
            id: uid(),
            roomId,
            from: profile.trainerName,
            text: text.trim(),
            ...(image ? { image } : {}),
            createdAt: Date.now(),
          },
        ]);
      },
      roomMessages: (roomId) => chatMessages.filter((message) => message.roomId === roomId),
      sendDirectMessage: (username, text, image) => {
        if (!text.trim() && !image) return;
        if (hasBlockedChatTerm(text)) {
          addSecurityLog(
            "chat",
            "warning",
            "敏感词拦截",
            `私聊 ${username}：${text.slice(0, 120)}`,
          );
          showToast("消息包含受限交易内容，无法发送");
          return;
        }
        setChatMessages((current) => [
          ...current,
          {
            id: uid(),
            from: profile.trainerName,
            to: username,
            text: text.trim(),
            ...(image ? { image } : {}),
            createdAt: Date.now(),
          },
        ]);
      },
      directMessages: (username) =>
        chatMessages.filter(
          (message) =>
            !message.roomId &&
            ((message.from === profile.trainerName && message.to === username) ||
              (message.from === username && message.to === profile.trainerName)),
        ),
      directChatTarget,
      openDirectChat: (username) => setDirectChatTarget(username),
      closeDirectChat: () => setDirectChatTarget(null),
      billingRecords,
      securityLogs,
      submitDeposit,
      manualAdjustBalance,
      toggleFrozenAccount,
      updateAccount,
      toggleAccountVip,
      resetAccountPassword,
      isAccountFrozen,
    }),
    [
      profile,
      authUser,
      isAuthenticated,
      rooms,
      posts,
      toast,
      isAdmin,
      sirens,
      leaderboard,
      friendRequests,
      chatMessages,
      onlineUsers,
      directChatTarget,
      billingRecords,
      securityLogs,
      accounts,
      copy,
      broadcastSiren,
      addSecurityLog,
      isAccountFrozen,
      login,
      manualAdjustBalance,
      register,
      resetAccountPassword,
      submitDeposit,
      toggleAccountVip,
      toggleFrozenAccount,
      updateAccount,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
