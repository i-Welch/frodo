import { registerComponent } from './registry.js';
import { addressComponent } from './address.js';
import { plaidLinkComponent } from './plaid-link.js';

/**
 * Register all built-in custom field components.
 * Call this once at startup, before any forms are rendered.
 */
export function registerBuiltinComponents(): void {
  registerComponent(addressComponent);
  registerComponent(plaidLinkComponent);
}
