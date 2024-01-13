import EventEmitter from '../lib/event.mjs'

import { toOpcode, toCommand, COMMANDS } from './commands.mjs'
import * as util from './util.mjs'

import parseEmotes from './emote.mjs'
import getColor from './color.mjs'

const WebSocket = globalThis.WebSocket ?? (await import('ws')).default

// non-browser only
const FETCH_OPTIONS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Referer': 'https://chzzk.naver.com/',
    'Cookie': 'ba.uuid=147c2af7-076c-4ed1-98fb-13b01ab94480'
  }
}

export default class Chatzzk extends EventEmitter {
  constructor(uid, options = {}) {
    super()

    this.options = {
      rpcTimeout: 1_000,
      logUnhandledMessage: false,
      api: {
        liveStatus: options?.api?.liveStatus ??
          (uid => `https://api.chzzk.naver.com/polling/v2/channels/${uid}/live-status`),
        accessToken: options?.api?.accessToken ??
          (cid => `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${cid}&chatType=STREAMING`)
      },
      ...options
    }

    this.socket = null
    this.servers = []

    this.uid = uid
    this.cid = null
    this.sid = null
    this.tid = 0

    this._rpcCallback = {}
  }

  get defaultMeta() {
    return {
      ver: '2',
      svcid: 'game',
      cid: this.cid,
      tid: this.tid++
    }
  }

  getCid(uid) {
    return fetch(this.options.api.liveStatus(uid), FETCH_OPTIONS)
      .then(_ => _.json())
      .then(_ => {
        if(_?.code !== 200)
          throw new Error(`Code ${_.code}: ${_.message}`)
        if(!_?.content?.chatChannelId)
          throw new Error(`can't resolve chatChannelId; got '${_?.content?.chatChannelId}'`)

        return _.content.chatChannelId
      })
  }
  getToken(cid) {
    return fetch(this.options.api.accessToken(cid), FETCH_OPTIONS)
      .then(_ => _.json())
      .then(_ => {
        if(_?.code !== 200)
          throw new Error(`Code ${_.code}: ${_.message}`)

        return _
      })
      .then(_ => _.content.accessToken)
  }
  getSessionServers() {
    // this is CORS safe, for unknown reason
    return fetch('https://api.mobilecore.naver.com/routing/getRouting?serviceId=game', FETCH_OPTIONS)
      .then(_ => _.json())
      .then(_ => _.result.sessionServerList)
  }
  async getServer() {
    if(!this.servers.length)
      this.servers = await this.getSessionServers()

    return this.servers[~~(this.servers.length * Math.random())]
  }

  async connect() {
    if(this.socket) {
      this.socket?.close?.()
      this.socket = null
    }

    this.socket = new WebSocket('wss://' + await this.getServer() + '/chat', [], {
      finishRequest(request, ws) {
        Object.entries(FETCH_OPTIONS.headers).map(([ k, v ]) => request.setHeader(k, v))
        request.end()
      }
    })

    this.socket.onopen = e => this.init()

    this.socket.onmessage = e => this.onmessage(e)

    this.socket.onclose = e => {
      setTimeout(() => this.connect(), 1000)
    }
  }

  _setupPing() {
    // original impl: ping a server after 20 seconds of silence (or last ping)
    clearTimeout(this._pingTimer)
    this._pingTimer = setInterval(() => {
      this.socket?.send('{"ver":"2","cmd":0}')
    }, 30000)
  }

  send(cmd, meta = {}, body = null) {
    if(typeof cmd === 'string')
      cmd = toOpcode(cmd)

    const payload = {
      cmd,
      ...this.defaultMeta,
      ...meta
    }
    if(body) payload.bdy = body

    this.socket?.send(JSON.stringify(payload))

    return payload.tid
  }

  request(cmd, meta = {}, body = null) {
    return new Promise((resolve, reject) => {
      const tid = this.send(...arguments)

      const timer = setTimeout(() => {
        console.log(...arguments)
        reject(new Error('RPC Timeout'))
        delete this._rpcCallback[tid]
      }, this.options.rpcTimeout)

      this._rpcCallback[tid] = payload => {
        clearTimeout(timer)
        resolve(payload)
        delete this._rpcCallback[tid]
      }
    })
  }

  // lifecycle

  async init() {
    const cid = this.cid ||= await this.getCid(this.uid)
    if(!cid)
      throw new Error(`chatChannelId not found for channel ${this.uid}`)

    const token = await this.getToken(cid)

    this._setupPing()

    this.sid = (await this.request('connect', {}, {
      uid: null,
      devType: 2001,
      auth: 'READ',
      accTkn: token
    })).bdy.sid
  }

  async onmessage(message) {
    const data = JSON.parse(message.data)
    const { cmd: opcode } = data
    const { type, command } = toCommand(opcode)

    if(command === 'ping') {
      this.socket?.send('{"ver":"2","cmd":10000}')
      return
    }

    if(type === 'response') {
      const { tid } = data
      this._rpcCallback?.[tid]?.(data)
      return
    } else if(type === 'notification') {
      this.emit(command, data)

      switch(command) {
        case 'liveMsg': {
          const messages = util.unpackBdyPayload(data.bdy)

          messages.forEach(m => this.emit('message', m))
          break
        }

        case 'forceLiveMsg': { // donation
          const messages = util.unpackBdyPayload(data.bdy)

          messages.forEach(m => this.emit('donation', m))
          break
        }

        default:
          if(this.logUnhandledMessage)
            console.log(`unhandled ${type} message ${opcode} (opcode ${opcode}):`, data)
      }
    }
  }

  async ack(sid) {

  }

  ///

  static parseEmotes = parseEmotes
  static getColor = getColor
}
