'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MessageCircle, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

function buildReceiptWhatsAppUrl(courseTitle: string, userEmail: string | null): string {
  if (!WHATSAPP_NUMBER) return '#';
  const email = userEmail?.trim() || 'Pendiente';
  const message = `Hola, acabo de realizar el pago del curso ${courseTitle} en Bold. Mi correo de registro es ${email}. Aquí adjunto mi comprobante.`;
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

type PaymentModalProps = {
  courseTitle: string;
  paymentLink: string;
  userEmail: string | null;
  /** Botón que abre el modal (trigger). Si no se pasa, se usa el botón por defecto. */
  trigger?: React.ReactNode;
  /** Clase del botón trigger por defecto */
  triggerClassName?: string;
};

export function PaymentModal({
  courseTitle,
  paymentLink,
  userEmail,
  trigger,
  triggerClassName,
}: PaymentModalProps) {
  const receiptUrl = buildReceiptWhatsAppUrl(courseTitle, userEmail);

  const defaultTrigger = (
    <button
      type="button"
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white bg-primary hover:bg-primary/90 transition-colors',
        triggerClassName
      )}
    >
      <CreditCard className="h-4 w-4" />
      Pagar ahora
    </button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent
        className="border-slate-800 bg-slate-950 text-white max-w-md gap-6 p-6 sm:p-8"
        showCloseButton={true}
      >
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-xl font-semibold text-white">
            Pagar y reportar
          </DialogTitle>
        </DialogHeader>

        {/* Paso 1 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            Paso 1
          </h3>
          <p className="font-medium text-white">Realiza tu pago seguro</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Haz clic abajo para abrir la pasarela de pagos de Bold en una pestaña segura.
          </p>
          <a
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary/90"
          >
            <CreditCard className="h-4 w-4" />
            Ir a Pagar con Bold 💳
          </a>
        </div>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-950 px-2 text-slate-500">
              Una vez completes el pago...
            </span>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            Paso 2
          </h3>
          <p className="font-medium text-white">Reporta tu pago para activar el acceso</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Es importante que nos envíes el comprobante para habilitarte el curso inmediatamente.
          </p>
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 font-medium text-white transition-colors hover:bg-[#20BD5A]"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar Comprobante por WhatsApp 📱
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
