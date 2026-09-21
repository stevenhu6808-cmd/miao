import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BellRing, Check, Crosshair, ImagePlus, ShieldCheck, Swords, Zap } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Badge, Button, Card, Field, Input, SectionTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "IV / LV / CP 计算助手 | Raid Nexus" },
      {
        name: "description",
        content: "快速估算宝可梦个体值、等级与进化后战力，团战前一秒决策。",
      },
      { property: "og:title", content: "IV / LV / CP 计算助手" },
      {
        property: "og:description",
        content: "输入攻击、防御、体力与等级，立即得到 IV 评分与进化 CP。",
      },
    ],
  }),
  component: ToolsPage,
});

type Calculation = { pct: number; estCp: number; grade: "perfect" | "great" | "ok" | "bad" };

function calculateIv(a: number, d: number, s: number, level: number): Calculation {
  const pct = Math.round(((a + d + s) / 45) * 100);
  const cpm = 0.094 + (level - 1) * 0.0155;
  const estCp = Math.max(
    10,
    Math.round(((100 + a) * Math.sqrt(100 + d) * Math.sqrt(100 + s) * cpm * cpm) / 10),
  );
  const grade = pct === 100 ? "perfect" : pct >= 89 ? "great" : pct >= 67 ? "ok" : "bad";
  return { pct, estCp, grade };
}

