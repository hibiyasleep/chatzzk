export const COMMANDS = {
  ping: 0,

  connect: 100,
  close: 102, // e.close({ reason: 'server' })
  getProfile: 104,

  send: 3001,
  ack: 3004,
  event: 3006,
  emotion: 3007,
  whisper: 3011,
  channelEmoticon: 3012,

  liveMsg: 3101,
  forceLiveMsg: 3102,
  liveEmotion: 3107,

  loungeMsg: 3201,
  forceLoungeMsg: 3202,

  // 4xxx - noti only?
  join: 4001,
  quit: 4002,
  kick: 4005,
  block: 4006,
  blind: 4008,
  // blindType: "HIDDEN", blindUserId: null, message: null, messageTime, channelId, serviceId, userId
  // blindType: "BLIND", blindUserId: null, message: null, messageTime, channelId, serviceId, userId
  forceDisconnect: 4009,
  notice: 4010,
  updateMessage: 4011,
  penalty: 4015, // penaltyType in [BAN, MUTE, CANCEL]
  closeLive: 4102,
  disableLive: 4103,
  // ???: 4201,
  /*
  if (t.bdy.type === "RECONNECT" && l.data)
    if(l.data.userIdList.includes(e.uid))
      e.connectAsync()

  else if (t.bdy.type === "SYNC_PROFILE" && l.data)
    if (l.data.userIdList.includes(e.uid))
      e.getProfileAsync({
        uid: e.uid,
        accTkn: e.spi.getAccessToken()
      }) // -> cmd 104
  */

  // (requests)
  messageListRange: 5001,
  messageListNolist: 5002,
  messageListRecent: 5003,
  messageListTid: 5004,
  messageListBlind: 5005,
  messageReadCount: 5007,
  userEmotion: 5008,
  messageListMedia: 5011,
  liveMessageListRecent: 5101,
  liveMessageListMedia: 5102,
  liveMessageList: 5103,

  updateConnStatus: 9002,

  // case 15101: // scrollback
  // 90102 closed by server
  // 10104 responseGetProfile
  // 13004 responseAck


}

export const OPCODES = Object.fromEntries(Object.entries(COMMANDS).map(kv => kv.reverse()))

export const toOpcode = command => COMMANDS[command] ?? command
export const toCommand = opcode => {
  let type, command

  if(10000 <= opcode && opcode < 20000) {
    type = 'response'
  } else if(90000 <= opcode < 100000) {
    type = 'notification'
  }
  command = OPCODES[opcode % 10000]

  return { type, command }
}
