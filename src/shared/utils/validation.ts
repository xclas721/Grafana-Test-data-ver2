/**
 * 基礎驗證工具（可重用、無狀態）
 */
export function validatePattern(val: string, regexp: string, msg: string) {
  const validate: Record<string, any> = {}
  const valPattern = new RegExp(`^${regexp}$`)
  if (valPattern.test(val)) {
    validate['result'] = true
  } else {
    validate['result'] = false
    validate['message'] = msg ?? 'javax.validation.constraints.Pattern.message'
    validate['messagePattern'] = msg ? '' : [regexp]
  }
  return validate
}

export const validateNumber = (val: string) => {
  const validate: Record<string, any> = {}
  const numberPattern = /^\d+$/
  if (numberPattern.test(val)) {
    validate['result'] = true
  } else {
    validate['result'] = false
    validate['message'] = 'warn.num-only'
  }
  return validate
}

export const validateTel = (val: string) => {
  const validate: Record<string, any> = {}
  const telPattern = /^(?:\+\d{1,4})?(?:[\d\-()\s]{6,20}|(?:\d{3,4}-)?\d{7,8}(?:-\d{1,6})?)$/
  if (telPattern.test(val)) {
    validate['result'] = true
  } else {
    validate['result'] = false
    validate['message'] = 'warn.user.tel.error'
  }
  return validate
}

export const validateEmail = (email: string) => {
  const validate: Record<string, any> = {}
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (emailPattern.test(email)) {
    validate['result'] = true
  } else {
    validate['result'] = false
    validate['message'] = 'warn.invalid-email'
  }
  return validate
}

/**
 * 驗證數值最小值
 * @param val 輸入值
 * @param minVal 最小值
 */
export function validateDecimalMin(val: string, minVal: string) {
  const validate: Record<string, any> = {}
  if (Number(val) > Number(minVal)) {
    validate['result'] = true
  } else {
    validate['result'] = false
    validate['message'] = 'javax.validation.constraints.DecimalMin.message'
    validate['messagePattern'] = [minVal]
  }
  return validate
}

/**
 * 驗證 IP 格式（支援 IPv4、IPv6 和域名）
 * @param value 要驗證的值（可以是完整 URL、IP 或域名）
 * @returns 是否為有效的 IP 或域名
 */
export function validateIpFormat(value: string): boolean {
  if (!value) {
    return false
  }

  // 1. 提取主機名（支援完整 URL 和純域名）
  let hostname: string = value

  try {
    if (value.includes('://')) {
      const urlObj = new URL(value)
      hostname = urlObj.hostname || value
    } else if (value.includes('.') || value.includes(':') || value.includes('/')) {
      const urlObj = new URL('http://' + value)
      hostname = urlObj.hostname || value
    }
  } catch {
    // URL 解析失敗，保持原值
    console.debug('URL parsing failed for value:', value)
    hostname = value
  }

  // 2. 清理主機名（去掉端口、路徑、多餘空格）
  if (hostname) {
    hostname = (hostname.split(':')[0] ?? '').split('/')[0]?.trim() ?? ''
  }

  // 3. 特殊處理 IPv6 [::1] 這種格式
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    hostname = hostname.slice(1, -1)
  }

  // 4. 正則定義
  const ipv4Regex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
  const ipv6Regex =
    /^(([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}|([\da-fA-F]{1,4}:){1,7}:|([\da-fA-F]{1,4}:){1,6}:[\da-fA-F]{1,4}|([\da-fA-F]{1,4}:){1,5}(:[\da-fA-F]{1,4}){1,2}|([\da-fA-F]{1,4}:){1,4}(:[\da-fA-F]{1,4}){1,3}|([\da-fA-F]{1,4}:){1,3}(:[\da-fA-F]{1,4}){1,4}|([\da-fA-F]{1,4}:){1,2}(:[\da-fA-F]{1,4}){1,5}|[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,6})|:((:[\da-fA-F]{1,4}){1,7}|:)|fe80:(:[\da-fA-F]{0,4}){0,4}%[\da-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d)|([\da-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))$/
  const domainRegex =
    /^(?=.{1,253}$)(?:[a-z0-9\u00a1-\uffff](?:[a-z0-9\u00a1-\uffff-]{0,61}[a-z0-9\u00a1-\uffff])?\.)+[a-z\u00a1-\uffff]{2,}$/i

  // 5. 驗證
  const isIpv4 = ipv4Regex.test(hostname)
  const isIpv6 = ipv6Regex.test(hostname)
  const isDomain = domainRegex.test(hostname)

  return isIpv4 || isIpv6 || isDomain
}
