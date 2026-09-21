import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MapPin, MessageCircle } from "lucide-react";
import { PageShell } from "@/components/Shell";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  SectionTitle,
  Select,
  Textarea,
} from "@/components/ui-kit";
import { useI18n } from "@/lib/i18n";
import { useStore, type Post, type PostKind } from "@/lib/store";
import { cn } from "@/lib/utils";
import shinyImg from "@/assets/post-shiny.jpg";
import shadowImg from "@/assets/post-shadow.jpg";

export const Route = createFileRoute("/wall")({
  head: () => ({
    meta: [
      { title: "炫耀墙 · 闪光战绩动态 | Raid Nexus" },
      {
        name: "description",
        content: "发布闪光、百变怪、暗影与 100IV 宝可梦战绩，点赞评论与训练家互动。",
      },
      { property: "og:title", content: "炫耀墙 · 闪光战绩动态" },
      { property: "og:description", content: "晒出你的闪光与 100IV 捕捉，点赞评论实时互动。" },
    ],
  }),
  component: WallPage,
});

const KINDS: PostKind[] = ["shiny", "ditto", "shadow", "hundo"];

const kindTone = {
  shiny: "primary",
  ditto: "accent",
  shadow: "muted",
  hundo: "vip",
} as const;

function resolveImage(image?: string) {
  if (!image) return undefined;
  if (image === "shiny") return shinyImg;
  if (image === "shadow") return shadowImg;
  return image;
}

function WallPage() {
  const { t } = useI18n();
  const { posts, addPost } = useStore();
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [kind, setKind] = useState<PostKind>("shiny");
  const [image, setImage] = useState("");

  const handleImageUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  return (
    <PageShell>
      <SectionTitle title={t("wall.title")} subtitle={t("wall.subtitle")} />

      <Card className="space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("wall.compose")}
        />
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={cn(
                "tap-scale rounded-xl border px-3 py-1.5 text-xs font-semibold",
                kind === k
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              {t(`wall.kind.${k}`)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("wall.location")}>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="KLCC"
            />
          </Field>
          <Field label={t("wall.image")}>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-[11px] text-primary">
              <span>{image ? "已选择本地图片" : "上传手机相册图片"}</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleImageUpload(event.target.files?.[0])}
              />
            </label>
          </Field>
        </div>
        <Button
          className="w-full"
          disabled={!text.trim()}
          onClick={() => {
            addPost({
              kind,
              text: text.trim(),
              location: location.trim() || "—",
              ...(image.trim() ? { image: image.trim() } : {}),
              iv: { a: 15, d: 15, s: 15 },
            });
            setText("");
            setLocation("");
            setImage("");
          }}
        >
          {t("wall.post")}
        </Button>
      </Card>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </PageShell>
  );
}

function PostCard({ post }: { post: Post }) {
  const { t } = useI18n();
  const { toggleLike, addComment, removePost, isAdmin, profile } = useStore();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const src = resolveImage(post.image);
  const ivPct = Math.round(((post.iv.a + post.iv.d + post.iv.s) / 45) * 100);

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/20 font-display text-sm font-bold text-primary">
          {post.author.slice(0, 2).toUpperCase()}
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{post.author}</span>
            <Badge tone={kindTone[post.kind]}>{t(`wall.kind.${post.kind}`)}</Badge>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {post.location}
          </span>
        </div>
        {isAdmin || post.author === profile.trainerName ? (
          <button
            onClick={() => removePost(post.id)}
            className="ml-auto text-[11px] text-muted-foreground hover:text-destructive"
          >
            {t("wall.delete")}
          </button>
        ) : null}
      </div>

      <p className="text-sm leading-relaxed">{post.text}</p>

      {src ? (
        <img
          src={src}
          alt={post.text}
          loading="lazy"
          width={1024}
          height={768}
          className="w-full rounded-2xl border border-border object-cover"
        />
      ) : null}

      <div className="flex gap-2 text-[11px]">
        <Badge tone="primary">ATK {post.iv.a}</Badge>
        <Badge tone="primary">DEF {post.iv.d}</Badge>
        <Badge tone="primary">HP {post.iv.s}</Badge>
        <Badge tone="vip">{ivPct}% IV</Badge>
      </div>

      <div className="flex items-center gap-2 border-t border-border/70 pt-3">
        <Button
          size="sm"
          variant={post.liked ? "accent" : "ghost"}
          onClick={() => toggleLike(post.id)}
        >
          <Heart className={cn("h-4 w-4", post.liked && "fill-current")} /> {post.likes}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
          <MessageCircle className="h-4 w-4" /> {post.comments.length} {t("wall.comments")}
        </Button>
      </div>

      {open ? (
        <div className="space-y-2 rise-in">
          {post.comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-surface-2/50 px-3 py-2 text-xs">
              <span className="font-semibold text-primary">{c.author}</span>{" "}
              <span className="text-muted-foreground">{c.text}</span>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("wall.writeComment")}
            />
            <Button
              size="sm"
              disabled={!draft.trim()}
              onClick={() => {
                addComment(post.id, draft.trim());
                setDraft("");
              }}
            >
              {t("wall.send")}
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
