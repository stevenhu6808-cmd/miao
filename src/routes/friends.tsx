import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Circle, ImagePlus, MessageCircle, UserPlus } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Badge, Button, Card, Input, SectionTitle, Textarea } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { compressImage } from "@/lib/utils";

export const Route = createFileRoute("/friends")({ component: FriendsPage });

function FriendsPage() {
  const {
    profile,
    accounts,
    friends,
    onlineUsers,
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    directMessages,
    sendDirectMessage,
    showToast,
  } = useStore();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState("");
  useEffect(() => {
    const target = window.localStorage.getItem("raid-nexus-open-chat");
    if (target && accounts.some((account) => account.profile.trainerName === target)) {
      setSelected(target);
      window.localStorage.removeItem("raid-nexus-open-chat");
    }
  }, [accounts]);
  const incoming = friendRequests.filter(
    (request) => request.to === profile.trainerName && request.status === "pending",
  );
  const targets = accounts.filter((account) =>
    `${account.username} ${account.profile.trainerName} ${account.profile.gameCode}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const messages = selected ? directMessages(selected) : [];

  return (
    <PageShell>
      <SectionTitle title="好友与私聊" subtitle="添加队友，查看在线状态并发起一对一交流" />
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <UserPlus className="h-4 w-4 text-primary" />
          搜索玩家
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="输入玩家名称或游戏代号"
        />
        <div className="space-y-2">
          {targets
            .filter((account) => account.profile.trainerName !== profile.trainerName)
            .slice(0, 6)
            .map((account) => {
              const name = account.profile.trainerName;
              const isFriend = friends.includes(name);
              return (
                <div
                  key={account.username}
                  className="flex items-center gap-3 rounded-xl bg-surface-2/45 px-3 py-2 text-xs"
                >
                  <span
                    className={
                      onlineUsers.includes(name) ? "text-primary" : "text-muted-foreground"
                    }
                  >
                    <Circle className="h-2.5 w-2.5 fill-current" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {account.profile.gameCode} · {onlineUsers.includes(name) ? "在线" : "离线"}
                    </div>
                  </div>
                  {isFriend ? (
                    <Button size="sm" variant="outline" onClick={() => setSelected(name)}>
                      <MessageCircle className="h-3.5 w-3.5" />
                      私聊
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => sendFriendRequest(name)}>
                      <UserPlus className="h-3.5 w-3.5" />
                      加好友
                    </Button>
                  )}
                </div>
              );
            })}
        </div>
      </Card>
      {incoming.length ? (
        <Card className="space-y-2">
          <div className="text-sm font-bold">好友申请</div>
          {incoming.map((request) => (
            <div
              key={request.id}
              className="flex items-center gap-2 rounded-xl bg-surface-2/45 px-3 py-2 text-xs"
            >
              <span className="flex-1">{request.from} 请求添加你为好友</span>
              <Button size="sm" onClick={() => acceptFriendRequest(request.id)}>
                <Check className="h-3.5 w-3.5" />
                接受
              </Button>
            </div>
          ))}
        </Card>
      ) : null}
      {selected ? (
        <Card className="space-y-3 border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold">
              <MessageCircle className="h-4 w-4 text-primary" />与 {selected} 私聊
            </div>
            <Badge tone={onlineUsers.includes(selected) ? "primary" : "muted"}>
              {onlineUsers.includes(selected) ? "在线" : "离线"}
            </Badge>
          </div>
          <div className="rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-[11px] text-accent">
            本平台仅供组队交流，严禁私下进行宝可梦、账号或道具买卖交易
          </div>
          <div className="max-h-64 space-y-2 overflow-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-xl px-3 py-2 text-xs ${message.from === profile.trainerName ? "ml-8 bg-primary/15" : "mr-8 bg-surface-2/60"}`}
              >
                {message.text}
                {message.image ? (
                  <img src={message.image} alt="聊天凭证" className="mt-2 max-h-40 rounded-lg" />
                ) : null}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Textarea
              className="min-w-48 flex-1"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="发送消息，平台会自动拦截交易内容"
            />
            <label className="flex cursor-pointer items-center rounded-xl border border-border px-3 text-xs">
              <ImagePlus className="h-4 w-4" />
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) setImage(await compressImage(file));
                }}
              />
            </label>
            <Button
              onClick={() => {
                if (draft.trim() || image) {
                  sendDirectMessage(selected, draft, image);
                  setDraft("");
                  setImage("");
                } else showToast("请输入消息或选择图片");
              }}
            >
              发送
            </Button>
          </div>
        </Card>
      ) : null}
    </PageShell>
  );
}
