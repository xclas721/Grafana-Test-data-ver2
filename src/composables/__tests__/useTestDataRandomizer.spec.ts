import { describe, expect, it } from 'vitest'
import { randomizeThreeDSDeviceFields } from '@/composables/useTestDataRandomizer'

describe('useTestDataRandomizer', () => {
  it('全部開關關閉時不應產生任何更新', () => {
    const updates = randomizeThreeDSDeviceFields({
      enableMessageCategory: false,
      enableDeviceChannel: false,
      enableThreeDSRequestorChallengeInd: false,
      enableDeviceIpAddressRandom: false,
      enableDevicePlatformRandom: false,
      enableDeviceLocaleRandom: false,
      enableDeviceAdvertisingIdRandom: false,
      enableThreeDSCompIndRandom: false,
      enableAuthenticationMethodRandom: false,
      enableAuthenticationTypeRandom: false
    })
    expect(updates).toEqual({})
  })
})
