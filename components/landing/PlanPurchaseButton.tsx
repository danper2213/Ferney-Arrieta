'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { PaymentModal } from '@/components/landing/PaymentModal';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type PlanPurchaseButtonProps = {
  offerName: string;
  paymentLink: string | null;
  whatsappUrl: string;
  userEmail: string | null;
  whatsappNumber: string;
  isEnrolled: boolean;
  courseSlug: string | null;
  className?: string;
  children: ReactNode;
};

export function PlanPurchaseButton({
  offerName,
  paymentLink,
  whatsappUrl,
  userEmail,
  whatsappNumber,
  isEnrolled,
  courseSlug,
  className,
  children,
}: PlanPurchaseButtonProps) {
  const classes = cn(
    'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300 active:scale-[0.98] sm:min-h-0 sm:text-base',
    className
  );

  if (isEnrolled && courseSlug) {
    return (
      <Link href={`/course/${courseSlug}`} className={classes}>
        Ir al Aula
      </Link>
    );
  }

  if (paymentLink?.trim()) {
    return (
      <PaymentModal
        courseTitle={offerName}
        paymentLink={paymentLink}
        userEmail={userEmail}
        whatsappNumber={whatsappNumber || null}
        trigger={<button type="button" className={classes}>{children}</button>}
      />
    );
  }

  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={classes}>
      <MessageCircle className="h-4 w-4 shrink-0" />
      {children}
    </a>
  );
}
