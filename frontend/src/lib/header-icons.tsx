import type { ComponentType, SVGProps } from "react";
import {
  Activity,
  AlarmClock,
  ArrowRight,
  Award,
  Bell,
  Bike,
  BookOpen,
  Building2,
  Bus,
  Calendar,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cloud,
  Coffee,
  Compass,
  CreditCard,
  Dumbbell,
  ExternalLink,
  Flame,
  Gift,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  HelpCircle,
  Home,
  Image,
  Info,
  Key,
  Languages,
  Link2,
  Lock,
  Mail,
  MapPin,
  Medal,
  MessageCircle,
  MessageSquare,
  Moon,
  Music,
  Navigation,
  Package,
  Percent,
  Phone,
  Pin,
  Plane,
  Play,
  Route,
  Search,
  Send,
  Share2,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Sun,
  Tag,
  Target,
  Train,
  Trophy,
  Truck,
  Umbrella,
  Upload,
  User,
  Users,
  Utensils,
  Video,
  Wifi,
  Zap,
} from "lucide-react";

export type HeaderIconId = string;

export type HeaderIconCategory =
  | "social"
  | "contact"
  | "commerce"
  | "navigation"
  | "academy"
  | "media"
  | "status"
  | "general";

export interface HeaderIconDefinition {
  id: HeaderIconId;
  label: string;
  category: HeaderIconCategory;
  component: ComponentType<SVGProps<SVGSVGElement>>;
  keywords?: string[];
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

function brandIcon(id: string, label: string, path: string, keywords: string[] = []): HeaderIconDefinition {
  const Svg: IconComponent = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d={path} />
    </svg>
  );
  return { id, label, category: "social", component: Svg, keywords };
}

