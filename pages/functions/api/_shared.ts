/**
 * Shared utilities for Cloudflare Pages Functions
 */

// =============================================================================
// Turnstile Verification
// =============================================================================

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileVerifyResult {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verifies a Cloudflare Turnstile token
 * @param token - The cf-turnstile-response token from the client
 * @param secretKey - The Turnstile secret key
 * @param remoteIp - Optional client IP address for additional verification
 * @returns Promise with verification result
 */
export async function verifyTurnstile(
  token: string,
  secretKey: string,
  remoteIp?: string | null
): Promise<{ success: boolean; error?: string }> {
  // Si pas de clé secrète configurée, on skip la vérification (mode dev)
  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY not configured, skipping verification');
    return { success: true };
  }

  if (!token) {
    console.error('Turnstile: token manquant');
    return { success: false, error: 'Token Turnstile manquant' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error('Turnstile API error:', response.status);
      return { success: false, error: 'Erreur de vérification Turnstile' };
    }

    const result: TurnstileVerifyResult = await response.json();

    if (!result.success) {
      console.warn('Turnstile verification failed:', result['error-codes']);
      return {
        success: false,
        error: 'La vérification de sécurité a échoué. Veuillez réessayer.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'Erreur lors de la vérification de sécurité' };
  }
}
