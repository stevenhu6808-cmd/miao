import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Coins, Gauge, ScanLine, Siren, Sparkles, Target, Trophy, Upload } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Badge, Button, Card, Field, Input, Select } from "@/components/ui-kit";
import { useI18n } from "@/lib/i18n";
import { FORMATIONS, generatePassword, useStore, type RaidMode, type Room } from "@/lib/store";
import { cn } from "@/lib/utils";
import heroRaid from "@/assets/hero-raid.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Raid Nexus — Pokémon GO 实时团战组队与排队系统" },
      {
        name: "description",
        content: "实时创建远程团战与现场近卡团战房间，VIP 优先排队、一键复制好友码、一键发车。",
      },
      { property: "og:title", content: "Raid Nexus — 实时团战组队" },
      {
        property: "og:description",
        content: "远程邀请函与现场私房密码双模式打房排队系统，支持中英日韩四语言。",
      },
    ],
  }),
  component: RoomsPage,
});

const TYPES = ["Psychic", "Dragon", "Fire", "Water", "Grass", "Electric", "Dark", "Steel", "Ghost"];

function RoomsPage() {
  const { t } = useI18n();
  const { rooms, profile, sirens, leaderboard, bounties } = useStore();
  const [filter, setFilter] = useState<"all" | RaidMode>("all");
  const [creating, setCreating] = useState(false);

  const visible = rooms.filter((r) => !r.launched && (filter === "all" || r.mode === filter));
  const queued = rooms.reduce((n, r) => n + r.queue.length, 0);

  return (
    <PageShell>
      <div className="relative overflow-hidden rounded-3xl border border-border rise-in">
        <img
          src={heroRaid}
          alt=""
          width={1600}
          height={912}
          className="h-40 w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center gap-2">
            <span className="pulse-dot h-2 w-2 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-primary">{t("live")}</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold neon-text">{t("rooms.title")}</h1>
          <p className="text-xs text-muted-foreground">{t("rooms.subtitle")}</p>
          <div className="mt-3 flex gap-2">
            <Badge tone="primary">
              {rooms.length} {t("openRooms")}
            </Badge>
            <Badge tone="accent">
              {queued + 128} {t("onlineTrainers")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-vip/30 bg-vip/5 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("wallet.title")}
            </span>
            <Coins className="h-4 w-4 text-vip" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-vip">{profile.coins}</div>
          <p className="mt-1 text-[11px] text-muted-foreground">{t("wallet.hint")}</p>
        </Card>
        <Card className="border-primary/30 bg-primary/5 sm:col-span-2">
          <div className="flex items-center gap-2 text-primary">
            <Siren className="h-4 w-4" />
            <span className="text-xs font-bold">{t("siren.title")}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">{t("siren.hint")}</p>
          {sirens[0] ? (
            <div className="mt-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">
              {sirens[0].host}：{sirens[0].message}
            </div>
          ) : null}
        </Card>
      </div>

      <LiveOpsPanel leaderboard={leaderboard} bounties={bounties} />

      <div className="flex items-center gap-2">
        {(["all", "remote", "local"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "tap-scale rounded-xl border border-border px-3 py-2 text-xs font-semibold",
              filter === f
                ? "border-primary/60 bg-primary/15 text-primary"
                : "text-muted-foreground",
            )}
          >
            {t(`rooms.filter.${f}`)}
          </button>
        ))}
        <Button className="ml-auto" size="sm" onClick={() => setCreating(true)}>
          ＋ {t("rooms.create")}
        </Button>
      </div>

      {creating ? <CreateRoomForm onClose={() => setCreating(false)} types={TYPES} /> : null}

      {visible.length === 0 ? (
        <Card className="text-center text-sm text-muted-foreground">{t("rooms.empty")}</Card>
      ) : (
        <div className="space-y-4">
          {visible.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function LiveOpsPanel({
  leaderboard,
  bounties,
}: {
  leaderboard: ReturnType<typeof useStore>["leaderboard"];
  bounties: ReturnType<typeof useStore>["bounties"];
}) {
  const { t } = useI18n();
  const { createBounty, acceptBounty, cancelBounty, settleBounty, profile } = useStore();
  const [request, setRequest] = useState("");
  const [boss, setBoss] = useState("Shadow Mewtwo");
  const [reward, setReward] = useState(100);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <Trophy className="h-4 w-4 text-vip" />
              {t("leaderboard.title")}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{t("leaderboard.subtitle")}</p>
          </div>
          <Badge tone="vip">TOP 3</Badge>
        </div>
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-xl bg-surface-2/45 px-3 py-2 text-xs"
            >
              <span className="font-display text-lg text-vip">0{index + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{entry.team}</div>
                <div className="text-[10px] text-muted-foreground">
                  {entry.boss} · {entry.seconds}s · {entry.badge}
                </div>
              </div>
              <span className="font-display text-primary">+{entry.reward}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Target className="h-4 w-4 text-accent" />
          {t("bounty.title")}
        </div>
        <div className="grid grid-cols-[1fr_0.7fr_0.45fr] gap-2">
          <Input
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder={t("bounty.placeholder")}
          />
          <Input value={boss} onChange={(e) => setBoss(e.target.value)} placeholder="Boss" />
          <Input type="number" value={reward} onChange={(e) => setReward(Number(e.target.value))} />
        </div>
        <Button
          size="sm"
          className="w-full"
          disabled={!request.trim()}
          onClick={() => {
            createBounty(request.trim(), boss.trim() || "Raid Boss", reward);
            setRequest("");
          }}
        >
          {t("bounty.publish")}
        </Button>
        <div className="space-y-2">
          {bounties
            .filter((bounty) => bounty.status === "open")
            .slice(0, 3)
            .map((bounty) => (
              <div key={bounty.id} className="rounded-xl border border-border bg-surface-2/35 p-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold">{bounty.request}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      {bounty.author} · {bounty.boss}
                    </div>
                  </div>
                  <Badge tone={bounty.status === "completed" ? "muted" : "vip"}>
                    {bounty.reward} 金
                  </Badge>
                </div>
                {bounty.author === profile.trainerName ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => cancelBounty(bounty.id)}
                  >
                    取消悬赏
                  </Button>
                ) : bounty.status === "open" ? (
                  <Button
                    size="sm"
                    variant="accent"
                    className="mt-2"
                    onClick={() => acceptBounty(bounty.id)}
                  >
                    {t("bounty.accept")}
                  </Button>
                ) : null}
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}

function CreateRoomForm({ onClose, types }: { onClose: () => void; types: string[] }) {
  const { t } = useI18n();
  const { profile, createRoom, showToast } = useStore();
  const [boss, setBoss] = useState("");
  const [gym, setGym] = useState("");
  const [cp, setCp] = useState(45000);
  const [type, setType] = useState(types[0] ?? "Psychic");
  const [minutes, setMinutes] = useState(45);
  const [mode, setMode] = useState<RaidMode>("remote");
  const [capacity, setCapacity] = useState(10);
  const [password, setPassword] = useState(generatePassword());
  const [scanning, setScanning] = useState(false);
  const scanTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
    },
    [],
  );

  const handleScreenshot = (file?: File) => {
    if (!file) return;
    setScanning(true);
    if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
    scanTimerRef.current = window.setTimeout(() => {
      scanTimerRef.current = null;
      setBoss("Mega Rayquaza");
      setGym("Central Plaza Gym");
      setMinutes(32);
      setType("Dragon");
      setScanning(false);
      showToast(t("form.ocrDone"));
    }, 650);
  };

  return (
    <Card className="space-y-3 glow-primary">
      <h2 className="font-display text-base font-bold text-primary">{t("form.create")}</h2>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary/10 px-3 py-3 text-xs font-semibold text-primary transition hover:bg-primary/15">
        {scanning ? <ScanLine className="h-4 w-4 animate-pulse" /> : <Upload className="h-4 w-4" />}
        {scanning ? t("form.ocrScanning") : t("form.ocrUpload")}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => handleScreenshot(event.target.files?.[0])}
        />
      </label>
      <Field label={t("form.bossName")}>
        <Input value={boss} onChange={(e) => setBoss(e.target.value)} placeholder="Mewtwo" />
      </Field>
      <Field label={t("form.gym")}>
        <Input
          value={gym}
          onChange={(e) => setGym(e.target.value)}
          placeholder="Central Plaza Gym"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("form.cp")}>
          <Input type="number" value={cp} onChange={(e) => setCp(Number(e.target.value))} />
        </Field>
        <Field label={t("form.type")}>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {types.map((ty) => (
              <option key={ty} value={ty}>
                {ty}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("form.timeLeft")}>
          <Input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </Field>
        <Field label={t("form.capacity")}>
          <Select value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}>
            {[3, 5, 8, 10, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(["remote", "local"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "tap-scale rounded-xl border p-3 text-left",
              mode === m
                ? "border-primary/60 bg-primary/12 glow-primary"
                : "border-border bg-surface/50",
            )}
          >
            <span className="block text-xs font-bold">{t(`rooms.mode.${m}`)}</span>
            <span className="mt-1 block text-[10px] leading-snug text-muted-foreground">
              {t(`rooms.mode.${m}.desc`)}
            </span>
          </button>
        ))}
      </div>

      {mode === "local" ? (
        <Field label={t("form.password")}>
          <div className="flex gap-2">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button variant="outline" size="sm" onClick={() => setPassword(generatePassword())}>
              {t("form.regenerate")}
            </Button>
          </div>
        </Field>
      ) : null}

      <div className="flex gap-2 pt-1">
        <Button
          className="flex-1"
          onClick={() => {
            createRoom({
              boss: boss.trim() || "Mewtwo",
              gym: gym.trim() || "Raid Nexus Gym",
              cp,
              type,
              minutes,
              mode,
              capacity,
              hostName: profile.trainerName,
              hostCode: profile.friendCode,
              password,
            });
            showToast(t("form.submit"));
            onClose();
          }}
        >
          {t("form.submit")}
        </Button>
        <Button variant="outline" onClick={onClose}>
          {t("form.cancel")}
        </Button>
      </div>
    </Card>
  );
}

function RoomCard({ room }: { room: Room }) {
  const { t } = useI18n();
  const {
    profile,
    isAdmin,
    copy,
    joinRoom,
    leaveRoom,
    toggleReady,
    kick,
    launchRoom,
    removeRoom,
    broadcastSiren,
    setFormation,
    toggleLottery,
    joinLottery,
    settleRoom,
  } = useStore();
  const isHost = room.hostName === profile.trainerName;
  const canManage = isHost || isAdmin;
  const inQueue = room.queue.some((m) => m.isSelf);
  const full = room.queue.length >= room.capacity;
  const formation = FORMATIONS.find((item) => item.id === room.formationId) ?? FORMATIONS[0]!;
  const totalDps = formation.dps + room.queue.reduce((sum, member) => sum + (member.dps ?? 0), 0);
  const estimatedMinutes = Math.max(1, Math.round((room.cp / totalDps) * 0.7));

  return (
    <Card className="space-y-3 overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone={room.mode === "remote" ? "primary" : "accent"}>
              {t(`rooms.mode.${room.mode}`)}
            </Badge>
            {room.launched ? <Badge tone="muted">{t("rooms.launched")}</Badge> : null}
          </div>
          <h3 className="mt-2 font-display text-xl font-bold">{room.boss}</h3>
          <p className="text-xs text-muted-foreground">
            {t("rooms.cp")} {room.cp.toLocaleString()} · {room.type} · {t("rooms.timeLeft")}{" "}
            {room.minutes} {t("rooms.minutes")}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>{t("rooms.host")}</div>
          <div className="font-semibold text-foreground">{room.hostName}</div>
        </div>
      </div>

      <p className="rounded-xl bg-surface-2/50 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
        {t(`rooms.mode.${room.mode}.desc`)}
      </p>

      <div className="grid gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Gauge className="h-3.5 w-3.5" />
            {t("formation.title")}
          </div>
          <Select
            className="mt-2"
            value={room.formationId}
            onChange={(event) => setFormation(room.id, event.target.value)}
          >
            {FORMATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.dps} DPS
              </option>
            ))}
          </Select>
          <p className="mt-1 text-[10px] text-muted-foreground">{formation.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center sm:min-w-44">
          <div className="rounded-lg bg-background/50 px-2 py-2">
            <div className="font-display text-lg font-bold text-primary">{totalDps}</div>
            <div className="text-[10px] text-muted-foreground">{t("formation.dps")}</div>
          </div>
          <div className="rounded-lg bg-background/50 px-2 py-2">
            <div className="font-display text-lg font-bold text-accent">{estimatedMinutes}m</div>
            <div className="text-[10px] text-muted-foreground">{t("formation.estimate")}</div>
          </div>
        </div>
      </div>

      {room.mode === "local" ? (
        <button
          onClick={() => copy(room.password, t("copied"))}
          className="tap-scale flex w-full items-center justify-between rounded-xl border border-accent/40 bg-accent/10 px-3 py-2.5 text-left opacity-80"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
            {t("rooms.password")}
          </span>
          <span className="font-display text-sm font-bold text-accent">仅队员可见</span>
        </button>
      ) : (
        <button
          onClick={() => copy(room.hostCode, t("copied"))}
          className="tap-scale flex w-full items-center justify-between rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-left"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            {t("rooms.copyHostCode")}
          </span>
          <span className="font-display text-sm font-bold text-primary">{room.hostCode}</span>
        </button>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold">{t("rooms.queue")}</span>
          <span className="text-muted-foreground">
            {t("rooms.slots", { a: room.queue.length, b: room.capacity })}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="sheen-bar h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(100, (room.queue.length / room.capacity) * 100)}%` }}
          />
        </div>
        <ul className="mt-3 space-y-2">
          {room.queue.map((m, i) => (
            <li
              key={m.id}
              className="flex items-center gap-2 rounded-xl bg-surface-2/40 px-3 py-2 text-xs"
            >
              <span className="w-5 font-display text-muted-foreground">{i + 1}</span>
              <span className="font-semibold">
                {m.isSelf ? `${m.name} (${t("rooms.you")})` : m.name}
              </span>
              {m.vip ? <Badge tone="vip">{t("rooms.vip")}</Badge> : null}
              <span
                className={cn(
                  "ml-auto text-[10px] font-semibold",
                  m.ready ? "text-primary" : "text-muted-foreground",
                )}
              >
                {m.ready ? "● " + t("rooms.ready") : "○"}
              </span>
              <button
                onClick={() => copy(m.code, t("copied"))}
                className="tap-scale rounded-lg bg-background/60 px-2 py-1 text-[10px]"
              >
                {m.code}
              </button>
              {m.isSelf ? (
                <button
                  onClick={() => toggleReady(room.id, m.id)}
                  className="tap-scale rounded-lg bg-primary/20 px-2 py-1 text-[10px] font-semibold text-primary"
                >
                  {m.ready ? t("rooms.unready") : t("rooms.ready")}
                </button>
              ) : null}
              {canManage && !m.isSelf ? (
                <button
                  onClick={() => kick(room.id, m.id)}
                  className="tap-scale rounded-lg bg-destructive/20 px-2 py-1 text-[10px] font-semibold text-destructive"
                >
                  {t("rooms.kick")}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {inQueue ? (
          <Button variant="outline" size="sm" onClick={() => leaveRoom(room.id)}>
            {t("rooms.leave")}
          </Button>
        ) : (
          <Button
            size="sm"
            variant={profile.vip ? "vip" : "primary"}
            disabled={full || room.launched}
            onClick={() => joinRoom(room.id)}
          >
            {full ? t("rooms.full") : profile.vip ? t("rooms.joinVip") : t("rooms.join")}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            copy(room.queue.map((m) => `${m.name}: ${m.code}`).join("\n"), t("copied"))
          }
        >
          {t("rooms.copyAllCodes")}
        </Button>
        {canManage ? (
          <>
            <Button size="sm" variant="accent" onClick={() => broadcastSiren(room.id)}>
              <Siren className="h-3.5 w-3.5" />
              {t("siren.title")} · 30
            </Button>
            <Button
              size="sm"
              variant="accent"
              disabled={room.launched}
              onClick={() => launchRoom(room.id)}
            >
              {t("rooms.launch")}
            </Button>
            <Button size="sm" variant="danger" onClick={() => removeRoom(room.id)}>
              {isAdmin && !isHost ? t("rooms.adminClean") : t("rooms.disband")}
            </Button>
          </>
        ) : null}
      </div>

      <div className="rounded-xl border border-vip/25 bg-vip/5 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-vip">
            <Sparkles className="h-3.5 w-3.5" />
            {t("lottery.title")}{" "}
            <Badge tone="vip">
              {room.lottery.pot} {t("wallet.coins")}
            </Badge>
          </div>
          <button
            className={cn(
              "rounded-lg px-2 py-1 text-[10px] font-semibold",
              room.lottery.enabled ? "bg-vip/20 text-vip" : "bg-surface-2 text-muted-foreground",
            )}
            onClick={() => toggleLottery(room.id)}
          >
            {room.lottery.enabled ? t("lottery.enabled") : t("lottery.enable")}
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
          <span>{t("lottery.hint")}</span>
          {room.lottery.enabled && !room.lottery.entries.includes(profile.trainerName) ? (
            <Button size="sm" variant="vip" onClick={() => joinLottery(room.id)}>
              {t("lottery.join")}
            </Button>
          ) : null}
        </div>
        {room.lottery.winner ? (
          <div className="mt-2 text-[11px] font-semibold text-vip">
            {t("lottery.winner")}：{room.lottery.winner}
          </div>
        ) : null}
        {canManage && room.lottery.enabled && room.lottery.pot > 0 ? (
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const confirmed = window.confirm(
                  "请先核对接单人的游戏角色名和闪光/100IV截图凭证，确认无误后再发放彩池金币。",
                );
                if (confirmed) settleRoom(room.id, "shiny");
              }}
            >
              {t("lottery.shinySettle")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => settleRoom(room.id, "normal")}>
              {t("lottery.normalDrop")}
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
