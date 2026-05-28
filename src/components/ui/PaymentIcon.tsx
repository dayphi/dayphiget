import { cn } from '@/lib/utils';

export const BANK_LOGOS: Record<string, string> = {
  bca: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/bca.svg',
  mandiri: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/mandiri.svg',
  bni: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/bni.svg',
  bri: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/bri.svg',
  bsi: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/bsi.svg',
  jago: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/jago.svg',
  seabank: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/seabank.svg',
  gopay: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/gopay.svg',
  ovo: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/ovo.svg',
  dana: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/dana.svg',
  shopeepay: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/shopee-pay.svg',
  linkaja: 'https://cdn.jsdelivr.net/gh/hafidznoor/idn-finlogos@master/icons/linkaja.svg',
};

export function getAutoPaymentIcon(name: string): string | null {
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (n.includes('shopeepay') || n.includes('spay')) return 'bank:shopeepay';
  for (const key of Object.keys(BANK_LOGOS)) {
    if (n.includes(key)) {
      return `bank:${key}`;
    }
  }
  return null;
}

export function getPaymentIconText(icon: string | null): string {
  if (!icon) return '💳';
  if (icon.startsWith('bank:')) {
    const b = icon.replace('bank:', '');
    if (['gopay', 'ovo', 'dana', 'shopeepay', 'linkaja'].includes(b)) return '📱';
    return '🏦';
  }
  return icon;
}

export function PaymentIcon({ 
  icon, 
  className = "w-6 h-6",
  fallbackClassName = "text-xl"
}: { 
  icon: string | null; 
  className?: string;
  fallbackClassName?: string;
}) {
  if (!icon) return <span className={fallbackClassName}>💳</span>;

  if (icon.startsWith('bank:')) {
    const key = icon.replace('bank:', '');
    const url = BANK_LOGOS[key];
    if (url) {
      return (
        <span className={cn("inline-flex items-center justify-center bg-white rounded-lg p-0.5 shrink-0 select-none overflow-hidden", className)}>
          <img 
            src={url} 
            alt={key} 
            className="w-full h-full object-contain"
          />
        </span>
      );
    }
  }

  return <span className={fallbackClassName}>{icon}</span>;
}

