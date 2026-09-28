export const TOTAL_DAYS = 365;

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export interface MonthBlock {
  name: string;
  /** Números de dia da jornada (1..365) que pertencem ao mês. */
  days: number[];
}

/** Ano de 365 dias dividido em meses; cada célula é o número do dia da jornada. */
export function buildYearGrid(): MonthBlock[] {
  let counter = 0;
  return MONTHS.map((name, index) => {
    const days: number[] = [];
    for (let i = 0; i < MONTH_LENGTHS[index]; i++) {
      counter += 1;
      days.push(counter);
    }
    return { name, days };
  });
}

export function progressLabel(completed: number): string {
  return `${completed} de ${TOTAL_DAYS} dias`;
}

export function progressRatio(completed: number): number {
  return Math.max(0, Math.min(1, completed / TOTAL_DAYS));
}

/** Dias desde o início da jornada (mínimo 1). */
export function daysSince(iso: string | null | undefined, now: Date = new Date()): number {
  if (!iso) return 1;
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) return 1;
  const diff = Math.floor((now.getTime() - start) / 86_400_000);
  return Math.max(1, diff + 1);
}
