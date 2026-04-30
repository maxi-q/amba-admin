import bridge from "@vkontakte/vk-bridge";

const VK_API_VERSION = "5.199";

type VkAuthTokenResponse = {
  access_token: string;
};

type VkResolveScreenNameResponse = {
  type?: string;
  object_id?: number;
};

function getVkAppId() {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get("vk_app_id");
  const fromStorage = localStorage.getItem("vk_app_id");
  const appId = Number(fromUrl || fromStorage);

  if (fromUrl) {
    localStorage.setItem("vk_app_id", fromUrl);
  }

  return Number.isFinite(appId) && appId > 0 ? appId : null;
}

export function extractVkProfileSlug(input: string) {
  const trimmed = input.trim();
  const match = trimmed.match(/^(?:https?:\/\/)?(?:m\.)?vk\.com\/([^/?#]+)/i);

  if (!match?.[1]) {
    return null;
  }

  return decodeURIComponent(match[1]).replace(/^@/, "");
}

export async function resolveVkProfileId(input: string) {
  const slug = extractVkProfileSlug(input);

  if (!slug) {
    throw new Error("Укажите ссылку на профиль VK, например https://vk.com/id1");
  }

  const directId = slug.match(/^id(\d+)$/i)?.[1];
  if (directId) {
    return directId;
  }

  const appId = getVkAppId();
  if (!appId) {
    throw new Error("Не удалось определить VK app_id для получения id профиля.");
  }

  await bridge.send("VKWebAppInit");

  const tokenResponse = (await bridge.send("VKWebAppGetAuthToken", {
    app_id: appId,
    scope: "",
  })) as VkAuthTokenResponse;

  const resolved = (await bridge.send("VKWebAppCallAPIMethod", {
    method: "utils.resolveScreenName",
    params: {
      access_token: tokenResponse.access_token,
      screen_name: slug,
      v: VK_API_VERSION,
    },
  })) as VkResolveScreenNameResponse;

  if (resolved.type !== "user" || !resolved.object_id) {
    throw new Error("Ссылка должна вести на профиль пользователя VK.");
  }

  return String(resolved.object_id);
}
