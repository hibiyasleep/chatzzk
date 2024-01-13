export default function parseEmotes(text, emotes) {
  if(!emotes)
    return [
      { type: 'text', text }
    ]

  const chunks = []
  const matches = text.matchAll(/\{:(.+?):\}/g)
  let lastIndex = 0

  for(const match of matches) {
    const emote = match[1]
    if(!(emote in emotes)) continue

    const textAhead = text.slice(lastIndex, match.index)
    textAhead && chunks.push({ type: 'text', text: textAhead })

    chunks.push({ type: 'emote', id: emote, from: 'chzzk', text: emotes[emote] })
    lastIndex = match.index + match[0].length
  }

  const lastText = text.slice(lastIndex)
  lastText && chunks.push({ type: 'text', text: lastText })

  return chunks
}
