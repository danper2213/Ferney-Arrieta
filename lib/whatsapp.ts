export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const num = (whatsappNumber || '').replace(/\D/g, '');
  if (!num) return '#';
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function interestWhatsAppMessage(offerLabel: string): string {
  return `Hola, estoy interesado en ${offerLabel} que vi en la web. ¿Me podrías enviar el link de pago de Bold?`;
}

export const LANDING_QUESTION_WHATSAPP_MESSAGE =
  'Hola, tengo una pregunta sobre el programa de acordeón antes de comprar.';