/** Simple Icons paths (brand marks) — Lucide no longer ships these. */
const BRAND_ICONS: HeaderIconDefinition[] = [
  brandIcon(
    "brand-facebook",
    "Facebook",
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    ["fb", "meta"],
  ),
  brandIcon(
    "brand-instagram",
    "Instagram",
    "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
    ["ig", "photo"],
  ),
  brandIcon(
    "brand-x",
    "X (Twitter)",
    "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.291 19.54h2.036L6.486 3.24H4.298l13.312 17.453z",
    ["twitter", "tweet"],
  ),
  brandIcon(
    "brand-linkedin",
    "LinkedIn",
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  ),
  brandIcon(
    "brand-youtube",
    "YouTube",
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    ["video", "play"],
  ),
  brandIcon(
    "brand-whatsapp",
    "WhatsApp",
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
    ["chat", "message"],
  ),
  brandIcon(
    "brand-tiktok",
    "TikTok",
    "M12.525.02c1.31-.02 2.61-.01 3.919-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.71v4.02c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 3.36.01 6.73-.02 10.09-.1 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.07-2.97.74-.63.66-.98 1.55-.96 2.47.03 1.02.42 2.01 1.11 2.77.73.81 1.79 1.28 2.87 1.26 1.18-.03 2.32-.58 3.06-1.49.56-.68.88-1.53.95-2.42.09-1.39.07-2.78.07-4.17.01-2.79-.01-5.57.02-8.36z",
  ),
  brandIcon(
    "brand-telegram",
    "Telegram",
    "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  ),
  brandIcon(
    "brand-discord",
    "Discord",
    "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.2252 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z",
  ),
  brandIcon(
    "brand-github",
    "GitHub",
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  ),
  brandIcon(
    "brand-pinterest",
    "Pinterest",
    "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.175.271-.405.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z",
  ),
  brandIcon(
    "brand-snapchat",
    "Snapchat",
    "M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.006c-.012.043-.019.087-.019.132 0 .266.175.497.432.571 1.237.357 2.633.717 3.197 2.133.199.522.258 1.094.17 1.662-.215 1.495-1.754 2.648-3.284 3.086-1.065.31-2.228.465-3.464.465-.363 0-.729-.014-1.094-.042-.363-.028-.729-.042-1.094-.042-.363 0-.729.014-1.094.042-.365.028-.731.042-1.094.042-1.236 0-2.399-.155-3.464-.465-1.53-.438-3.069-1.591-3.284-3.086-.088-.568-.029-1.14.17-1.662.564-1.416 1.96-1.776 3.197-2.133.257-.074.432-.305.432-.571 0-.045-.007-.089-.019-.132l-.003-.006c-.104-1.628-.23-3.654.299-4.847C7.853 1.069 11.216.793 12.206.793z",
  ),
];

function lucide(
  id: HeaderIconId,
  label: string,
  category: HeaderIconCategory,
  component: IconComponent,
  keywords: string[] = [],
): HeaderIconDefinition {
  return { id, label, category, component, keywords };
}

const LUCIDE_ICONS: HeaderIconDefinition[] = [
  lucide("phone", "Phone", "contact", Phone, ["call", "tel"]),
  lucide("mail", "Email", "contact", Mail, ["envelope", "message"]),
  lucide("map-pin", "Map pin", "contact", MapPin, ["location", "address"]),
  lucide("clock", "Clock", "contact", Clock, ["hours", "time"]),
  lucide("alarm-clock", "Alarm", "contact", AlarmClock, ["time"]),
  lucide("message-circle", "Message", "contact", MessageCircle, ["chat"]),
  lucide("message-square", "Chat", "contact", MessageSquare),
  lucide("send", "Send", "contact", Send),
  lucide("navigation", "Navigation", "contact", Navigation, ["gps"]),
  lucide("compass", "Compass", "contact", Compass),
  lucide("pin", "Pin", "contact", Pin),
  lucide("globe", "Globe", "contact", Globe, ["web", "world"]),
  lucide("languages", "Languages", "contact", Languages, ["translate"]),
  lucide("wifi", "Wi‑Fi", "contact", Wifi),

  lucide("search", "Search", "navigation", Search, ["find"]),
  lucide("home", "Home", "navigation", Home),
  lucide("link", "Link", "navigation", Link2),
  lucide("external-link", "External link", "navigation", ExternalLink),
  lucide("share", "Share", "navigation", Share2),
  lucide("arrow-right", "Arrow", "navigation", ArrowRight),
  lucide("chevron-right", "Chevron", "navigation", ChevronRight),
  lucide("route", "Route", "navigation", Route),
  lucide("user", "User", "navigation", User, ["account", "profile"]),
  lucide("users", "Users", "navigation", Users, ["team", "group"]),

  lucide("shopping-cart", "Cart", "commerce", ShoppingCart, ["shop"]),
  lucide("shopping-bag", "Bag", "commerce", ShoppingBag),
  lucide("store", "Store", "commerce", Store, ["shop"]),
  lucide("credit-card", "Payment", "commerce", CreditCard, ["card"]),
  lucide("tag", "Tag", "commerce", Tag, ["price", "sale"]),
  lucide("percent", "Percent", "commerce", Percent, ["discount", "sale"]),
  lucide("gift", "Gift", "commerce", Gift),
  lucide("truck", "Delivery", "commerce", Truck, ["shipping"]),
  lucide("package", "Package", "commerce", Package, ["box"]),

  lucide("graduation-cap", "Graduation", "academy", GraduationCap, ["education", "course"]),
  lucide("book-open", "Book", "academy", BookOpen, ["learn", "read"]),
  lucide("award", "Award", "academy", Award, ["certificate"]),
  lucide("trophy", "Trophy", "academy", Trophy, ["win"]),
  lucide("medal", "Medal", "academy", Medal),
  lucide("target", "Target", "academy", Target, ["goal"]),
  lucide("dumbbell", "Fitness", "academy", Dumbbell, ["gym", "sport"]),
  lucide("activity", "Activity", "academy", Activity, ["sport", "pulse"]),
  lucide("flame", "Flame", "academy", Flame, ["hot", "trending"]),
  lucide("zap", "Zap", "academy", Zap, ["energy", "fast"]),
  lucide("sparkles", "Sparkles", "academy", Sparkles, ["new", "featured"]),

  lucide("calendar", "Calendar", "general", Calendar, ["date", "event"]),
  lucide("calendar-days", "Schedule", "general", CalendarDays),
  lucide("bell", "Bell", "general", Bell, ["notification", "alert"]),
  lucide("info", "Info", "status", Info),
  lucide("help-circle", "Help", "status", HelpCircle, ["support", "faq"]),
  lucide("check-circle", "Success", "status", CheckCircle2, ["done", "ok"]),
  lucide("shield", "Shield", "status", Shield, ["secure", "trust"]),
  lucide("lock", "Lock", "status", Lock, ["secure"]),
  lucide("key", "Key", "status", Key),
  lucide("star", "Star", "status", Star, ["rating", "favorite"]),
  lucide("heart", "Heart", "status", Heart, ["like", "favorite"]),

  lucide("building", "Building", "general", Building2, ["office"]),
  lucide("plane", "Travel", "general", Plane, ["tours", "flight"]),
  lucide("car", "Car", "general", Car, ["drive"]),
  lucide("bus", "Bus", "general", Bus, ["transit"]),
  lucide("train", "Train", "general", Train, ["rail"]),
  lucide("bike", "Bike", "general", Bike, ["cycle"]),
  lucide("coffee", "Café", "general", Coffee),
  lucide("utensils", "Dining", "general", Utensils, ["food", "restaurant"]),
  lucide("sun", "Sun", "general", Sun, ["day", "weather"]),
  lucide("moon", "Moon", "general", Moon, ["night"]),
  lucide("cloud", "Cloud", "general", Cloud, ["weather"]),
  lucide("umbrella", "Umbrella", "general", Umbrella, ["weather", "rain"]),

  lucide("camera", "Camera", "media", Camera, ["photo"]),
  lucide("image", "Image", "media", Image, ["photo", "picture"]),
  lucide("video", "Video", "media", Video, ["film"]),
  lucide("play", "Play", "media", Play),
  lucide("music", "Music", "media", Music, ["audio"]),
  lucide("headphones", "Audio", "media", Headphones),
  lucide("upload", "Upload", "media", Upload),
];

export const HEADER_ICONS: HeaderIconDefinition[] = [...BRAND_ICONS, ...LUCIDE_ICONS];

export const HEADER_ICON_MAP = Object.fromEntries(HEADER_ICONS.map((icon) => [icon.id, icon])) as Record<
  string,
  HeaderIconDefinition
>;

export const HEADER_ICON_CATEGORIES: { id: HeaderIconCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "social", label: "Social & brands" },
  { id: "contact", label: "Contact" },
  { id: "commerce", label: "Commerce" },
  { id: "navigation", label: "Navigation" },
  { id: "academy", label: "Academy & sport" },
  { id: "media", label: "Media" },
  { id: "status", label: "Status" },
  { id: "general", label: "General" },
];

