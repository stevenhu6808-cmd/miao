import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Ban,
  Check,
  Coins,
  Eye,
  FilePenLine,
  Image as ImageIcon,
  LogOut,
  Shield,
  UserCheck,
  Wallet,
  X,
} from "lucide-react";
import { Badge, Button, Card, Field, Input, SectionTitle } from "@/components/ui-kit";
import { useStore, type Account, type FinanceOrder, type Profile, type Room } from "@/lib/store";

export const Route = createFileRoute("/admin")({ component: AdminPage });

export function AdminPage() {
  const navigate = useNavigate();
  const {
    isAdmin,
    logout,
    accounts,
    frozenAccounts,
    financeOrders,
    rooms,
    removeRoom,
    showToast,
    reviewFinanceOrder,
    toggleFrozenAccount,
    updateAccount,
    toggleAccountVip,
    resetAccountPassword,
    manualAdjustBalance,
  } = useStore();
  const [filter, setFilter] = useState<"all" | "deposit">("all");
  const [selected, setSelected] = useState<FinanceOrder | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [coins, setCoins] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!isAdmin) void navigate({ to: "/" });
  }, [isAdmin, navigate]);
  if (!isAdmin) return null;
  const pending = (kind: "deposit") =>
    financeOrders.filter((item) => item.kind === kind && item.status === "pending").length;
  const visible = financeOrders.filter((item) => filter === "all" || item.kind === filter);
  const jump = (id: string, nextFilter?: typeof filter) => {
    if (nextFilter) setFilter(nextFilter);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const adjust = (account: Account) => {
    const amount = Number(coins[account.username]);
    if (!Number.isFinite(amount) || amount === 0) return;
    manualAdjustBalance(account.username, amount, "超级管理员手动调账");
    setCoins({ ...coins, [account.username]: "" });
  };
  return (
    <div className="min-h-screen bg-background px-4 py-5 text-foreground">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-bold neon-text">NEXUS CONTROL</div>
              <div className="text-xs text-muted-foreground">超级管理员后台 · 全局运营控制台</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              void navigate({ to: "/" });
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            退出管理后台
          </Button>
        </header>
        <div className="grid gap-3 sm:grid-cols-4">
          <Metric
            label="玩家账户"
            value={String(accounts.length)}
            icon={<UserCheck />}
            onClick={() => jump("users")}
          />
          <Metric
            label="在线房间"
            value={String(rooms.length)}
            icon={<Shield />}
            onClick={() => jump("rooms")}
          />
          <Metric
            label="待审充值"
            value={String(pending("deposit"))}
            icon={<Wallet />}
            onClick={() => jump("finance", "deposit")}
          />
          <Metric
            label="用户调账"
            value={String(accounts.reduce((sum, account) => sum + account.profile.coins, 0))}
            icon={<Coins />}
            onClick={() => jump("users")}
          />
        </div>
        <Card id="finance" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <SectionTitle title="财务审核中心" subtitle="点击订单查看完整用户资料与凭证" />
            <div className="flex gap-2">
              {(["all", "deposit"] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filter === value ? "primary" : "outline"}
                  onClick={() => setFilter(value)}
                >
                  {value === "all" ? "全部" : "充值"}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {visible.map((order) => (
              <FinanceRow
                key={order.id}
                order={order}
                open={() => setSelected(order)}
                review={(decision) => reviewFinanceOrder(order.id, decision)}
              />
            ))}
          </div>
        </Card>
        <Card id="users" className="space-y-3">
          <SectionTitle
            title="用户控制中心"
            subtitle="调整金币、VIP、冻结账号、编辑资料与重置密码"
          />
          <div className="space-y-2">
            {accounts.length ? (
              accounts.map((account) => (
                <UserRow
                  key={account.username}
                  account={account}
                  frozen={frozenAccounts.includes(account.username)}
                  editing={editing === account.username}
                  coin={coins[account.username] ?? ""}
                  setCoin={(value) => setCoins({ ...coins, [account.username]: value })}
                  adjust={() => adjust(account)}
                  toggleFreeze={() => toggleFrozenAccount(account.username)}
                  toggleVip={() => toggleAccountVip(account.username)}
                  edit={() => setEditing(editing === account.username ? null : account.username)}
                  save={(profile, password) => {
                    updateAccount(account.username, profile, password || undefined);
                    setEditing(null);
                    showToast("用户资料已保存");
                  }}
                  reset={(password) => {
                    resetAccountPassword(account.username, password);
                    showToast("密码已重置");
                  }}
                />
              ))
            ) : (
              <p className="text-xs text-muted-foreground">暂无注册玩家。</p>
            )}
          </div>
        </Card>
        <Card id="rooms" className="space-y-3">
          <SectionTitle title="全局房间控制" subtitle="查看成员详情或强行解散房间" />
          <div className="grid gap-2 md:grid-cols-2">
            {rooms.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-surface-2/45 p-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">
                    {item.boss} · {item.gym}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    房主 {item.hostName} · {item.queue.length}/{item.capacity} 人 ·{" "}
                    {item.launched ? "已发车" : "排队中"}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setRoom(item)}>
                  <Eye className="h-3 w-3" />
                  详情
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    removeRoom(item.id);
                    showToast("房间已强行解散");
                  }}
                >
                  <Ban className="h-3 w-3" />
                  解散
                </Button>
              </div>
            ))}
          </div>
        </Card>
        <button
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => void navigate({ to: "/" })}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回普通首页
        </button>
      </div>
      {selected ? (
        <OrderDialog
          order={selected}
          account={accounts.find((item) => item.username === selected.username)}
          close={() => setSelected(null)}
        />
      ) : null}
      {room ? <RoomDialog room={room} close={() => setRoom(null)} /> : null}
    </div>
  );
}

