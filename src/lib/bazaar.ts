import type { BazaarRecord, BazaarResponse } from '@type/bazaar';
import error from '@lib/error';

const popup = document.getElementById('bz-popup')!;

const API_BASE = 'https://api.hypixel.net/v2/skyblock/bazaar';

export default async function get_bazaar_data(): Promise<BazaarRecord> {
  popup.style.display = null!;

  const data: BazaarRecord = {
    generated_at: Date.now(),
    products: {},
  };

  const res = await fetch(API_BASE);
  const json = (await res.json()) as BazaarResponse;
  if (!json.success) throw error('Bazaar', json.cause);

  data.products = json.products;

  popup.style.display = 'none';
  return data;
}
