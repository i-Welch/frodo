import type { CustomFieldComponent } from '../types.js';

const componentRegistry = new Map<string, CustomFieldComponent>();

// Standard built-in types that don't need custom components
const STANDARD_TYPES = new Set([
  'text', 'number', 'email', 'phone', 'date', 'ssn',
  'select', 'radio', 'checkbox', 'textarea', 'currency',
]);

export function registerComponent(component: CustomFieldComponent): void {
  componentRegistry.set(component.name, component);
}

export function getComponent(name: string): CustomFieldComponent | undefined {
  return componentRegistry.get(name);
}

export function isStandardType(inputType: string): boolean {
  return STANDARD_TYPES.has(inputType);
}

export function isCustomComponent(inputType: string): boolean {
  return componentRegistry.has(inputType);
}

export function isValidInputType(inputType: string): boolean {
  return isStandardType(inputType) || isCustomComponent(inputType);
}

/**
 * Remove a registered component (useful for testing).
 */
export function unregisterComponent(name: string): void {
  componentRegistry.delete(name);
}