function FinanceRow({
  order,
  open,
  review,
}: {
  order: FinanceOrder;
  open: () => void;
  review: (decision: "approved" | "rejected") => void;
}) {
  const pending = order.status === "pending";
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-2/45 p-3 text-xs">
      <button className="min-w-0 flex-1 text-left" onClick={open}>
        <div className="font-semibold">
          {order.id} · {order.username}
        </div>
        <div className="text-[10px] text-muted-foreground">
          {`充值 ${order.amount} USD · ${order.coins} 金币`}
        </div>
      </button>
      <Badge tone={pending ? "vip" : order.status === "approved" ? "primary" : "muted"}>
        {pending ? "待审核" : order.status === "approved" ? "已完成" : "已退回"}
      </Badge>
      <Button size="sm" variant="outline" onClick={open}>
        <Eye className="h-3 w-3" />
        资料
      </Button>
      {pending ? (
        <>
          <Button size="sm" onClick={() => review("approved")}>
            <Check className="h-3 w-3" />
            通过
          </Button>
          <Button size="sm" variant="outline" onClick={() => review("rejected")}>
            <X className="h-3 w-3" />
            退回
          </Button>
        </>
      ) : null}
    </div>
  );
}
function UserRow({
  account,
  frozen,
  editing,
  coin,
  setCoin,
  adjust,
  toggleFreeze,
  toggleVip,
  edit,
  save,
  reset,
}: {
  account: Account;
  frozen: boolean;
  editing: boolean;
  coin: string;
  setCoin: (value: string) => void;
  adjust: () => void;
  toggleFreeze: () => void;
  toggleVip: () => void;
  edit: () => void;
  save: (profile: Profile, password: string) => void;
  reset: (password: string) => void;
}) {
  const [draft, setDraft] = useState(account.profile);
  const [password, setPassword] = useState("");
  useEffect(() => setDraft(account.profile), [account.profile]);
  return (
    <div className="rounded-xl bg-surface-2/45 p-3 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold">
            {account.username} {account.profile.vip ? <Badge tone="vip">VIP</Badge> : null}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {account.profile.friendCode} · {account.profile.coins} 金币
          </div>
        </div>
        <Badge tone={frozen ? "muted" : "primary"}>{frozen ? "已冻结" : "正常"}</Badge>
        <Input
          className="w-24 py-1.5 text-xs"
          type="number"
          placeholder="±金币"
          value={coin}
          onChange={(event) => setCoin(event.target.value)}
        />
        <Button size="sm" variant="outline" onClick={adjust}>
          <Coins className="h-3 w-3" />
          调整
        </Button>
        <Button size="sm" variant="outline" onClick={toggleVip}>
          {account.profile.vip ? "取消 VIP" : "设置 VIP"}
        </Button>
        <Button size="sm" variant={frozen ? "primary" : "danger"} onClick={toggleFreeze}>
          {frozen ? "解封" : "冻结"}
        </Button>
        <Button size="sm" variant="outline" onClick={edit}>
          <FilePenLine className="h-3 w-3" />
          资料
        </Button>
      </div>
      {editing ? (
        <div className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
          <Field label="用户名">
            <Input
              value={draft.trainerName}
              onChange={(e) => setDraft({ ...draft, trainerName: e.target.value })}
            />
          </Field>
          <Field label="训练家代码">
            <Input
              value={draft.gameCode}
              onChange={(e) => setDraft({ ...draft, gameCode: e.target.value })}
            />
          </Field>
          <Field label="好友代码">
            <Input
              value={draft.friendCode}
              onChange={(e) => setDraft({ ...draft, friendCode: e.target.value })}
            />
          </Field>
          <Field label="等级">
            <Input
              type="number"
              value={draft.level}
              onChange={(e) => setDraft({ ...draft, level: Number(e.target.value) })}
            />
          </Field>
          <Field label="新密码">
            <Input
              type="password"
              value={password}
              placeholder="留空不修改"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <div className="flex items-end gap-2">
            <Button size="sm" onClick={() => save(draft, password)}>
              保存资料
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!password}
              onClick={() => {
                reset(password);
                setPassword("");
              }}
            >
              仅重置密码
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
function OrderDialog({
  order,
  account,
  close,
}: {
  order: FinanceOrder;
  account?: Account | undefined;
  close: () => void;
}) {
  return (
    <Dialog title={`${order.id} · 充值订单`} close={close}>
      <div className="grid gap-2 text-xs sm:grid-cols-2">
        <Info label="用户名" value={order.username} />
        <Info label="训练家代码" value={account?.profile.friendCode ?? "未找到"} />
        <Info label="联系方式" value={order.contact || "未填写"} />
        <Info label="收款账号" value={order.accountInfo || "未填写"} />
        <Info label="金额" value={`${order.amount} USD / ${order.coins} 金币`} />
      </div>
      {order.proof ? (
        <a
          href={order.proof}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block overflow-hidden rounded-xl border border-border"
        >
          <img src={order.proof} alt="转账凭证" className="max-h-80 w-full object-contain" />
        </a>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          <ImageIcon className="mx-auto mb-2 h-5 w-5" />
          该订单未上传凭证
        </div>
      )}
    </Dialog>
  );
}
function RoomDialog({ room, close }: { room: Room; close: () => void }) {
  return (
    <Dialog title={`${room.boss} · ${room.gym}`} close={close}>
      <div className="grid gap-2 text-xs sm:grid-cols-2">
        <Info label="房主" value={`${room.hostName} · ${room.hostCode}`} />
        <Info label="模式" value={`${room.mode} · ${room.minutes} 分钟`} />
        <Info label="密码" value={room.password ? "仅队员可见" : "远程邀请"} />
        <Info label="队列" value={`${room.queue.length}/${room.capacity}`} />
      </div>
      <div className="mt-3 space-y-2">
        {room.queue.map((member) => (
          <div
            key={member.id}
            className="flex justify-between rounded-lg bg-surface-2/50 px-3 py-2 text-xs"
          >
            <span>{member.name}</span>
            <span className="text-muted-foreground">{member.ready ? "已准备" : "未准备"}</span>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
function Dialog({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="glass-card max-h-[90vh] w-full max-w-2xl overflow-auto p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-primary">{title}</h2>
          <button aria-label="关闭" onClick={close}>
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2/40 p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
function Metric({
  label,
  value,
  icon,
  onClick,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="text-left" onClick={onClick}>
      <Card className="flex items-center gap-3 transition hover:border-primary/60">
        <span className="text-primary">{icon}</span>
        <div>
          <div className="font-display text-xl font-bold">{value}</div>
          <div className="text-[10px] text-muted-foreground">{label}</div>
        </div>
      </Card>
    </button>
  );
}
