import { registerComponent } from './registry';
import { addressComponent } from './address';
import { plaidLinkComponent } from './plaid-link';
import { socureVerifyComponent } from './socure-verify';

/**
 * Register all built-in custom field components.
 * Call this once at startup, before any forms are rendered.
 */
export function registerBuiltinComponents(): void {
  registerComponent(addressComponent);
  registerComponent(plaidLinkComponent);
  registerComponent(socureVerifyComponent);
}
