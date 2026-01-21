import {
  InstagramIcon,
  YouTubeIcon,
  TwitterIcon,
  FacebookIcon,
  LinkedInIcon,
  TikTokIcon,
  PinterestIcon,
  SnapchatIcon,
  WhatsAppIcon,
  TelegramIcon,
  ThreadsIcon,
  GoogleIcon,
  AmazonIcon,
  FlipkartIcon,
  MyntraIcon,
  MeeshoIcon,
  NykaaIcon,
  AjioIcon,
  BigBasketIcon,
  BlinkitIcon,
  ZeptoIcon,
  DunzoIcon,
  JioMartIcon,
  SwiggyIcon,
  ZomatoIcon,
  PaytmIcon,
  PhonePeIcon,
  ShopifyIcon,
  EbayIcon,
  AliExpressIcon,
  WalmartIcon,
  TargetIcon,
  EtsyIcon,
} from "@/components/icons/platform-icons";

// Duotone color scheme - subtle background with branded icon color
const iconCategories = [
  {
    title: "Social Media",
    icons: [
      { name: "Instagram", Icon: InstagramIcon, bgColor: "bg-pink-100 dark:bg-pink-950/40", iconColor: "text-pink-600 dark:text-pink-400" },
      { name: "YouTube", Icon: YouTubeIcon, bgColor: "bg-red-100 dark:bg-red-950/40", iconColor: "text-red-600 dark:text-red-400" },
      { name: "Twitter/X", Icon: TwitterIcon, bgColor: "bg-zinc-100 dark:bg-zinc-800", iconColor: "text-zinc-900 dark:text-zinc-100" },
      { name: "Facebook", Icon: FacebookIcon, bgColor: "bg-blue-100 dark:bg-blue-950/40", iconColor: "text-blue-600 dark:text-blue-400" },
      { name: "LinkedIn", Icon: LinkedInIcon, bgColor: "bg-sky-100 dark:bg-sky-950/40", iconColor: "text-sky-600 dark:text-sky-400" },
      { name: "TikTok", Icon: TikTokIcon, bgColor: "bg-zinc-100 dark:bg-zinc-800", iconColor: "text-zinc-900 dark:text-zinc-100" },
      { name: "Pinterest", Icon: PinterestIcon, bgColor: "bg-red-100 dark:bg-red-950/40", iconColor: "text-red-600 dark:text-red-400" },
      { name: "Snapchat", Icon: SnapchatIcon, bgColor: "bg-yellow-100 dark:bg-yellow-950/40", iconColor: "text-yellow-600 dark:text-yellow-400" },
      { name: "WhatsApp", Icon: WhatsAppIcon, bgColor: "bg-green-100 dark:bg-green-950/40", iconColor: "text-green-600 dark:text-green-400" },
      { name: "Telegram", Icon: TelegramIcon, bgColor: "bg-sky-100 dark:bg-sky-950/40", iconColor: "text-sky-600 dark:text-sky-400" },
      { name: "Threads", Icon: ThreadsIcon, bgColor: "bg-zinc-100 dark:bg-zinc-800", iconColor: "text-zinc-900 dark:text-zinc-100" },
    ],
  },
  {
    title: "Indian E-commerce",
    icons: [
      { name: "Amazon", Icon: AmazonIcon, bgColor: "bg-orange-100 dark:bg-orange-950/40", iconColor: "text-orange-600 dark:text-orange-400" },
      { name: "Flipkart", Icon: FlipkartIcon, bgColor: "bg-blue-100 dark:bg-blue-950/40", iconColor: "text-blue-600 dark:text-blue-400" },
      { name: "Myntra", Icon: MyntraIcon, bgColor: "bg-pink-100 dark:bg-pink-950/40", iconColor: "text-pink-600 dark:text-pink-400", wide: true },
      { name: "Meesho", Icon: MeeshoIcon, bgColor: "bg-fuchsia-100 dark:bg-fuchsia-950/40", iconColor: "text-fuchsia-700 dark:text-fuchsia-400", wide: true },
      { name: "Nykaa", Icon: NykaaIcon, bgColor: "bg-pink-100 dark:bg-pink-950/40", iconColor: "text-pink-600 dark:text-pink-400", wide: true },
      { name: "Ajio", Icon: AjioIcon, bgColor: "bg-zinc-100 dark:bg-zinc-800", iconColor: "text-zinc-800 dark:text-zinc-200", wide: true },
      { name: "BigBasket", Icon: BigBasketIcon, bgColor: "bg-green-100 dark:bg-green-950/40", iconColor: "text-green-600 dark:text-green-400" },
      { name: "Blinkit", Icon: BlinkitIcon, bgColor: "bg-yellow-100 dark:bg-yellow-950/40", iconColor: "text-yellow-600 dark:text-yellow-500", wide: true },
      { name: "Zepto", Icon: ZeptoIcon, bgColor: "bg-violet-100 dark:bg-violet-950/40", iconColor: "text-violet-600 dark:text-violet-400", wide: true },
      { name: "Dunzo", Icon: DunzoIcon, bgColor: "bg-emerald-100 dark:bg-emerald-950/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
      { name: "JioMart", Icon: JioMartIcon, bgColor: "bg-blue-100 dark:bg-blue-950/40", iconColor: "text-blue-600 dark:text-blue-400" },
    ],
  },
  {
    title: "Food Delivery",
    icons: [
      { name: "Swiggy", Icon: SwiggyIcon, bgColor: "bg-orange-100 dark:bg-orange-950/40", iconColor: "text-orange-600 dark:text-orange-400" },
      { name: "Zomato", Icon: ZomatoIcon, bgColor: "bg-red-100 dark:bg-red-950/40", iconColor: "text-red-600 dark:text-red-400" },
    ],
  },
  {
    title: "Payments",
    icons: [
      { name: "Paytm", Icon: PaytmIcon, bgColor: "bg-sky-100 dark:bg-sky-950/40", iconColor: "text-sky-600 dark:text-sky-400" },
      { name: "PhonePe", Icon: PhonePeIcon, bgColor: "bg-indigo-100 dark:bg-indigo-950/40", iconColor: "text-indigo-600 dark:text-indigo-400" },
    ],
  },
  {
    title: "International E-commerce",
    icons: [
      { name: "Shopify", Icon: ShopifyIcon, bgColor: "bg-green-100 dark:bg-green-950/40", iconColor: "text-green-600 dark:text-green-400" },
      { name: "eBay", Icon: EbayIcon, bgColor: "bg-blue-100 dark:bg-blue-950/40", iconColor: "text-blue-600 dark:text-blue-400" },
      { name: "AliExpress", Icon: AliExpressIcon, bgColor: "bg-red-100 dark:bg-red-950/40", iconColor: "text-red-600 dark:text-red-400" },
      { name: "Walmart", Icon: WalmartIcon, bgColor: "bg-blue-100 dark:bg-blue-950/40", iconColor: "text-blue-600 dark:text-blue-400" },
      { name: "Target", Icon: TargetIcon, bgColor: "bg-red-100 dark:bg-red-950/40", iconColor: "text-red-600 dark:text-red-400" },
      { name: "Etsy", Icon: EtsyIcon, bgColor: "bg-orange-100 dark:bg-orange-950/40", iconColor: "text-orange-600 dark:text-orange-400" },
    ],
  },
  {
    title: "Search & Tech",
    icons: [
      { name: "Google", Icon: GoogleIcon, bgColor: "bg-blue-100 dark:bg-blue-950/40", iconColor: "text-blue-600 dark:text-blue-400" },
    ],
  },
];

export default function IconsDemoPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Platform Icons
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            All available platform icons for campaigns
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-10">
          {iconCategories.map((category) => (
            <div key={category.title}>
              <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {category.title}
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {category.icons.map(({ name, Icon, bgColor, iconColor, wide }) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
                  >
                    {/* Large Icon - Duotone Style */}
                    <div
                      className={`flex size-14 items-center justify-center rounded-xl px-1 ${bgColor}`}
                    >
                      <Icon className={`${wide ? "h-auto w-full" : "size-8"} ${iconColor}`} />
                    </div>

                    {/* Name */}
                    <div className="text-center">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {name}
                      </p>
                    </div>

                    {/* Smaller variants - also duotone */}
                    <div className="flex items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                      <div className={`flex size-8 items-center justify-center rounded-lg px-0.5 ${bgColor}`}>
                        <Icon className={`${wide ? "h-auto w-full" : "size-5"} ${iconColor}`} />
                      </div>
                      <div className={`flex size-6 items-center justify-center rounded-md px-0.5 ${bgColor}`}>
                        <Icon className={`${wide ? "h-auto w-full" : "size-4"} ${iconColor}`} />
                      </div>
                      <div className={`flex size-5 items-center justify-center rounded px-0.5 ${bgColor}`}>
                        <Icon className={`${wide ? "h-auto w-full" : "size-3"} ${iconColor}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Duotone Icon Style</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            All icons are displayed in duotone style with a subtle brand-colored background and a darker brand-colored icon.
            This style works well for both light and dark modes.
          </p>

          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              All Official Icons
            </h4>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Instagram, YouTube, Twitter, Facebook, LinkedIn, TikTok, Pinterest, Snapchat, WhatsApp,
              Telegram, Threads, Google, Amazon, Flipkart, Myntra, Meesho, Nykaa, Ajio, BigBasket, Blinkit, Zepto,
              Dunzo, JioMart, Swiggy, Zomato, Paytm, PhonePe, Shopify, eBay, AliExpress, Walmart,
              Target, Etsy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
