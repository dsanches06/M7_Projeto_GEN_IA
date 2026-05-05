export function getAvatarPath(userId: number, gender: string, variant?: number): string {
  const folder = gender === "Female" ? "woman" : "man";
  const imageVariant = variant ?? ((userId % 4) + 1);
  return `./src/assets/${folder}-${imageVariant}.png`;
}
