import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  Clipboard,
  Coins,
  Crown,
  Gift,
  MessageCircle,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Badge, Button, Card, Field, Input, SectionTitle } from "@/components/ui-kit";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { compressImage } from "@/lib/utils";

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
  const {
    profile,
    setProfile,
    isAdmin,
    copy,
    showToast,
    buyVip,
    submitDeposit,
    friends,
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    openDirectChat,
  } = useStore();
  const [draft, setDraft] = useState(profile);
  const [monetizationOpen, setMonetizationOpen] = useState(false);
  const [financeMode, setFinanceMode] = useState<"deposit">("deposit");
  const [financeAmount, setFinanceAmount] = useState("0.99");
  const [financeCoins, setFinanceCoins] = useState("100");
  const [financeAccount, setFinanceAccount] = useState("");
  const [financeContact, setFinanceContact] = useState("");
  const [financeProof, setFinanceProof] = useState("");

  const handleProof = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    try {
      setFinanceProof(await compressImage(file, 1000));
    } catch {
      setFinanceProof("");
    }
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
            if (draft.vip) {
              showToast(t("profile.vipOn"));
              return;
            }
            buyVip();
          }}
        >
          {draft.vip ? t("profile.vipOn") : t("profile.vipOff")}
        </Button>
        <p className="text-[11px] text-muted-foreground">{t("profile.adminNote")}</p>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <UserPlus className="h-4 w-4 text-primary" />
          好友列表与申请
        </div>
        {friends.length ? (
          friends.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-xl bg-surface-2/45 px-3 py-2 text-xs"
            >
              <span className="flex-1 font-semibold">{name}</span>
              <Button size="sm" variant="outline" onClick={() => openDirectChat(name)}>
                <MessageCircle className="h-3.5 w-3.5" /> 私聊
              </Button>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">暂无好友，可在房间玩家名片中添加。</p>
        )}
        {friendRequests
          .filter((request) => request.to === profile.trainerName && request.status === "pending")
          .map((request) => (
            <div
              key={request.id}
              className="flex items-center gap-2 rounded-xl border border-primary/20 px-3 py-2 text-xs"
            >
              <span className="flex-1">{request.from} 请求添加你为好友</span>
              <Button size="sm" onClick={() => acceptFriendRequest(request.id)}>
                <Check className="h-3.5 w-3.5" /> 接受
              </Button>
            </div>
          ))}
        <p className="text-[10px] text-muted-foreground">
          点击玩家名片后，私聊会以全局悬浮抽屉打开，不改变当前页面。
        </p>
      </Card>

      {monetizationOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-background/95 px-4">
          <div className="glass-card w-full max-w-md space-y-4 border-vip/30 p-5 glow-accent">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-display text-lg font-bold text-vip">
                  <Crown className="h-5 w-5" /> 金币充值
                </div>
                <p className="mt-1 text-xs text-muted-foreground">固定套餐充值，提交后进入审核</p>
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
              <Field label="支付备注">
                <Input
                  value={financeAccount}
                  placeholder="填写支付方式或订单备注"
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
                  const coins = Number(financeCoins);
                  if (
                    !financeAccount.trim() ||
                    !financeContact.trim() ||
                    !Number.isFinite(amount) ||
                    amount <= 0 ||
                    !Number.isInteger(coins) ||
                    coins <= 0
                  ) {
                    showToast("请完整填写金额、户口信息和联系方式");
                    return;
                  }
                  submitDeposit({
                    amount,
                    coins,
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
            <Button variant="outline" className="w-full" onClick={() => setMonetizationOpen(false)}>
              关闭
            </Button>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
