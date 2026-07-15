export type ThreeDSDeviceRandomInput = {
  enableMessageCategory: boolean
  enableDeviceChannel: boolean
  enableThreeDSRequestorChallengeInd: boolean
  enableDeviceIpAddressRandom: boolean
  enableDevicePlatformRandom: boolean
  enableDeviceLocaleRandom: boolean
  enableDeviceAdvertisingIdRandom: boolean
  enableThreeDSCompIndRandom: boolean
  enableAuthenticationMethodRandom: boolean
  enableAuthenticationTypeRandom: boolean
}

export type ThreeDSDeviceRandomResult = Partial<{
  messageCategory: string
  deviceChannel: string
  threeDSRequestorChallengeInd: string
  deviceIpAddress: string
  browserIP: string
  devicePlatform: string
  deviceLocale: string
  deviceAdvertisingId: string
  threeDSCompInd: string
  authenticationMethod: string
  authenticationType: string
}>

function randomInt(max: number, random: () => number): number {
  return Math.floor(random() * (max + 1))
}

function randomIPv4(random: () => number): string {
  return `${randomInt(255, random)}.${randomInt(255, random)}.${randomInt(255, random)}.${randomInt(255, random)}`
}

function randomIPv6(random: () => number): string {
  const h4 = () => Math.floor(random() * 0x10000).toString(16)
  return `${h4()}:${h4()}:${h4()}:${h4()}:${h4()}:${h4()}:${h4()}:${h4()}`
}

function randomHex(length: number, random: () => number): string {
  let result = ''
  for (let i = 0; i < length; i++) result += Math.floor(random() * 16).toString(16)
  return result
}

function pickRandom<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(random() * values.length)] as T
}

export function randomizeThreeDSDeviceFields(
  input: ThreeDSDeviceRandomInput,
  random: () => number = Math.random
): ThreeDSDeviceRandomResult {
  const updates: ThreeDSDeviceRandomResult = {}

  if (input.enableMessageCategory) {
    updates.messageCategory = pickRandom(['01', '02', '80', '85', '86'], random)
  }
  if (input.enableDeviceChannel) {
    updates.deviceChannel = pickRandom(['02', '03'], random)
  }
  if (input.enableThreeDSRequestorChallengeInd) {
    updates.threeDSRequestorChallengeInd = pickRandom(
      ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'],
      random
    )
  }
  if (input.enableDeviceIpAddressRandom) {
    const deviceIp = random() < 0.5 ? randomIPv4(random) : randomIPv6(random)
    updates.deviceIpAddress = deviceIp
    updates.browserIP = deviceIp
  }
  if (input.enableDevicePlatformRandom) {
    updates.devicePlatform = pickRandom(
      ['MacIntel', 'Win32', 'Linux x86_64', 'iPhone', 'Android'],
      random
    )
  }
  if (input.enableDeviceLocaleRandom) {
    updates.deviceLocale = pickRandom(
      ['zh-TW', 'zh-CN', 'en-US', 'en-GB', 'ja-JP', 'ko-KR'],
      random
    )
  }
  if (input.enableDeviceAdvertisingIdRandom) {
    updates.deviceAdvertisingId = randomHex(32, random)
  }
  if (input.enableThreeDSCompIndRandom) {
    updates.threeDSCompInd = random() < 0.5 ? 'Y' : 'N'
  }
  if (input.enableAuthenticationMethodRandom) {
    updates.authenticationMethod = pickRandom(['01', '02', '03', '04', '05', '09'], random)
  }
  if (input.enableAuthenticationTypeRandom) {
    updates.authenticationType = pickRandom(['01', '02', '03', '04', '05'], random)
  }

  return updates
}
