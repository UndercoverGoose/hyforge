import type { AuctionRecord } from '@type/auction';
import { get_lowest_bins } from '@lib/auction';
import type { BazaarRecord } from '@type/bazaar';
import get_bazaar_data from '@lib/bazaar';
import type { Forge } from '@type/forge';
import { calc } from '@lib/calc';
import { from_seconds } from '@lib/time';

const forge_container = document.getElementById('forge-items')!;
const forge_depth = document.getElementById('pref-depth')!;
const display_img = document.getElementById('res-img')!;
const display_name = document.getElementById('res-item')!;
const display_hotm = document.getElementById('res-hotm')!;
const profit_chart = document.getElementById('res-profit')!;
const material_list = document.getElementById('res-mats')!;
const time_chart = document.getElementById('res-time')!;

const RARITY_COLORS: Record<string, string> = {
  COMMON: '#ffffff',
  UNCOMMON: '#55FF55',
  RARE: '#5555FF',
  EPIC: '#AA00AA',
  LEGENDARY: '#FFAA00',
  MYTHIC: '#FF55FF',
  SPECIAL: '#FF5555',
};

let last_checked: (() => void) | null = null;

const FORGE_ITEMS = (await (await fetch('forge.json')).json()) as Forge;
for (const item_name in FORGE_ITEMS) {
  const item = FORGE_ITEMS[item_name];
  const hex = RARITY_COLORS[item.rarity];
  if (item.hotm === -1) continue;
  const div = document.createElement('div');
  div.classList.add('tooltip-hover-right');
  div.innerHTML = `<img src="${item.img}"><div class="tooltip mc-font"><p style="color: ${hex}">${item_name}</p><p style="color: ${hex};"><b>${item.rarity}</b></p></div>`;
  forge_container.appendChild(div);

  function check() {
    last_checked = check;
    display_img.setAttribute('src', item.img);
    display_name.textContent = item_name;
    display_name.style.color = hex;
    display_hotm.textContent = `HOTM: ${item.hotm}`;
    profit_chart.innerHTML = '';
    material_list.innerHTML = '';
    time_chart.innerHTML = '';

    const depth = parseInt((forge_depth as HTMLInputElement).value);
    const { net_materials, independent_cost, net_seconds, net_bin_cost, net_order_cost } = calc(item_name, depth, FORGE_ITEMS, auction_data, bazaar_data);

    for (const [component, quantity] of net_materials) {
      const from = component.startsWith('NULL')
        ? 'Other'
        : component === 'COINS'
          ? ''
          : !independent_cost.has(component)
            ? 'Forge'
            : component.startsWith('BZ')
              ? 'Bazaar'
              : 'Auction';
      const item_name = component.replace('BZ:', '').replace('NULL:', '');
      const cost = !independent_cost.has(component) ? '' : independent_cost.get(component)?.toLocaleString();
      material_list.insertAdjacentHTML(
        'beforeend',
        `<tr${
          from === 'Forge' ? ' style="color: #5555FF"' : from === 'Other' ? ' style="color: #FF5555"' : ''
        }><td>${from}</td><td>${item_name}</td><td>${quantity.toLocaleString()}</td><td>${cost}</td></tr>`
      );
    }

    for (let num_slots = 1; num_slots <= 7; num_slots++) {
      const with_quick_forge = 0.7;
      const with_qf_and_cole = 0.45;

      const net = from_seconds(Math.ceil(net_seconds / num_slots));
      const net_qf = from_seconds(Math.ceil((net_seconds * with_quick_forge) / num_slots));
      const net_wc = from_seconds(Math.ceil((net_seconds * with_qf_and_cole) / num_slots));

      time_chart.insertAdjacentHTML('beforeend', `<tr><td>${num_slots}</td><td>${net}</td><td>${net_qf}</td><td>${net_wc}</td></tr>`);
    }

    const sell_price = Math.floor(
      FORGE_ITEMS[item_name].ref.startsWith('BZ')
        ? bazaar_data.products[FORGE_ITEMS[item_name].ref.slice(3)].quick_status.sellPrice
        : auction_data.items[FORGE_ITEMS[item_name].ref.replace(' Pet', '')]
    );

    const bin_profit = sell_price - Math.ceil(net_bin_cost);
    const order_profit = sell_price - Math.ceil(net_order_cost);

    profit_chart.insertAdjacentHTML('beforeend', `<tr><td>Sell Price</td><td>${sell_price.toLocaleString()}</td><td></td></tr>`);
    profit_chart.insertAdjacentHTML(
      'beforeend',
      `<tr><td>Instant Buy</td><td>${Math.ceil(net_bin_cost).toLocaleString()}</td><td style="color: ${
        bin_profit > 0 ? '#55FF55">+' : '#FF5555">'
      }${bin_profit.toLocaleString()}</td></tr>`
    );
    profit_chart.insertAdjacentHTML(
      'beforeend',
      `<tr><td>Buy Order</td><td>${Math.ceil(net_order_cost).toLocaleString()}</td><td style="color: ${
        order_profit > 0 ? '#55FF55">+' : '#FF5555">'
      }${order_profit.toLocaleString()}</td></tr>`
    );
  }

  div.addEventListener('click', check);
}

forge_depth.addEventListener('input', () => last_checked?.());

let auction_data: AuctionRecord = JSON.parse(localStorage.getItem('auction_data') || '{}');
let bazaar_data: BazaarRecord = JSON.parse(localStorage.getItem('bazaar_data') || '{}');

if (!auction_data.items || auction_data.generated_at + 3_000_000 < Date.now()) {
  auction_data = await get_lowest_bins();
  localStorage.setItem('auction_data', JSON.stringify(auction_data));
}
if (!bazaar_data.products || bazaar_data.generated_at + 60_000 < Date.now()) {
  bazaar_data = await get_bazaar_data();
  localStorage.setItem('bazaar_data', JSON.stringify(bazaar_data));
}
