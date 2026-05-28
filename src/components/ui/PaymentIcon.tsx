import { cn } from '@/lib/utils';

export const BANK_LOGOS: Record<string, string> = {
  bca: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg',
  mandiri: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg',
  bni: 'https://upload.wikimedia.org/wikipedia/id/5/55/BNI_logo.svg',
  bri: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg',
  bsi: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Bank_Syariah_Indonesia.svg',
  jago: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Logo_Bank_Jago.png',
  seabank: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/SeaBank_logo.png',
  gopay: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg',
  ovo: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg',
  dana: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg',
  shopeepay: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee_logo.svg',
  linkaja: 'https://upload.wikimedia.org/wikipedia/commons/8/85/LinkAja.svg',
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
        <img 
          src={url} 
          alt={key} 
          className={cn("object-contain", className)}
        />
      );
    }
  }

  return <span className={fallbackClassName}>{icon}</span>;
}