export const SOCIAL_PLATFORM_DEFAULT_ICONS: Record<string, HeaderIconId> = {
  facebook: "brand-facebook",
  instagram: "brand-instagram",
  twitter: "brand-x",
  linkedin: "brand-linkedin",
  youtube: "brand-youtube",
  whatsapp: "brand-whatsapp",
  tiktok: "brand-tiktok",
  telegram: "brand-telegram",
  discord: "brand-discord",
  github: "brand-github",
  pinterest: "brand-pinterest",
  snapchat: "brand-snapchat",
  custom: "link",
};

export function getHeaderIcon(id?: string | null): HeaderIconDefinition | undefined {
  if (!id) return undefined;
  return HEADER_ICON_MAP[id];
}

export function searchHeaderIcons(query: string, category: HeaderIconCategory | "all" = "all") {
  const q = query.trim().toLowerCase();
  return HEADER_ICONS.filter((icon) => {
    if (category !== "all" && icon.category !== category) return false;
    if (!q) return true;
    return (
      icon.label.toLowerCase().includes(q) ||
      icon.id.toLowerCase().includes(q) ||
      icon.keywords?.some((word) => word.includes(q))
    );
  });
}

export function resolveSocialIcon(link: { platform?: string; icon?: string }): HeaderIconId {
  if (link.icon) return link.icon;
  if (link.platform && SOCIAL_PLATFORM_DEFAULT_ICONS[link.platform]) {
    return SOCIAL_PLATFORM_DEFAULT_ICONS[link.platform];
  }
  return "link";
}

const COMPONENT_DEFAULT_ICONS: Partial<Record<string, HeaderIconId>> = {
  search: "search",
  phone: "phone",
  email: "mail",
  whatsapp: "brand-whatsapp",
  hours: "clock",
  location: "map-pin",
};

export function resolveComponentIcon(component: {
  type: string;
  icon?: string;
}): HeaderIconId | null {
  if (component.icon) return component.icon;
  return COMPONENT_DEFAULT_ICONS[component.type] ?? null;
}

export function componentSupportsIcon(type: string): boolean {
  return type !== "divider" && type !== "social_links";
}
