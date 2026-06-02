/** 與舊版 TestInputForm.vue 對齊的國家／貨幣／商家隨機用常數 */

export const MERCHANT_COUNTRY_CODE_STR_VALUES = [
  '156',
  '840',
  '076',
  '392',
  '344',
  '410',
  '702',
  '036',
  '124',
  '978',
  '826',
  '116'
] as const

export const MERCHANT_COUNTRY_CODE_ASIA_VALUES = [
  '156',
  '392',
  '344',
  '410',
  '702',
  '116',
  '764',
  '704',
  '458',
  '360',
  '608',
  '076'
] as const

export const MERCHANT_MCC_OPTIONS = [
  { name: 'HiTRUST EMV Demo Merchant', mcc: '5661' },
  { name: "McDonald's", mcc: '5814' },
  { name: 'Burger King', mcc: '5814' },
  { name: 'KFC', mcc: '5814' },
  { name: 'Starbucks', mcc: '5812' },
  { name: 'Subway', mcc: '5814' },
  { name: 'Pizza Hut', mcc: '5812' },
  { name: "Domino's Pizza", mcc: '5812' },
  { name: 'Walmart Supercenter', mcc: '5411' },
  { name: 'Costco Wholesale', mcc: '5300' },
  { name: 'Amazon Marketplace', mcc: '5262' },
  { name: 'Apple Store', mcc: '5732' },
  { name: 'Microsoft Store', mcc: '5732' },
  { name: 'IKEA', mcc: '5712' },
  { name: 'H&M', mcc: '5651' },
  { name: 'Zara', mcc: '5691' },
  { name: 'Nike Retail Store', mcc: '5651' },
  { name: 'Adidas Retail Store', mcc: '5651' },
  { name: 'Hilton Hotels', mcc: '7011' },
  { name: 'Marriott Hotels', mcc: '7011' },
  { name: 'Uber Rides', mcc: '4121' },
  { name: 'Global Leisure Rewards', mcc: '5816' }
] as const

export const ACQUIRER_BIN_OPTIONS = ['1231234', '1239999', '9991234', '9999999'] as const

export const COUNTRY_NUMERIC_MAP = {
  '156': { alpha2: 'CN', alpha3: 'CHN', name: 'China' },
  '158': { alpha2: 'TW', alpha3: 'TWN', name: 'Taiwan' },
  '840': { alpha2: 'US', alpha3: 'USA', name: 'United States' },
  '076': { alpha2: 'BR', alpha3: 'BRA', name: 'Brazil' },
  '392': { alpha2: 'JP', alpha3: 'JPN', name: 'Japan' },
  '344': { alpha2: 'HK', alpha3: 'HKG', name: 'Hong Kong' },
  '410': { alpha2: 'KR', alpha3: 'KOR', name: 'South Korea' },
  '702': { alpha2: 'SG', alpha3: 'SGP', name: 'Singapore' },
  '116': { alpha2: 'KH', alpha3: 'KHM', name: 'Cambodia' },
  '036': { alpha2: 'AU', alpha3: 'AUS', name: 'Australia' },
  '124': { alpha2: 'CA', alpha3: 'CAN', name: 'Canada' },
  '978': { alpha2: 'EU', alpha3: 'EUR', name: 'European Union' },
  '826': { alpha2: 'GB', alpha3: 'GBR', name: 'United Kingdom' },
  '764': { alpha2: 'TH', alpha3: 'THA', name: 'Thailand' },
  '704': { alpha2: 'VN', alpha3: 'VNM', name: 'Viet Nam' },
  '458': { alpha2: 'MY', alpha3: 'MYS', name: 'Malaysia' },
  '360': { alpha2: 'ID', alpha3: 'IDN', name: 'Indonesia' },
  '608': { alpha2: 'PH', alpha3: 'PHL', name: 'Philippines' }
} as const

