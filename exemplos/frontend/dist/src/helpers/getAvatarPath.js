export function getAvatarPath(userId, gender, variant) {
    const folder = gender === "Female" ? "woman" : "man";
    const imageVariant = variant !== null && variant !== void 0 ? variant : ((userId % 4) + 1);
    return `./src/assets/${folder}-${imageVariant}.png`;
}
