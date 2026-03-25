import { registerComponent } from './registry.js';
import { addressComponent } from './address.js';

/**
 * Register all built-in custom field components.
 * Call this once at startup, before any forms are rendered.
 */
export function registerBuiltinComponents(): void {
  registerComponent(addressComponent);
}
