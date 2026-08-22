export const CONSENT_COOKIE_NAME = "mdp_cookie_consent";
export const CONSENT_VERSION = 1;

/** CNIL: ask again after about 6 months. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 183;

export type ConsentChoices = {
  analytics: boolean;
  marketing: boolean;
};

export type ConsentRecord = ConsentChoices & {
  v: typeof CONSENT_VERSION;
  ts: number;
};
