import getColor from "./color.mjs"

export const unpackBdyPayload = bdy =>
  bdy.map(_ => {
    const profile = JSON.parse(_.profile)
    return {
      ..._,
      profile,
      extras: JSON.parse(_.extras),
      color: getColor(profile, _.cid)
    }
  })
