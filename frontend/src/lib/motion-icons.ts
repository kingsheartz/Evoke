import {
  Award,
  BookOpen,
  Compass,
  Dumbbell,
  Globe,
  GraduationCap,
  MapPin,
  Mountain,
  Package,
  Plane,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const MOTION_CHAPTER_ICONS = [
  { value: "map-pin", label: "Location pin" },
  { value: "shopping-bag", label: "Shopping bag" },
  { value: "graduation-cap", label: "Academy" },
  { value: "plane", label: "Plane" },
  { value: "target", label: "Target" },
  { value: "globe", label: "Globe" },
  { value: "compass", label: "Compass" },
  { value: "package", label: "Package" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "sparkles", label: "Sparkles" },
  { value: "star", label: "Star" },
  { value: "award", label: "Award" },
  { value: "users", label: "Users" },
  { value: "zap", label: "Zap" },
  { value: "book-open", label: "Book" },
  { value: "mountain", label: "Mountain" },
] as const;

const motionIconMap: Record<string, LucideIcon> = {
  "map-pin": MapPin,
  "shopping-bag": ShoppingBag,
  "graduation-cap": GraduationCap,
  plane: Plane,
  target: Target,
  globe: Globe,
  compass: Compass,
  package: Package,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  star: Star,
  award: Award,
  users: Users,
  zap: Zap,
  "book-open": BookOpen,
  mountain: Mountain,
};

export function resolveMotionIcon(name?: string | null): LucideIcon {
  if (name && motionIconMap[name]) return motionIconMap[name];
  return MapPin;
}
