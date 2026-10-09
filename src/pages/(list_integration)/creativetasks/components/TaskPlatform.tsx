import type { BaseCreativeTaskDto, EventTaskDto } from "@/api/generated/model";
import vk from "@/assets/task-flow/vk.svg";
import youtube from "@/assets/task-flow/youtube.svg";

export function TaskPlatform({ platform }: { platform: BaseCreativeTaskDto["targetPlatform"] | EventTaskDto["targetPlatform"] }) {
  const isVk = platform === "VK_GROUP" || platform === "VK_USER";
  const name = isVk ? "VK" : platform === "YOUTUBE_CHANNEL" ? "YouTube" : "Rutube";
  // No Rutube asset in this Figma frame: keep its real name instead of another platform's logo.
  return platform === "RUTUBE_CHANNEL" ? (
    <span className="shrink-0 text-xs text-muted-foreground" title="Rutube">Rutube</span>
  ) : (
    <span className="inline-flex size-4 shrink-0 items-center justify-center" title={name}>
      <img src={isVk ? vk : youtube} alt={name} className="max-w-none" />
    </span>
  );
}
