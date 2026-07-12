'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  deleteCoursePlan,
  seedDefaultCoursePlans,
  upsertCoursePlan,
} from '@/app/(admin)/admin/courses/[courseId]/course-plans-actions';
import type { CoursePlan } from '@/lib/course-plans';
import { Crown, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type CoursePlansManagerProps = {
  courseId: string;
  initialPlans: CoursePlan[];
};

type DraftPlan = {
  id: string | null;
  plan_key: string;
  name: string;
  tagline: string;
  description: string;
  featuresText: string;
  price_label: string;
  payment_link: string;
  badge: string;
  is_highlighted: boolean;
  is_active: boolean;
  order_index: number;
};

function toDraft(plan: CoursePlan): DraftPlan {
  return {
    id: plan.id,
    plan_key: plan.plan_key,
    name: plan.name,
    tagline: plan.tagline,
    description: plan.description,
    featuresText: plan.features.join('\n'),
    price_label: plan.price_label ?? '',
    payment_link: plan.payment_link ?? '',
    badge: plan.badge ?? '',
    is_highlighted: plan.is_highlighted,
    is_active: plan.is_active,
    order_index: plan.order_index,
  };
}

function emptyDraft(orderIndex: number): DraftPlan {
  return {
    id: null,
    plan_key: `plan_${orderIndex + 1}`,
    name: '',
    tagline: '',
    description: '',
    featuresText: '',
    price_label: '',
    payment_link: '',
    badge: '',
    is_highlighted: false,
    is_active: true,
    order_index: orderIndex,
  };
}

export function CoursePlansManager({ courseId, initialPlans }: CoursePlansManagerProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<DraftPlan[]>(() => initialPlans.map(toDraft));
  const [isPending, startTransition] = useTransition();
  const [editingIndex, setEditingIndex] = useState<number | null>(
    initialPlans.length === 0 ? null : 0
  );

  useEffect(() => {
    setPlans(initialPlans.map(toDraft));
    setEditingIndex(initialPlans.length === 0 ? null : 0);
  }, [initialPlans]);

  const sorted = useMemo(
    () => [...plans].sort((a, b) => a.order_index - b.order_index),
    [plans]
  );

  const savePlan = (index: number) => {
    const draft = plans[index];
    if (!draft) return;

    const features = draft.featuresText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    startTransition(async () => {
      const result = await upsertCoursePlan(courseId, draft.id, {
        plan_key: draft.plan_key,
        name: draft.name,
        tagline: draft.tagline,
        description: draft.description,
        features,
        price_label: draft.price_label,
        payment_link: draft.payment_link,
        badge: draft.badge,
        is_highlighted: draft.is_highlighted,
        is_active: draft.is_active,
        order_index: draft.order_index,
      });

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      setPlans((prev) =>
        prev.map((p, i) => (i === index ? { ...p, id: result.id } : p))
      );
      toast.success('Plan guardado');
      router.refresh();
    });
  };

  const removePlan = (index: number) => {
    const draft = plans[index];
    if (!draft) return;

    startTransition(async () => {
      if (draft.id) {
        const result = await deleteCoursePlan(courseId, draft.id);
        if ('error' in result) {
          toast.error(result.error);
          return;
        }
      }
      setPlans((prev) => prev.filter((_, i) => i !== index));
      setEditingIndex(null);
      toast.success('Plan eliminado');
      router.refresh();
    });
  };

  const seedDefaults = () => {
    startTransition(async () => {
      const result = await seedDefaultCoursePlans(courseId);
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      toast.success('Planes Anual / VIP / Ganador / VIP Plus creados');
      router.refresh();
    });
  };

  return (
    <Accordion type="single" collapsible defaultValue="course-plans" className="mb-6 rounded-lg border">
      <AccordionItem value="course-plans" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline sm:px-5">
          <div className="flex items-start gap-3 text-left">
            <Crown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 space-y-1">
              <p className="text-base font-semibold leading-none">Planes plus (mentorías)</p>
              <p className="text-sm font-normal text-muted-foreground">
                VIP, Ganador, VIP Plus… Se muestran como vista de programa en la landing.
              </p>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="space-y-4 px-4 pb-4 sm:px-5">
          {plans.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Aún no hay planes. Carga los sugeridos (Anual, VIP, Ganador, VIP Plus) o crea uno nuevo.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" disabled={isPending} onClick={seedDefaults}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Cargar Anual / VIP / Ganador / VIP Plus
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    setPlans([emptyDraft(0)]);
                    setEditingIndex(0);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear plan
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {sorted.map((plan) => {
                  const realIndex = plans.findIndex((p) => p === plan);
                  return (
                    <Button
                      key={`${plan.id ?? 'new'}-${plan.plan_key}-${plan.order_index}`}
                      type="button"
                      size="sm"
                      variant={editingIndex === realIndex ? 'default' : 'outline'}
                      onClick={() => setEditingIndex(realIndex)}
                    >
                      {plan.name || plan.plan_key}
                    </Button>
                  );
                })}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => {
                    const next = emptyDraft(plans.length);
                    setPlans((prev) => [...prev, next]);
                    setEditingIndex(plans.length);
                  }}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Nuevo
                </Button>
              </div>

              {editingIndex !== null && plans[editingIndex] && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        value={plans[editingIndex].name}
                        onChange={(e) =>
                          setPlans((prev) =>
                            prev.map((p, i) =>
                              i === editingIndex ? { ...p, name: e.target.value } : p
                            )
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Clave interna</Label>
                      <Input
                        value={plans[editingIndex].plan_key}
                        onChange={(e) =>
                          setPlans((prev) =>
                            prev.map((p, i) =>
                              i === editingIndex ? { ...p, plan_key: e.target.value } : p
                            )
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tagline</Label>
                      <Input
                        value={plans[editingIndex].tagline}
                        onChange={(e) =>
                          setPlans((prev) =>
                            prev.map((p, i) =>
                              i === editingIndex ? { ...p, tagline: e.target.value } : p
                            )
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Badge</Label>
                      <Input
                        value={plans[editingIndex].badge}
                        placeholder="Más elegido"
                        onChange={(e) =>
                          setPlans((prev) =>
                            prev.map((p, i) =>
                              i === editingIndex ? { ...p, badge: e.target.value } : p
                            )
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Precio (texto visible)</Label>
                      <Input
                        value={plans[editingIndex].price_label}
                        placeholder="Ej: $997 o $49/mes"
                        onChange={(e) =>
                          setPlans((prev) =>
                            prev.map((p, i) =>
                              i === editingIndex ? { ...p, price_label: e.target.value } : p
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción corta</Label>
                    <Textarea
                      rows={3}
                      value={plans[editingIndex].description}
                      onChange={(e) =>
                        setPlans((prev) =>
                          prev.map((p, i) =>
                            i === editingIndex ? { ...p, description: e.target.value } : p
                          )
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Beneficios (uno por línea)</Label>
                    <Textarea
                      rows={5}
                      value={plans[editingIndex].featuresText}
                      onChange={(e) =>
                        setPlans((prev) =>
                          prev.map((p, i) =>
                            i === editingIndex ? { ...p, featuresText: e.target.value } : p
                          )
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Link de pago (opcional)</Label>
                    <Input
                      value={plans[editingIndex].payment_link}
                      placeholder="https://…"
                      onChange={(e) =>
                        setPlans((prev) =>
                          prev.map((p, i) =>
                            i === editingIndex ? { ...p, payment_link: e.target.value } : p
                          )
                        )
                      }
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border"
                        checked={plans[editingIndex].is_highlighted}
                        onChange={(e) =>
                          setPlans((prev) =>
                            prev.map((p, i) =>
                              i === editingIndex ? { ...p, is_highlighted: e.target.checked } : p
                            )
                          )
                        }
                      />
                      Destacado
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border"
                        checked={plans[editingIndex].is_active}
                        onChange={(e) =>
                          setPlans((prev) =>
                            prev.map((p, i) =>
                              i === editingIndex ? { ...p, is_active: e.target.checked } : p
                            )
                          )
                        }
                      />
                      Activo
                    </label>
                    <div className="flex items-center gap-2 text-sm">
                      <Label htmlFor={`order-${editingIndex}`}>Orden</Label>
                      <Input
                        id={`order-${editingIndex}`}
                        type="number"
                        className="w-20"
                        value={plans[editingIndex].order_index}
                        onChange={(e) =>
                          setPlans((prev) =>
                            prev.map((p, i) =>
                              i === editingIndex
                                ? { ...p, order_index: Number(e.target.value) || 0 }
                                : p
                            )
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => removePlan(editingIndex)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                    <Button type="button" disabled={isPending} onClick={() => savePlan(editingIndex)}>
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Guardar plan
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
