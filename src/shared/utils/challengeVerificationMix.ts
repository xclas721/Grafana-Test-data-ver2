type FormData = Record<string, string>

const OTHER_AUTHENTICATION_METHODS = ['01', '03', '04', '05'] as const
const OOB_FAILURE_REASONS = [
  '5202',
  '5202',
  '5202',
  '5202',
  '5202',
  '3501',
  '3502',
  '3599',
  '3401',
  '3402'
] as const
const OTP_FAILURE_REASONS = ['5105', '5106', '5107'] as const

function pickRandom<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(random() * values.length)] as T
}

function pickWeightedCounter(random: () => number, thresholds: readonly number[]): string {
  const value = random()
  const index = thresholds.findIndex((threshold) => value < threshold)
  return String(index === -1 ? thresholds.length : index)
}

function applyChallengeResult(
  data: FormData,
  failureReasons: readonly string[],
  random: () => number
): boolean {
  const result = random()
  data.rreqTransStatus = result < 0.8 ? 'Y' : result < 0.95 ? 'N' : 'R'
  data.transStatus = data.rreqTransStatus

  if (data.rreqTransStatus === 'Y') return false

  data.stateMachineReason = pickRandom(failureReasons, random)
  return true
}

/**
 * 讓 ACS challenge 批次資料符合 F-07～F-10 的查詢欄位關聯。
 * 只處理 ARes=C 的交易，保留其他交易原本的認證方法與狀態分布。
 */
export function applyChallengeVerificationMix(
  data: FormData,
  random: () => number = Math.random
): void {
  if (data.aresTransStatus !== 'C') {
    if (data.authenticationMethod === '09') {
      data.authenticationMethod = pickRandom(OTHER_AUTHENTICATION_METHODS, random)
    }
    return
  }

  const authenticationRoll = random()
  if (authenticationRoll < 0.65) {
    data.authenticationMethod = '02'
    const failed = applyChallengeResult(data, OTP_FAILURE_REASONS, random)
    if (failed) {
      data.otpFailedCount = pickWeightedCounter(random, [0.25, 0.65, 0.9])
      data.resendCounter = pickWeightedCounter(random, [0.5, 0.8, 0.95])
    }
    return
  }

  if (authenticationRoll < 0.95) {
    data.authenticationMethod = '09'
    applyChallengeResult(data, OOB_FAILURE_REASONS, random)
    return
  }

  data.authenticationMethod = pickRandom(OTHER_AUTHENTICATION_METHODS, random)
}
