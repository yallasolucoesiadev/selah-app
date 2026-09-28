/**
 * Arquitetura de assinatura (SEM cobrança real por enquanto).
 *
 * Quando o RevenueCat for integrado, apenas `getEntitlements()` muda: ele passará a consultar
 * o SDK (`Purchases.getCustomerInfo()`) e devolver o plano real. Telas e regras de recurso
 * continuam usando `hasFeature()`.
 */
export type PlanId = 'free' | 'premium';

export type PremiumFeature =
  | 'unlimited_ai'
  | 'deep_conversations'
  | 'personalized_prayers'
  | 'voice'
  | 'full_history'
  | 'journey_memory'
  | 'premium_audio';

export const PREMIUM_FEATURES: { id: PremiumFeature; label: string; description: string }[] = [
  { id: 'unlimited_ai', label: 'IA ilimitada', description: 'Converse sem limites sobre sua jornada.' },
  { id: 'deep_conversations', label: 'Conversas profundas', description: 'Reflexões mais longas e detalhadas.' },
  { id: 'personalized_prayers', label: 'Orações personalizadas', description: 'Orações criadas a partir da sua história.' },
  { id: 'voice', label: 'Voz', description: 'Fale e ouça sua conversa em voz alta.' },
  { id: 'full_history', label: 'Histórico completo', description: 'Acesse todo o seu histórico espiritual.' },
  { id: 'journey_memory', label: 'Memória da jornada', description: 'A SELAH lembra do seu caminho, se você permitir.' },
  { id: 'premium_audio', label: 'Áudios premium', description: 'Áudios narrados com produção especial.' },
];

export interface Entitlements {
  plan: PlanId;
  features: ReadonlySet<PremiumFeature>;
}

/** TODO(RevenueCat): trocar por consulta real ao SDK. Hoje todos usam o plano gratuito. */
export async function getEntitlements(): Promise<Entitlements> {
  return { plan: 'free', features: new Set() };
}

/**
 * Enquanto não há cobrança, nenhum recurso é bloqueado (retorna sempre true).
 * Depois da integração: `return entitlements.features.has(feature)`.
 */
export function hasFeature(_entitlements: Entitlements, _feature: PremiumFeature): boolean {
  return true;
}
