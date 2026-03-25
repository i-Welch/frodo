import type { VerificationTier } from '../types.js';

export interface FieldDefinition {
  tier: VerificationTier;
  type:
    | 'string'
    | 'number'
    | 'date'
    | 'boolean'
    | 'currency'
    | 'array'
    | 'object';
  description?: string;
}

export interface ModuleDefinition {
  name: string;
  fields: Record<string, FieldDefinition>;
}

// ---------------------------------------------------------------------------
// Registry — maps module name → definition
// ---------------------------------------------------------------------------

const registry = new Map<string, ModuleDefinition>();

export function registerModule(def: ModuleDefinition): void {
  registry.set(def.name, def);
}

export function getModule(name: string): ModuleDefinition | undefined {
  return registry.get(name);
}

export function getAllModules(): ModuleDefinition[] {
  return Array.from(registry.values());
}

export function getModuleNames(): string[] {
  return Array.from(registry.keys());
}
