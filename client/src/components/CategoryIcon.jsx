import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Home,
  Zap,
  Car,
  Film,
  HeartPulse,
  GraduationCap,
  Users,
  PiggyBank,
  MoreHorizontal,
  Briefcase,
  Award,
  Laptop,
  TrendingUp,
  Landmark,
  Gift,
  PlusCircle,
  Tag,
  Coffee,
  Smartphone,
  Plane,
  BookOpen,
  Dumbbell,
  Music,
  ShieldCheck,
  DollarSign,
  CreditCard,
  Wallet,
  ShoppingBasket
} from 'lucide-react';

const iconMap = {
  Utensils,
  ShoppingBag,
  ShoppingBasket,
  Home,
  Zap,
  Car,
  Film,
  HeartPulse,
  GraduationCap,
  Users,
  PiggyBank,
  MoreHorizontal,
  Briefcase,
  Award,
  Laptop,
  TrendingUp,
  Landmark,
  Gift,
  PlusCircle,
  Tag,
  Coffee,
  Smartphone,
  Plane,
  BookOpen,
  Dumbbell,
  Music,
  ShieldCheck,
  DollarSign,
  CreditCard,
  Wallet
};

export default function CategoryIcon({ name, className = 'w-5 h-5', color }) {
  const IconComponent = iconMap[name] || Tag;
  return <IconComponent className={className} style={color ? { color } : undefined} />;
}

export const availableIcons = Object.keys(iconMap);
