import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Circle, ImagePlus, MessageCircle, UserPlus } from "lucide-react";
import { PageShell } from "@/components/Shell";
import { Badge, Button, Card, Input, SectionTitle } from "@/components/ui-kit";
import { useStore } from "@/lib/store";

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
    openDirectChat,
  } = useStore();
  const [query, setQuery] = useState("");
  const incoming = friendRequests.filter(
    (request) => request.to === profile.trainerName && request.status === "pending",
  );
  const targets = accounts.filter((account) =>
    `${account.username} ${account.profile.trainerName} ${account.profile.gameCode}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

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
                    <Button size="sm" variant="outline" onClick={() => openDirectChat(name)}>
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
    </PageShell>
  );
}
