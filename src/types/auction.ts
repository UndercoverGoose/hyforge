export type AuctionRecord = {
  generated_at: number;
  items: Record<string, number>;
};
export type Bid = {
  auction_id: string;
  bidder: string;
  profile_id: string;
  amount: number;
  timestamp: number;
};
export type Auction = {
  uuid: string;
  auctioneer: string;
  profile_id: string;
  coop: string[];
  start: number;
  end: number;
  item_name: string;
  item_lore: string;
  item_uuid?: string;
  extra: string;
  category: string;
  tier: string;
  starting_bid: number;
  item_bytes: string;
  claimed: boolean;
  claimed_bidders: unknown[];
  highest_bid_amount: number;
  bids: Bid[];
  last_updated: number;
  bin: boolean;
};
export type AuctionResponse =
  | {
      success: true;
      page: number;
      totalPages: number;
      totalAuctions: number;
      lastUpdated: number;
      auctions: Auction[];
    }
  | {
      success: false;
      cause: string;
    };
