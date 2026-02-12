import type { EmojiItem } from "@tiptap/extension-emoji"

const APPLE_EMOJI_BASE = "/emoji/apple/64/"

function emojiToCodepoints(emoji: string): string {
  const codepoints: string[] = []
  for (let i = 0; i < emoji.length; i++) {
    const code = emoji.codePointAt(i)
    if (!code) continue
    if (code > 0xffff) i++
    codepoints.push(code.toString(16))
  }
  return codepoints.join("-")
}

export function withAppleEmojiFallbacks<T extends EmojiItem>(emojis: T[]): T[] {
  return emojis.map((emoji) => {
    if (!emoji.emoji) return emoji
    const codepoints = emojiToCodepoints(emoji.emoji)
    if (!codepoints) return emoji
    return {
      ...emoji,
      fallbackImage: `${APPLE_EMOJI_BASE}${codepoints}.png`,
    }
  })
}
