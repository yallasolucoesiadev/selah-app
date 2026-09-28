import { greetingFor } from '@/lib/greeting';
import { buildYearGrid, daysSince, progressLabel, progressRatio, TOTAL_DAYS } from '@/lib/journey';
import { normalizeTime, splitTime } from '@/lib/time';
import { isValidEmail, isValidPassword } from '@/lib/validation';

describe('greeting', () => {
  it('varia conforme o horário', () => {
    expect(greetingFor(new Date(2026, 0, 1, 8))).toBe('Bom dia.');
    expect(greetingFor(new Date(2026, 0, 1, 15))).toBe('Boa tarde.');
    expect(greetingFor(new Date(2026, 0, 1, 21))).toBe('Boa noite.');
    expect(greetingFor(new Date(2026, 0, 1, 2))).toBe('Boa noite.');
  });
});

describe('journey', () => {
  it('monta um ano de 365 dias, em 12 meses, sem repetir números', () => {
    const grid = buildYearGrid();
    const all = grid.flatMap((m) => m.days);
    expect(grid).toHaveLength(12);
    expect(all).toHaveLength(TOTAL_DAYS);
    expect(new Set(all).size).toBe(TOTAL_DAYS);
    expect(all[0]).toBe(1);
    expect(all[all.length - 1]).toBe(365);
  });

  it('formata e limita o progresso', () => {
    expect(progressLabel(23)).toBe('23 de 365 dias');
    expect(progressRatio(-3)).toBe(0);
    expect(progressRatio(9999)).toBe(1);
  });

  it('conta dias desde o início (mínimo 1)', () => {
    const now = new Date('2026-03-10T12:00:00Z');
    expect(daysSince('2026-03-10T08:00:00Z', now)).toBe(1);
    expect(daysSince('2026-03-08T08:00:00Z', now)).toBe(3);
    expect(daysSince(null, now)).toBe(1);
  });
});

describe('time', () => {
  it('normaliza horários do Postgres e digitados', () => {
    expect(normalizeTime('08:00:00')).toBe('08:00');
    expect(normalizeTime('8:05')).toBe('08:05');
    expect(normalizeTime('24:00')).toBeNull();
    expect(normalizeTime('abc')).toBeNull();
    expect(splitTime('18:30')).toEqual({ hour: 18, minute: 30 });
  });
});

describe('validation', () => {
  it('valida e-mail e senha', () => {
    expect(isValidEmail('voce@email.com')).toBe(true);
    expect(isValidEmail('voce@email')).toBe(false);
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('12345678')).toBe(true);
  });
});
