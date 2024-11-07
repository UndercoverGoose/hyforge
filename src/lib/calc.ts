import type { NetResult } from '@type/calc';
import type { AuctionRecord } from '@type/auction';
import type { BazaarRecord } from '@type/bazaar';
import type { Forge } from '../types/forge';
import { to_seconds } from './time';
import error from '@lib/error';

export function calc(item: string, depth: number, fg: Forge, ah: AuctionRecord, bz: BazaarRecord): NetResult {
  const net_materials = new Map<string, number>();
  const independent_cost = new Map<string, number>();
  let net_seconds = 0;
  let net_bin_cost = 0;
  let net_order_cost = 0;

  // recursive function to calculate the net result
  function next(loc_item: string, parent_qty = 1, loc_depth = -1) {
    // decrease the depth unless it's already 0
    loc_depth = loc_depth <= 0 ? loc_depth : loc_depth - 1;

    // get item forging information
    const { input, time } = fg[loc_item];

    // iterate over each component of the item
    for (const [component, qty] of Object.entries(input)) {
      // calculate the total quantity of the component
      const total_qty = qty * parent_qty;
      net_seconds += to_seconds(time) * parent_qty;
      net_materials.set(component, (net_materials.get(component) || 0) + total_qty);

      // if this component has more components within the forge
      if (component in fg) {
        // if we still have depth to go, continue
        if (loc_depth > 0 || loc_depth === -1) {
          next(component, total_qty, loc_depth);
          continue;
        }
        // no depth remaining; grab the reference item
        const item_ref = fg[component].ref;

        // if the component is a bazaar item that we can purchase
        if (item_ref.startsWith('BZ')) {
          const product_name = item_ref.slice(3);
          const product = bz.products[product_name];

          // if the product could not be found in the bazaar data
          if (!product) {
            error('Material', `Could not find product ${product_name} in bazaar data.`);
            continue;
          }

          // product exists; calculate the cost and continue
          const bin_cost = product.quick_status.buyPrice * total_qty;
          const order_cost = product.quick_status.sellPrice * total_qty;
          independent_cost.set(component, (independent_cost.get(component) || 0) + bin_cost);
          net_bin_cost += bin_cost;
          net_order_cost += order_cost;
          continue;
        }

        // component not on bazaar so much be on the auction house
        const lowest_bin_cost = ah.items[item_ref];

        // if the product could not be found in the auction data
        if (!lowest_bin_cost) {
          error('Material', `Could not find item ${item_ref} in auction data.`);
          continue;
        }

        independent_cost.set(component, (independent_cost.get(component) || 0) + lowest_bin_cost * total_qty);
        net_bin_cost += lowest_bin_cost * total_qty;
        net_order_cost += lowest_bin_cost * total_qty;
        continue;
      }

      // component is not a forge item and therefore has no more depth
      // if the component is just raw coins
      if (component.startsWith('COINS')) {
        independent_cost.set(component, (independent_cost.get(component) || 0) + total_qty);
        net_bin_cost += total_qty;
        net_order_cost += total_qty;
        continue;
      }

      // if the component is a bazaar item; doing the same as previously
      if (component.startsWith('BZ')) {
        const product_name = component.slice(3);
        const product = bz.products[product_name];
        if (!product) {
          error('Material', `Could not find product ${product_name} in bazaar data.`);
          continue;
        }
        const bin_cost = product.quick_status.buyPrice * total_qty;
        const order_cost = product.quick_status.sellPrice * total_qty;
        independent_cost.set(component, (independent_cost.get(component) || 0) + bin_cost);
        net_bin_cost += bin_cost;
        net_order_cost += order_cost;
        continue;
      }

      // component is not coins or a bazaar item; must be an auction item
      const lowest_bin_cost = ah.items[component];
      if (!lowest_bin_cost) {
        if (!component.startsWith('NULL')) error('Material', `Could not find item ${component} in auction data.`);
        continue;
      }
      independent_cost.set(component, (independent_cost.get(component) || 0) + lowest_bin_cost * total_qty);
      net_bin_cost += lowest_bin_cost * total_qty;
      net_order_cost += lowest_bin_cost * total_qty;
    }
  }
  next(item, 1, depth);

  for (const [key, value] of independent_cost) {
    independent_cost.set(key, Math.ceil(value));
  }

  return {
    net_materials,
    independent_cost,
    net_seconds,
    net_bin_cost,
    net_order_cost,
  };
}
