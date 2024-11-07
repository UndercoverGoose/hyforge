import type { AuctionResponse, AuctionRecord } from '@type/auction';
import error from '@lib/error';

const popup = document.getElementById('ah-popup')!;
const popup_label = document.getElementById('ah-progress-label')!;
const popup_progress = document.getElementById('ah-progress')!;

const API_BASE = 'https://api.hypixel.net/v2/skyblock/auctions';
const REFORGES: readonly string[] = await (await fetch('reforges.json')).json();
const SYMBOLS: readonly string[] = ['✪', '⚚'];

async function fetch_page(page: number): Promise<AuctionResponse> {
  const res = await fetch(`${API_BASE}?page=${page}`);
  const json = await res.json();
  return json as AuctionResponse;
}

export function remove_details(item_name: string) {
  for (const reforge of REFORGES) {
    if (!item_name.startsWith(reforge)) continue;
    item_name = item_name.slice(reforge.length);
  }
  for (const symbol of SYMBOLS) {
    item_name.replace(symbol, '');
  }
  item_name = item_name.replace(/\[Lvl \d+?\]/g, '');
  return item_name.trim();
}

export async function get_lowest_bins(): Promise<AuctionRecord> {
  popup.style.display = null!;

  const data: AuctionRecord = {
    generated_at: Date.now(),
    items: {},
  };

  const base_res = await fetch_page(0);
  if (!base_res.success) throw error('Auctions', base_res.cause);

  for (let i = 0; i < base_res.totalPages; i++) {
    popup_label.textContent = `${i + 1} / ${base_res.totalPages}`;

    const res = i === 0 ? base_res : await fetch_page(i);
    if (!res.success) {
      error('Auctions', res.cause);
      continue;
    }

    const now = Date.now();
    for (const auction of res.auctions) {
      if (!auction.bin) continue;
      if (auction.end < now) continue;
      if (!data.items[auction.item_name] || auction.starting_bid < data.items[auction.item_name]) {
        data.items[auction.item_name] = auction.starting_bid;
      }
      const clean_item_name = remove_details(auction.item_name);
      if (!data.items[clean_item_name] || auction.starting_bid < data.items[clean_item_name]) {
        data.items[clean_item_name] = auction.starting_bid;
      }
    }

    popup_progress.style.width = `${((i + 1) / base_res.totalPages) * 100}%`;
  }
  popup.style.display = 'none';
  return data;
}
