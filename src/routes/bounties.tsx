import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ImagePlus, MessageCircle, Target, Undo2 } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Badge, Button, Card, Field, Input, SectionTitle, Textarea } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { compressImage } from "@/lib/utils";

export const Route = createFileRoute("/bounties")({ component: BountiesPage });

function BountiesPage() {
  const navigate = useNavigate();
  const {
    bounties,
    profile,
    createBounty,
    cancelBounty,
    acceptBounty,
    submitBountyProof,
    settleBounty,
  } = useStore();
  const [request, setRequest] = useState("");
  const [boss, setBoss] = useState("Shadow Mewtwo");
  const [reward, setReward] = useState(100);

  return (
    <PageShell>
      <SectionTitle title="玩家悬赏大厅" subtitle="托管、接单、凭证确认，完成后自动结算金币" />
      <Card className="space-y-3 border-accent/30 bg-accent/5">
        <div className="flex items-center gap-2 text-sm font-bold text-accent">
          <Target className="h-4 w-4" />
          发布悬赏
        </div>
        <Textarea
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          placeholder="描述需要协助完成的任务"
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_0.5fr]">
          <Field label="悬赏目标">
            <Input
              value={boss}
              onChange={(event) => setBoss(event.target.value)}
              placeholder="Boss / 人物"
            />
          </Field>
          <Field label="任务要求">
            <Input
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              placeholder="例如：协助完成一次团战"
            />
          </Field>
          <Field label="托管金币">
            <Input
              type="number"
              min="5"
              value={reward}
              onChange={(event) => setReward(Number(event.target.value))}
            />
          </Field>
        </div>
        <Button
          className="w-full"
          disabled={!request.trim() || reward < 5}
          onClick={() => {
            createBounty(request.trim(), boss.trim() || "Raid Boss", reward);
            setRequest("");
          }}
        >
          发布并托管 {Math.max(5, Math.floor(reward))} 金币
        </Button>
      </Card>
      <div className="grid gap-3">
        {bounties.map((bounty) => (
          <BountyCard
            key={bounty.id}
            bounty={bounty}
            isSelf={bounty.author === profile.trainerName}
            profileName={profile.trainerName}
            onCancel={() => cancelBounty(bounty.id)}
            onAccept={() => acceptBounty(bounty.id)}
            onProof={(proof) => submitBountyProof(bounty.id, proof)}
            onSettle={() => settleBounty(bounty.id)}
            onChat={() => {
              if (bounty.acceptedBy) {
                window.localStorage.setItem("raid-nexus-open-chat", bounty.acceptedBy);
                void navigate({ to: "/friends" });
              }
            }}
          />
        ))}
      </div>
    </PageShell>
  );
}

function BountyCard({
  bounty,
  isSelf,
  profileName,
  onCancel,
  onAccept,
  onProof,
  onSettle,
  onChat,
}: {
  bounty: ReturnType<typeof useStore>["bounties"][number];
  isSelf: boolean;
  profileName: string;
  onCancel: () => void;
  onAccept: () => void;
  onProof: (proof: string) => void;
  onSettle: () => void;
  onChat: () => void;
}) {
  const [proof, setProof] = useState(bounty.proof ?? "");
  const statusLabel = {
    open: "待接单",
    accepted: "进行中",
    completed: "已完成",
    cancelled: "已取消",
  }[bounty.status];
  const upload = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setProof(await compressImage(file));
  };
  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
          <Target className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{bounty.request}</h3>
            <Badge
              tone={
                bounty.status === "completed"
                  ? "primary"
                  : bounty.status === "cancelled"
                    ? "muted"
                    : "vip"
              }
            >
              {statusLabel}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            目标：{bounty.boss} · 发布者：{bounty.author} · 托管 {bounty.reward} 金币
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {isSelf && bounty.status === "open" ? (
          <Button size="sm" variant="outline" onClick={onCancel}>
            <Undo2 className="h-3.5 w-3.5" />
            取消任务并退款
          </Button>
        ) : null}
        {!isSelf && bounty.status === "open" ? (
          <Button size="sm" variant="accent" onClick={onAccept}>
            接单任务
          </Button>
        ) : null}
        {!isSelf && bounty.status === "accepted" && bounty.acceptedBy === profileName ? (
          <>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-primary/40 px-3 py-2 text-xs text-primary">
              <ImagePlus className="h-3.5 w-3.5" />
              {proof ? "凭证已读取" : "上传完成凭证"}
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(event) => void upload(event.target.files?.[0])}
              />
            </label>
            <Button size="sm" disabled={!proof} onClick={() => onProof(proof)}>
              提交凭证
            </Button>
          </>
        ) : null}
        {isSelf && bounty.status === "accepted" ? (
          <>
            <Button size="sm" variant="outline" onClick={onChat}>
              <MessageCircle className="h-3.5 w-3.5" />
              联系接单人
            </Button>
            <Button size="sm" disabled={!bounty.proof} onClick={onSettle}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              确认完成并付款
            </Button>
          </>
        ) : null}
      </div>
      {bounty.proof ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
          已上传完成凭证，等待确认
        </div>
      ) : null}
    </Card>
  );
}
