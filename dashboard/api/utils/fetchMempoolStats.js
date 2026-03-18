import axios from 'axios';

export let latestMempoolPayload = null;

const FIAT_CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'CAD', 'AUD', 'CHF', 'INR', 'KRW', 'BRL', 'HKD', 'SGD'];

async function getBlockFeeCurrencyRates() {
  try {
    const results = await Promise.all(
      FIAT_CURRENCIES.map((c) =>
        axios.get(`${process.env.BITCOIN_PRICE_URL}${c}${process.env.BITCOIN_PRICE_URL_SUFFIX}`)
      )
    );
    return Object.fromEntries(
      FIAT_CURRENCIES.map((c, i) => [c, parseFloat(results[i].data.data.amount)])
    );
  } catch (err) {
    console.error('[getBlockFeeCurrencyRates] Failed:', err.message);
    throw err;
  }
}

export async function fetchMempoolStats() {
  try {
    const statsRes = await axios.get(`${process.env.MEMPOOL_URL}/api/mempool`);
    const feesRes = await axios.get(
      `${process.env.MEMPOOL_URL}/api/v1/fees/recommended`
    );
    const oneMinuteBlockDataRes = await axios.get(
      `${process.env.MEMPOOL_URL}/api/v1/mining/blocks/fee-rates/1m`
    );
    const blockfeesRes = await axios.get(
      `${process.env.MEMPOOL_URL}/api/v1/mining/blocks/fees/1w`
    );
    const btcRates = await getBlockFeeCurrencyRates();

    const data = oneMinuteBlockDataRes.data;
    const latestBlock =
      Array.isArray(data) && data.length > 0 ? data[data.length - 1] : null;

    const feeDistribution = {
      min: latestBlock?.avgFee_0,
      '10th': latestBlock?.avgFee_10,
      '25th': latestBlock?.avgFee_25,
      median: latestBlock?.avgFee_50,
      '75th': latestBlock?.avgFee_75,
      '90th': latestBlock?.avgFee_90,
      max: latestBlock?.avgFee_100,
    };

    const { count, vsize, total_fee } = statsRes.data;
    const { fastestFee, halfHourFee, hourFee, economyFee, minimumFee } =
      feesRes.data;

    const convertFee = (sats) => {
      const feeBtc = sats / 1e8;
      const fee = { sats_per_vbyte: sats, fee_btc: feeBtc };
      for (const [currency, rate] of Object.entries(btcRates)) {
        fee[`fee_${currency.toLowerCase()}`] = feeBtc * rate;
      }
      return fee;
    };

    const blockFeesArray = blockfeesRes.data;
    const latestBlockFeeRaw =
      Array.isArray(blockFeesArray) && blockFeesArray.length > 0
        ? blockFeesArray[blockFeesArray.length - 1]
        : null;

    const blockfeeHistory = (() => {
      if (!latestBlockFeeRaw) return [];
      const feeBtc = latestBlockFeeRaw.avgFees / 1e8;
      const item = {
        height: latestBlockFeeRaw.avgHeight,
        time: new Date(
          (latestBlockFeeRaw.timestamp || 0) * 1000
        ).toLocaleTimeString(),
        btc: feeBtc,
      };
      for (const [currency, rate] of Object.entries(btcRates)) {
        item[currency.toLowerCase()] = feeBtc * rate;
      }
      return [item];
    })();

    const totalFeeBtc = total_fee / 1e8;
    const mempool = { count, vsize, total_fee_btc: totalFeeBtc };
    for (const [currency, rate] of Object.entries(btcRates)) {
      mempool[`total_fee_${currency.toLowerCase()}`] = totalFeeBtc * rate;
    }

    const result = {
      mempool,
      next_block_fees: convertFee(fastestFee),
      fees: {
        high_priority: convertFee(fastestFee),
        medium_priority: convertFee(halfHourFee),
        standard_priority: convertFee(hourFee),
        economy: convertFee(economyFee),
        minimum: convertFee(minimumFee),
      },
      btc_price_usd: btcRates.USD,
      fee_distribution: feeDistribution,
      block_fee_history: blockfeeHistory,
    };

    latestMempoolPayload = {
      type: 'mempool_update',
      data: result,
      time: new Date().toLocaleString(),
    };

    return result;
  } catch (error) {
    console.error('[fetchMempoolStats] Failed to fetch:', error.message);
    return null;
  }
}