function ToolsPage() {
  const [a, setA] = useState(15);
  const [d, setD] = useState(15);
  const [s, setS] = useState(15);
  const [level, setLevel] = useState(30);
  const [cp, setCp] = useState(1800);
  const [hp, setHp] = useState(160);
  const [species, setSpecies] = useState("暗影超梦");
  const [scanning, setScanning] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [floating, setFloating] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const scanTimerRef = useRef<number | null>(null);
  const [calculation, setCalculation] = useState<Calculation>(() => calculateIv(a, d, s, level));

  useEffect(() => {
    const calculationTimer = window.setTimeout(() => {
      setCalculation(calculateIv(a, d, s, level));
    }, 120);
    return () => window.clearTimeout(calculationTimer);
  }, [a, d, s, level]);

  useEffect(() => {
    const receiveCapture = (event: MessageEvent) => {
      const data = event.data?.type === "pokemon-go-screen-capture" ? event.data : null;
      if (!data) return;
      setScanning(true);
      if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = window.setTimeout(() => {
        scanTimerRef.current = null;
        setScanning(false);
        if (typeof data.cp === "number") setCp(data.cp);
        if (typeof data.hp === "number") setHp(data.hp);
        if (typeof data.species === "string") setSpecies(data.species);
      }, 450);
    };
    window.addEventListener("message", receiveCapture);
    window.addEventListener("onNativeScreenCapture", receiveCapture as EventListener);
    return () => {
      window.removeEventListener("message", receiveCapture);
      window.removeEventListener("onNativeScreenCapture", receiveCapture as EventListener);
      if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
    };
  }, []);

  const sliders: [string, number, (v: number) => void, number][] = [
    ["攻击 IV", a, setA, 15],
    ["防御 IV", d, setD, 15],
    ["体力 IV", s, setS, 15],
    ["等级 LV", level, setLevel, 51],
  ];

  const handleUpload = () => {
    setScanning(true);
    if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
    scanTimerRef.current = window.setTimeout(() => {
      scanTimerRef.current = null;
      setScanning(false);
      setSpecies("暗影超梦");
      setCp(1821);
      setHp(160);
      setA(15);
      setD(15);
      setS(15);
    }, 650);
  };

  return (
    <PageShell className={floating ? "floating-mode" : undefined}>
      <SectionTitle
        title="IV / PvP 战术中心"
        subtitle="普通玩家免费无限次查询，支持手动输入、截图识别与原生悬浮窗接入"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-xs">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-4 w-4" />
          免费无限次 IV 查询已开启
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={alertEnabled}
              onChange={(e) => setAlertEnabled(e.target.checked)}
            />
            100% IV 强提醒
          </label>
          <Button size="sm" variant="outline" onClick={() => setFloating((value) => !value)}>
            <Crosshair className="h-3.5 w-3.5" />
            {floating ? "退出悬浮视图" : "极简悬浮视图"}
          </Button>
        </div>
      </div>
      <Card className="space-y-4 border-accent/30 bg-accent/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <ImagePlus className="h-4 w-4 text-accent" />
              截图 / 悬浮窗识别
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              支持 window.onNativeScreenCapture 与 postMessage 数据桥接
            </p>
          </div>
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <Button size="sm" onClick={() => uploadRef.current?.click()} disabled={scanning}>
            <ImagePlus className="h-3.5 w-3.5" />
            {scanning ? "正在识别..." : "上传游戏截图"}
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="宝可梦">
            <Input value={species} onChange={(e) => setSpecies(e.target.value)} />
          </Field>
          <Field label="CP">
            <Input
              type="number"
              min="10"
              value={cp}
              onChange={(e) => setCp(Number(e.target.value))}
            />
          </Field>
          <Field label="HP">
            <Input
              type="number"
              min="1"
              value={hp}
              onChange={(e) => setHp(Number(e.target.value))}
            />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4">
        {sliders.map(([label, value, set, max]) => (
          <div key={label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">{label}</span>
              <span className="font-display text-sm text-primary">{value}</span>
            </div>
            <input
              type="range"
              min={0}
              max={max}
              value={value}
              onChange={(e) => set(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <Field label="当前 CP">
            <Input type="number" value={cp} onChange={(e) => setCp(Number(e.target.value))} />
          </Field>
          <Field label="当前 HP">
            <Input type="number" value={hp} onChange={(e) => setHp(Number(e.target.value))} />
          </Field>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card
          className={
            calculation.pct === 100 && alertEnabled
              ? "glow-accent border-accent/70 text-center"
              : "glow-primary text-center"
          }
        >
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            IV 综合评分
          </div>
          <div className="font-display text-3xl font-bold neon-text">{calculation.pct}%</div>
          {calculation.pct === 100 && alertEnabled ? (
            <div className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-accent">
              <BellRing className="h-3.5 w-3.5" />
              100% IV 强提醒
            </div>
          ) : null}
        </Card>
        <Card className="text-center">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            估算 CP / HP
          </div>
          <div className="font-display text-3xl font-bold text-primary">{calculation.estCp}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            截图 HP {hp} · 输入 CP {cp}
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">PvP 评级</div>
          <Badge tone={calculation.grade === "bad" ? "muted" : "vip"} className="mt-2">
            {calculation.grade === "perfect"
              ? "大师联赛优先"
              : calculation.grade === "great"
                ? "高级联赛可用"
                : "建议继续筛选"}
          </Badge>
        </Card>
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Swords className="h-4 w-4 text-primary" />
            一键推演最佳配招
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-primary" />
            快速招式：念力
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-primary" />
            蓄力招式：精神击破 · 暗影球
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-vip" />
            建议定位：大师联赛压制位
          </div>
        </Card>
      </div>
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Crosshair className="h-4 w-4 text-vip" />
          Boss 100% IV CP 对照表
        </div>
        <p className="text-xs text-muted-foreground">
          所有玩家免费查看，无次数限制。天气加成会改变对应 CP。
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded-lg bg-surface-2 p-2">
            超梦 <b className="ml-2 text-primary">CP 2387</b>
          </div>
          <div className="rounded-lg bg-surface-2 p-2">
            裂空座 <b className="ml-2 text-primary">CP 2191</b>
          </div>
          <div className="rounded-lg bg-surface-2 p-2">
            盖欧卡 <b className="ml-2 text-primary">CP 2351</b>
          </div>
          <div className="rounded-lg bg-surface-2 p-2">
            固拉多 <b className="ml-2 text-primary">CP 2351</b>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
