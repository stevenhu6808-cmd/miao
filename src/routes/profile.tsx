import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Clipboard, Coins, Crown, Gift, Upload, X } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Badge, Button, Card, Field, Input, SectionTitle } from "@/components/ui-kit";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "训练家资料卡 | Raid Nexus" },
      {
        name: "description",
        content: "设置训练家名称、游戏代号、好友代码与等级，一键复制好友码并开启 VIP 特权。",
      },
      { property: "og:title", content: "训练家资料卡" },
      { property: "og:description", content: "管理你的训练家身份、好友代码与 VIP 优先排队权限。" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useI18n();
  const { profile, setProfile, isAdmin, copy, showToast, addCoins, buyVip, submitDeposit } =
    useStore();
  const [draft, setDraft] = useState(profile);
  const [monetizationOpen, setMonetizationOpen] = useState(false);
  const [financeMode, setFinanceMode] = useState<"deposit">("deposit");
  const [financeAmount, setFinanceAmount] = useState("0.99");
  const [financeCoins, setFinanceCoins] = useState("100");
  const [financeAccount, setFinanceAccount] = useState("");
  const [financeContact, setFinanceContact] = useState("");
  const [financeProof, setFinanceProof] = useState("");

  const handleProof = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFinanceProof(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  return (
    <PageShell>
      <SectionTitle title={t("profile.title")} />

      <Card className="space-y-3 glow-primary">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/20 font-display text-lg font-bold text-primary">
            {draft.trainerName.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div className="font-display text-lg font-bold">{draft.trainerName}</div>
            <div className="mt-1 flex gap-2">
              <Badge tone="primary">LV {draft.level}</Badge>
              {draft.vip ? <Badge tone="vip">VIP</Badge> : null}
              {isAdmin ? <Badge tone="accent">{t("profile.admin")}</Badge> : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-vip/30 bg-vip/5 px-3 py-3">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-vip" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                NEXUS Coins
              </div>
              <div className="font-display text-xl font-bold text-vip">{profile.coins}</div>
            </div>
          </div>
          <Button size="sm" variant="vip" onClick={() => setMonetizationOpen(true)}>
            <Gift className="h-3.5 w-3.5" /> 获取金币
          </Button>
        </div>

        <Field label={t("profile.trainerName")}>
          <Input
            value={draft.trainerName}
            onChange={(e) => setDraft({ ...draft, trainerName: e.target.value })}
          />
        </Field>
        <Field label={t("profile.gameCode")}>
          <Input
            value={draft.gameCode}
            onChange={(e) => setDraft({ ...draft, gameCode: e.target.value })}
          />
        </Field>
        <Field label={t("profile.friendCode")}>
          <div className="flex gap-2">
            <Input
              value={draft.friendCode}
              onChange={(e) => setDraft({ ...draft, friendCode: e.target.value })}
            />
            <Button variant="outline" onClick={() => copy(draft.friendCode, t("copied"))}>
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </Field>
        <Field label={t("profile.level")}>
          <Input
            type="number"
            value={draft.level}
            onChange={(e) => setDraft({ ...draft, level: Number(e.target.value) })}
          />
        </Field>

        <Button
          className="w-full"
          onClick={() => {
            setProfile({
              ...draft,
              coins: profile.coins,
              badges: profile.badges,
              vip: profile.vip || draft.vip,
            });
            showToast(t("profile.saved"));
          }}
        >
          {t("profile.save")}
        </Button>
      </Card>

      <Card className="space-y-3">
        <p className="text-xs text-muted-foreground">{t("profile.perks")}</p>
        <Button
          variant={draft.vip ? "vip" : "outline"}
          className="w-full"
          onClick={() => {
            const next = {
              ...draft,
              vip: !draft.vip,
              coins: profile.coins,
              badges: profile.badges,
            };
            setDraft(next);
            setProfile(next);
          }}
        >
          {draft.vip ? t("profile.vipOn") : t("profile.vipOff")}
        </Button>
        <p className="text-[11px] text-muted-foreground">{t("profile.adminNote")}</p>
      </Card>

      {monetizationOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-background/75 px-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md space-y-4 border-vip/30 p-5 glow-accent">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-display text-lg font-bold text-vip">
                  <Crown className="h-5 w-5" /> Monetization Suite
                </div>
                <p className="mt-1 text-xs text-muted-foreground">只进不出模式 · 固定套餐充值</p>
              </div>
              <button
                aria-label="Close"
                className="rounded-lg p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                onClick={() => setMonetizationOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2 rounded-xl border border-border bg-surface-2/30 p-3">
              <div className="rounded-lg border border-vip/30 bg-vip/5 p-2 text-[11px] text-vip">
                固定套餐：$0.99=100币 / $4.99=500币 / $9.99=1000币 / $19.99=2000币
              </div>
              <Field label="选择充值套餐">
                <select
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
                  value={financeAmount}
                  onChange={(event) => {
                    const value = event.target.value;
                    const packageMap = {
                      "0.99": 100,
                      "4.99": 500,
                      "9.99": 1000,
                      "19.99": 2000,
                    } as const;
                    setFinanceAmount(value);
                    setFinanceCoins(String(packageMap[value as keyof typeof packageMap] ?? 100));
                  }}
                >
                  <option value="0.99">$0.99 = 100 金币</option>
                  <option value="4.99">$4.99 = 500 金币</option>
                  <option value="9.99">$9.99 = 1,000 金币</option>
                  <option value="19.99">$19.99 = 2,000 金币</option>
                </select>
              </Field>
              <Field label="到账金币">
                <Input
                  type="number"
                  min="1"
                  value={financeCoins}
                  onChange={(event) => setFinanceCoins(event.target.value)}
                />
              </Field>
              <Field label="收款账号信息">
                <Input
                  value={financeAccount}
                  placeholder="钱包地址 / 支付账号 / 备注"
                  onChange={(event) => setFinanceAccount(event.target.value)}
                />
              </Field>
              <Field label="联系方式">
                <Input
                  value={financeContact}
                  placeholder="Telegram / Discord / 手机"
                  onChange={(event) => setFinanceContact(event.target.value)}
                />
              </Field>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-xs text-primary">
                <Upload className="h-4 w-4" />
                {financeProof ? "凭证已读取，可重新上传" : "上传转账凭证 / 收款截图"}
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleProof(event.target.files?.[0])}
                />
              </label>
              <Button
                className="w-full"
                onClick={() => {
                  const amount = Number(financeAmount);
                  if (
                    !financeAccount.trim() ||
                    !financeContact.trim() ||
                    !Number.isFinite(amount) ||
                    amount <= 0
                  ) {
                    showToast("请完整填写金额、户口信息和联系方式");
                    return;
                  }
                  submitDeposit({
                    amount,
                    coins: Math.max(1, Number(financeCoins)),
                    proof: financeProof,
                    accountInfo: financeAccount.trim(),
                    contact: financeContact.trim(),
                  });
                  setFinanceProof("");
                  setFinanceAccount("");
                  setFinanceContact("");
                  setFinanceAmount("0.99");
                  setFinanceCoins("100");
                  setMonetizationOpen(false);
                }}
              >
                提交充值审核
              </Button>
            </div>
            <div className="space-y-2">
              <button
                className="flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-left transition hover:bg-primary/15"
                onClick={() => addCoins(5, "激励广告奖励")}
              >
                <Gift className="h-5 w-5 text-primary" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold">观看激励广告</span>
                  <span className="text-[11px] text-muted-foreground">完整观看后获得 +5 金币</span>
                </span>
                <span className="font-display text-sm font-bold text-primary">+5</span>
              </button>
              <button
                className="flex w-full items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 p-3 text-left transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={profile.vip}
                onClick={() => buyVip()}
              >
                <Crown className="h-5 w-5 text-accent" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold">购买 VIP 插队特权</span>
                  <span className="text-[11px] text-muted-foreground">199 金币 · 优先进入队列</span>
                </span>
                {profile.vip ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <span className="font-display text-sm font-bold text-accent">199</span>
                )}
              </button>
              <button
                className="flex w-full items-center gap-3 rounded-xl border border-vip/30 bg-vip/10 p-3 text-left transition hover:bg-vip/15"
                onClick={() => addCoins(50, "测试充值包")}
              >
                <Coins className="h-5 w-5 text-vip" />
                <span className="flex-1">
                  <span className="block text-sm font-semibold">金币充值包</span>
                  <span className="text-[11px] text-muted-foreground">测试模式 · 购买 50 金币</span>
                </span>
                <span className="font-display text-sm font-bold text-vip">+50</span>
              </button>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setMonetizationOpen(false)}>
              关闭
            </Button>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
