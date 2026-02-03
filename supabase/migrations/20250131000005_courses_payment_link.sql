-- Campo opcional para link de pago (Bold). Si está lleno, la landing muestra "Pagar ahora" en lugar de "Comprar por WhatsApp".
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS payment_link text;
