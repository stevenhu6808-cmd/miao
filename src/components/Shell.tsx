import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronDown,
  Gamepad2,
  Languages,
  PictureInPicture2,
  Swords,
  Sparkles,
  Calculator,
  IdCard,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { LANGS, useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Badge, Button, Input } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", key: "nav.rooms", Icon: Swords },
  { to: "/wall", key: "nav.wall", Icon: Sparkles },
  { to: "/tools", key: "nav.tools", Icon: Calculator },
  { to: "/profile", key: "nav.profile", Icon: IdCard },
] as const;

export function TopNav() {
  const { t } = useI18n();
  const { profile, authUser, logout, sirens } = useStore();
  const activeSiren = sirens[0];
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {activeSiren ? (
        <div className="fixed inset-x-3 top-3 z-[70] mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-accent/60 bg-accent/15 px-4 py-3 shadow-2xl backdrop-blur-xl rise-in">
          <AlertTriangle className="h-5 w-5 shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
              全服紧急发车警报 · {activeSiren.host}
            </div>
            <div className="mt-0.5 truncate text-xs font-semibold">{activeSiren.message}</div>
          </div>
          <Link
            to="/"
            className="rounded-lg bg-accent px-2.5 py-1.5 text-[10px] font-bold text-accent-foreground"
          >
            立即上车
          </Link>
        </div>
      ) : null}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/18 text-lg glow-primary">
              <Zap className="h-4 w-4 text-primary" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-sm font-bold tracking-[0.18em] neon-text">
                {t("appName")}
              </span>
              <span className="block text-[10px] text-muted-foreground">{t("tagline")}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {profile.vip ? <Badge tone="vip">VIP</Badge> : null}
            {authUser ? (
              <button
                className="rounded-xl border border-border bg-surface-2/60 px-3 py-2 text-xs font-semibold"
                onClick={() => logout()}
                title="退出登录"
              >
                {authUser.username}
              </button>
            ) : (
              <button
                className="rounded-xl border border-primary/45 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
                onClick={() => setAuthOpen(true)}
              >
                登录 / 注册
              </button>
            )}
            <LanguageSwitcher />
          </div>
        </div>
        <nav className="mx-auto max-w-5xl overflow-x-auto px-4 pb-2">
          <div className="flex gap-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="tap-scale flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground"
                activeProps={{
                  className:
                    "tap-scale flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/50 bg-primary/15 px-3.5 py-2 text-xs font-semibold text-primary glow-primary",
                }}
              >
                <item.Icon className="h-3.5 w-3.5" />
                {t(item.key)}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      {authOpen ? (
        <AuthDialog
          onClose={() => setAuthOpen(false)}
          onAdminLogin={() => {
            setAuthOpen(false);
            void navigate({ to: "/admin" });
          }}
        />
      ) : null}
    </>
  );
}

function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="tap-scale flex items-center gap-1 rounded-xl border border-border bg-surface-2/60 px-2.5 py-2 text-xs font-semibold"
      >
        <Languages className="h-3.5 w-3.5" />
        {LANGS.find((l) => l.code === lang)?.flag}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-border bg-popover/95 shadow-xl backdrop-blur-xl rise-in">
          {LANGS.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                setLang(item.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold",
                item.code === lang ? "bg-primary/15 text-primary" : "text-muted-foreground",
              )}
            >
              <span>{item.flag}</span>
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AuthDialog({ onClose, onAdminLogin }: { onClose: () => void; onAdminLogin: () => void }) {
  const { login, register } = useStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [trainerCode, setTrainerCode] = useState("");

  const submit = () => {
    if (mode === "register") {
      if (register(username, password, trainerCode)) onClose();
      return;
    }
    if (login(username, password)) {
      if (username.trim().toLowerCase() === "admin" && password === "5500123488htk") onAdminLogin();
      else onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-background/75 px-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md space-y-4 border-primary/30 p-5 glow-primary">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-primary">登录 / 注册</h2>
            <p className="mt-1 text-xs text-muted-foreground">登录后管理金币、排队和充值订单。</p>
          </div>
          <button className="text-xs text-muted-foreground" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-2/60 p-1">
          {(["login", "register"] as const).map((item) => (
            <button
              key={item}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-semibold",
                mode === item ? "bg-primary/20 text-primary" : "text-muted-foreground",
              )}
              onClick={() => setMode(item)}
            >
              {item === "login" ? "登录" : "注册"}
            </button>
          ))}
        </div>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground">账号</span>
          <Input
            autoFocus
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="训练家账号"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground">密码</span>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="至少 6 位"
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
          />
        </label>
        {mode === "register" ? (
          <label className="block space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">
              12 位 Pokémon GO 训练家代码
            </span>
            <Input
              inputMode="numeric"
              maxLength={12}
              value={trainerCode}
              onChange={(event) => setTrainerCode(event.target.value.replace(/\D/g, ""))}
              placeholder="例如 123456789012"
            />
          </label>
        ) : null}
        <Button className="w-full" onClick={submit}>
          {mode === "login" ? "登录" : "创建账号并登录"}
        </Button>
        <p className="text-center text-[10px] text-muted-foreground">
          普通玩家与后台账号使用同一个登录入口。
        </p>
      </div>
    </div>
  );
}

export function BottomBar() {
  const { t } = useI18n();
  const { profile, copy } = useStore();
  const [floating, setFloating] = useState(false);

  return (
    <>
      {floating ? (
        <div className="fixed bottom-28 right-4 z-50 w-60 glass-card rise-in p-3 glow-accent">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold tracking-wide text-accent">
              {t("float.title")}
            </span>
            <button
              onClick={() => setFloating(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t("float.close")}
            </button>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {t("float.hint")}
          </p>
          <div className="mt-3 space-y-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => copy(profile.friendCode, t("copied"))}
            >
              {t("bar.copyCode")} · {profile.friendCode}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => window.open("https://pokemongolive.com/", "_blank")}
            >
              {t("bar.launchGame")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 px-4 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-2 pb-3">
          <Button
            className="flex-1"
            onClick={() => window.open("https://pokemongolive.com/", "_blank")}
          >
            <Gamepad2 className="h-4 w-4" /> {t("bar.launchGame")}
          </Button>
          <Button
            variant={floating ? "accent" : "ghost"}
            className="flex-1"
            onClick={() => setFloating((v) => !v)}
          >
            <PictureInPicture2 className="h-4 w-4" /> {t("bar.floating")}
          </Button>
          <Button
            variant="outline"
            onClick={() => copy(profile.friendCode, t("copied"))}
            aria-label={t("bar.copyCode")}
          >
            📋
          </Button>
        </div>
      </div>
    </>
  );
}

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-[60] -translate-x-1/2 rounded-full border border-primary/40 bg-popover/95 px-4 py-2 text-xs font-semibold text-primary shadow-xl backdrop-blur-xl rise-in">
      {toast}
    </div>
  );
}

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cn("min-h-screen", className)}>
      <TopNav />
      <main className="mx-auto max-w-5xl space-y-5 px-4 pb-36 pt-5">{children}</main>
      <BottomBar />
      <Toast />
    </div>
  );
}
