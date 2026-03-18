export interface Fee {
  sats_per_vbyte: number;
  fee_btc: number;
  fee_usd: number;
  fee_eur: number;
  fee_jpy: number;
  fee_gbp: number;
  fee_cad: number;
  fee_aud: number;
  fee_chf: number;
  fee_inr: number;
  fee_krw: number;
  fee_brl: number;
  fee_hkd: number;
  fee_sgd: number;
}

export interface BlockFeeHistoryItem {
  height: number;
  time: string;
  timestamp?: number;
  btc: number;
  usd: number;
  eur: number;
  jpy: number;
  gbp: number;
  cad: number;
  aud: number;
  chf: number;
  inr: number;
  krw: number;
  brl: number;
  hkd: number;
  sgd: number;
}

export interface MempoolStats {
  count: number;
  vsize: number;
  total_fee_btc: number;
  total_fee_usd: number;
  total_fee_eur: number;
  total_fee_jpy: number;
  total_fee_gbp: number;
  total_fee_cad: number;
  total_fee_aud: number;
  total_fee_chf: number;
  total_fee_inr: number;
  total_fee_krw: number;
  total_fee_brl: number;
  total_fee_hkd: number;
  total_fee_sgd: number;
}

export interface CurrencyRates {
  USD: number;
  EUR: number;
  JPY: number;
  GBP: number;
  CAD: number;
  AUD: number;
  CHF: number;
  INR: number;
  KRW: number;
  BRL: number;
  HKD: number;
  SGD: number;
}

export interface MempoolData {
  mempool: MempoolStats;
  next_block_fees: Fee;
  fees: {
    high_priority: Fee;
    medium_priority: Fee;
    standard_priority: Fee;
    economy: Fee;
    minimum: Fee;
  };
  currency_rates: CurrencyRates;
  fee_distribution: Record<string, number>;
  block_fee_history: BlockFeeHistoryItem[];
}

export interface FeeDistributionItem {
  name: string;
  value: number;
}
