import { PageToolbar } from "@/components/layout/page-toolbar";
import { WishlistPageClient } from "@/components/wishlist/wishlist-page-client";
import { getWishlistRecords } from "@/lib/data";

export default async function WishlistPage() {
  const items = await getWishlistRecords();

  return (
    <div className="space-y-6">
      <PageToolbar />
      <WishlistPageClient initialItems={items} />
    </div>
  );
}
