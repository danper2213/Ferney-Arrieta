import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  LandingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from '@/components/landing/LandingSection';

const FAQS: { q: string; a: string }[] = [
  {
    q: '¿Necesito saber tocar acordeón?',
    a: 'No. Puedes comenzar desde cero.',
  },
  {
    q: '¿Necesito tener acordeón?',
    a: 'Sí, necesitas tener un acordeón para poder practicar lo aprendido.',
  },
  {
    q: '¿Las clases son grabadas?',
    a: 'Sí. El contenido de los módulos está disponible dentro de la plataforma.',
  },
  {
    q: '¿Puedo ver las clases varias veces?',
    a: 'Sí. Puedes volver al contenido para repasar y practicar.',
  },
  {
    q: '¿Cuánto tiempo necesito estudiar?',
    a: 'No necesitas pasar horas estudiando. Lo importante es establecer una rutina de práctica y ser constante.',
  },
  {
    q: '¿Las clases en vivo quedan grabadas?',
    a: 'No quedan grabadas. Debes estar en la clase para que no te la pierdas.',
  },
  {
    q: '¿Puedo empezar desde cero?',
    a: 'Sí.',
  },
  {
    q: '¿Puedo entrar si ya sé tocar?',
    a: 'Si ya sabes meter bajo y tocas, y quieres subir de nivel, debes preguntar por Domina el Acordeón Nivel 2.',
  },
  {
    q: '¿Cómo realizo el pago?',
    a: 'Haz clic en «Quiero el Programa Ganador» o «Quiero la Plataforma» y continúa con el proceso de pago.',
  },
];

export function FaqSection() {
  return (
    <LandingSection id="faq" tone="alt">
      <SectionEyebrow>Resolvemos dudas</SectionEyebrow>
      <SectionTitle>Preguntas frecuentes</SectionTitle>
      <SectionLead>
        Cada respuesta aquí es una conversación que ya no tienes que tener por WhatsApp.
      </SectionLead>

      <Accordion
        type="single"
        collapsible
        className="mx-auto max-w-3xl rounded-2xl border border-slate-700/60 bg-slate-950/80 px-4 sm:px-6"
      >
        {FAQS.map((item, index) => (
          <AccordionItem
            key={item.q}
            value={`faq-${index}`}
            className="border-slate-800"
          >
            <AccordionTrigger className="py-4 text-left text-sm font-semibold text-white hover:no-underline sm:text-base">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </LandingSection>
  );
}