export const CURRENCY_NUMERIC_MAP = {
  '156': { alphabetic: 'CNY', name: 'Yuan Renminbi', minorUnit: '2' },
  '901': { alphabetic: 'TWD', name: 'New Taiwan Dollar', minorUnit: '2' },
  '840': { alphabetic: 'USD', name: 'US Dollar', minorUnit: '2' },
  '392': { alphabetic: 'JPY', name: 'Yen', minorUnit: '0' },
  '344': { alphabetic: 'HKD', name: 'Hong Kong Dollar', minorUnit: '2' },
  '410': { alphabetic: 'KRW', name: 'Won', minorUnit: '0' },
  '702': { alphabetic: 'SGD', name: 'Singapore Dollar', minorUnit: '2' },
  '036': { alphabetic: 'AUD', name: 'Australian Dollar', minorUnit: '2' },
  '124': { alphabetic: 'CAD', name: 'Canadian Dollar', minorUnit: '2' },
  '978': { alphabetic: 'EUR', name: 'Euro', minorUnit: '2' },
  '826': { alphabetic: 'GBP', name: 'Pound Sterling', minorUnit: '2' },
  '116': { alphabetic: 'KHR', name: 'Riel', minorUnit: '2' },
  '764': { alphabetic: 'THB', name: 'Baht', minorUnit: '2' },
  '704': { alphabetic: 'VND', name: 'Dong', minorUnit: '0' },
  '458': { alphabetic: 'MYR', name: 'Malaysian Ringgit', minorUnit: '2' },
  '360': { alphabetic: 'IDR', name: 'Rupiah', minorUnit: '0' },
  '608': { alphabetic: 'PHP', name: 'Philippine Peso', minorUnit: '2' }
} as const

/** 貨幣選擇器：國家標籤 → 商家國碼（與舊版 TestInput onCurrencySelect 一致） */
export const CURRENCY_COUNTRY_LABEL_MAP: Record<
  string,
  { alpha2: string; alpha3: string; numeric: string; name: string }
> = {
  台灣: { alpha2: 'TW', alpha3: 'TWN', numeric: '158', name: 'Taiwan' },
  美國: { alpha2: 'US', alpha3: 'USA', numeric: '840', name: 'United States' },
  中國: { alpha2: 'CN', alpha3: 'CHN', numeric: '156', name: 'China' },
  日本: { alpha2: 'JP', alpha3: 'JPN', numeric: '392', name: 'Japan' },
  香港: { alpha2: 'HK', alpha3: 'HKG', numeric: '344', name: 'Hong Kong' },
  韓國: { alpha2: 'KR', alpha3: 'KOR', numeric: '410', name: 'South Korea' },
  新加坡: { alpha2: 'SG', alpha3: 'SGP', numeric: '702', name: 'Singapore' },
  澳洲: { alpha2: 'AU', alpha3: 'AUS', numeric: '036', name: 'Australia' },
  加拿大: { alpha2: 'CA', alpha3: 'CAN', numeric: '124', name: 'Canada' },
  歐元區: { alpha2: 'EU', alpha3: 'EUR', numeric: '978', name: 'European Union' },
  英國: { alpha2: 'GB', alpha3: 'GBR', numeric: '826', name: 'United Kingdom' },
  泰國: { alpha2: 'TH', alpha3: 'THA', numeric: '764', name: 'Thailand' },
  越南: { alpha2: 'VN', alpha3: 'VNM', numeric: '704', name: 'Vietnam' },
  馬來西亞: { alpha2: 'MY', alpha3: 'MYS', numeric: '458', name: 'Malaysia' },
  印尼: { alpha2: 'ID', alpha3: 'IDN', numeric: '360', name: 'Indonesia' },
  菲律賓: { alpha2: 'PH', alpha3: 'PHL', numeric: '608', name: 'Philippines' },
  柬埔寨: { alpha2: 'KH', alpha3: 'KHM', numeric: '116', name: 'Cambodia' },
  巴西: { alpha2: 'BR', alpha3: 'BRA', numeric: '076', name: 'Brazil' }
}

export const CURRENCY_PICKER_OPTIONS = [
  { numeric: '901', code: 'TWD', name: '新台幣', country: '台灣' },
  { numeric: '840', code: 'USD', name: '美元', country: '美國' },
  { numeric: '156', code: 'CNY', name: '人民幣', country: '中國' },
  { numeric: '392', code: 'JPY', name: '日圓', country: '日本' },
  { numeric: '344', code: 'HKD', name: '港幣', country: '香港' },
  { numeric: '410', code: 'KRW', name: '韓元', country: '韓國' },
  { numeric: '702', code: 'SGD', name: '新加坡元', country: '新加坡' },
  { numeric: '036', code: 'AUD', name: '澳幣（澳元）', country: '澳洲' },
  { numeric: '124', code: 'CAD', name: '加幣（加元）', country: '加拿大' },
  { numeric: '978', code: 'EUR', name: '歐元', country: '歐元區' },
  { numeric: '826', code: 'GBP', name: '英鎊', country: '英國' },
  { numeric: '764', code: 'THB', name: '泰銖', country: '泰國' },
  { numeric: '704', code: 'VND', name: '越南盾', country: '越南' },
  { numeric: '458', code: 'MYR', name: '馬幣（令吉）', country: '馬來西亞' },
  { numeric: '360', code: 'IDR', name: '印尼盾（盧比）', country: '印尼' },
  { numeric: '608', code: 'PHP', name: '菲律賓比索', country: '菲律賓' }
] as const
