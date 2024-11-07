export type BazaarRecord = {
  generated_at: number;
  products: Record<string, Product>;
};

export type ProductStatus = {
  productId: string;
  sellPrice: number;
  sellVolume: number;
  sellMovingWeek: number;
  sellOrders: number;
  buyPrice: number;
  buyVolume: number;
  buyMovingWeek: number;
  buyOrders: number;
};
export type ProductSummary = {
  amount: number;
  pricePerUnit: number;
  orders: number;
};
export type Product = {
  product_id: string;
  sell_summary: ProductSummary[];
  buy_summary: ProductSummary[];
  quick_status: ProductStatus;
};
export type BazaarResponse =
  | {
      success: true;
      lastUpdated: number;
      products: Record<string, Product>;
    }
  | {
      success: false;
      cause: string;
    };
