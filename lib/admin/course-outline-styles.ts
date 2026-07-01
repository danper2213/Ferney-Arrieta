export type ModuleOutlineStyle = {
  container: string;
  triggerHover: string;
  content: string;
  badge: string;
};

export type LessonOutlineStyle = {
  card: string;
  header: string;
  content: string;
  numberBadge: string;
};

const MODULE_STYLES: ModuleOutlineStyle[] = [
  {
    container:
      'overflow-hidden rounded-xl border border-blue-500/45 border-l-[5px] border-l-blue-500 bg-gradient-to-br from-blue-500/20 via-blue-500/[0.07] to-background shadow-md shadow-blue-500/15',
    triggerHover: 'hover:bg-blue-500/15',
    content: 'bg-blue-500/[0.06]',
    badge: 'border-blue-500/50 bg-blue-500/25 font-semibold text-blue-950 dark:text-blue-50',
  },
  {
    container:
      'overflow-hidden rounded-xl border border-violet-500/45 border-l-[5px] border-l-violet-500 bg-gradient-to-br from-violet-500/20 via-violet-500/[0.07] to-background shadow-md shadow-violet-500/15',
    triggerHover: 'hover:bg-violet-500/15',
    content: 'bg-violet-500/[0.06]',
    badge: 'border-violet-500/50 bg-violet-500/25 font-semibold text-violet-950 dark:text-violet-50',
  },
];

const LESSON_STYLES_BLUE: [LessonOutlineStyle, LessonOutlineStyle] = [
  {
    card: 'overflow-hidden border border-blue-500/35 border-l-[3px] border-l-blue-500 bg-blue-500/12 py-0 shadow-sm shadow-blue-500/10 dark:bg-blue-500/18',
    header: 'border-b border-blue-500/25 bg-blue-500/18',
    content: 'bg-blue-500/[0.05]',
    numberBadge:
      'border-blue-500/45 bg-blue-500/25 font-semibold text-blue-950 dark:text-blue-50',
  },
  {
    card: 'overflow-hidden border border-cyan-500/35 border-l-[3px] border-l-cyan-500 bg-cyan-500/12 py-0 shadow-sm shadow-cyan-500/10 dark:bg-cyan-500/18',
    header: 'border-b border-cyan-500/25 bg-cyan-500/18',
    content: 'bg-cyan-500/[0.05]',
    numberBadge:
      'border-cyan-500/45 bg-cyan-500/25 font-semibold text-cyan-950 dark:text-cyan-50',
  },
];

const LESSON_STYLES_INDIGO: [LessonOutlineStyle, LessonOutlineStyle] = [
  {
    card: 'overflow-hidden border border-indigo-500/35 border-l-[3px] border-l-indigo-500 bg-indigo-500/12 py-0 shadow-sm shadow-indigo-500/10 dark:bg-indigo-500/18',
    header: 'border-b border-indigo-500/25 bg-indigo-500/18',
    content: 'bg-indigo-500/[0.05]',
    numberBadge:
      'border-indigo-500/45 bg-indigo-500/25 font-semibold text-indigo-950 dark:text-indigo-50',
  },
  {
    card: 'overflow-hidden border border-fuchsia-500/35 border-l-[3px] border-l-fuchsia-500 bg-fuchsia-500/12 py-0 shadow-sm shadow-fuchsia-500/10 dark:bg-fuchsia-500/18',
    header: 'border-b border-fuchsia-500/25 bg-fuchsia-500/18',
    content: 'bg-fuchsia-500/[0.05]',
    numberBadge:
      'border-fuchsia-500/45 bg-fuchsia-500/25 font-semibold text-fuchsia-950 dark:text-fuchsia-50',
  },
];

export function getModuleOutlineStyle(moduleIndex: number): ModuleOutlineStyle {
  return MODULE_STYLES[moduleIndex % MODULE_STYLES.length];
}

export function getLessonOutlineStyle(
  moduleIndex: number,
  lessonIndex: number
): LessonOutlineStyle {
  const palette = moduleIndex % 2 === 0 ? LESSON_STYLES_BLUE : LESSON_STYLES_INDIGO;
  return palette[lessonIndex % palette.length];
}
