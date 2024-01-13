const Chatzzk = (await import('./src/index.mjs')).default

const c = new Chatzzk('a9ab391cdd3faef4ca2ee782e96e5c59', {
  logUnhandledMessage: true
  // api: {
  //   liveStatus: uid => `https://example.com/live-status/${uid}`,
  //   accessToken: cid => `https://example.com/access-token/${cid}`
  // }
})

c.on('message', m => {
  console.log(m.color, m.profile.nickname, m.msg)
})

c.connect()
