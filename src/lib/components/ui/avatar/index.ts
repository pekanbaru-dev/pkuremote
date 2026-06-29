import Root from "./avatar.svelte";
import Image from "./avatar-image.svelte";
import Fallback from "./avatar-fallback.svelte";
import { avatarVariants, type AvatarSize } from "./avatar.svelte";

export { Root, Image, Fallback, avatarVariants, type AvatarSize };

export const Avatar = { Root, Image, Fallback };
