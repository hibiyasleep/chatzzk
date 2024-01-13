chatzzk - Chzzk Chat API
========================

Currently read-only. quite unstable.

Usage
-----

Please **pin a major version** on your dependency, as API may change suddenly.

```js
import Chzzk from 'https://unpkg.com/chatzzk@0.1/src/index.mjs'

const chatzzk = new Chatzzk('a9ab391cdd3faef4ca2ee782e96e5c59', {
  // timeout
  rpcTimeout: 1_000,
  // will log any message not handled by onmessage()
  logUnhandledMessage: false,
  // your own API proxy - required if CORS applied
  api: {
    liveStatus: uid => `https://example.com/live-status/${uid}`,
    accessToken: cid => `https://example.com/access-token/${cid}`
  }
})

c.on('message', payload => {
  // name color parsed & provided in paylaod.color
  console.log(chalk.hex(payload.color)(payload.profile.nickname), payload.msg)
})

```

Notes about Closed API
----------------------

### API Proxies

Basically, on browser, Naver API will disallow your access with CORS policy. 
you may provide your own API proxy against this situation, or wait until full API opens.

Specify somewhat under `options.api` to head those endpoints:
- `liveStatus`: `https://api.chzzk.naver.com/polling/v2/channels/${uid}/live-status`
- `accessToken`: `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${cid}&chatType=STREAMING`
