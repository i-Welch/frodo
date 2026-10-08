export interface CollectOptions {
  /** Form token for this session */
  token: string;
  /** Frodo forms API base URL (default: '/forms') */
  endpoint?: string;
  /** Event source attribution (default: 'user') */
  source?: string;
}

export interface CollectField {
  module: string;
  field: string;
  required?: boolean;
  /** Client-side validator — return error message or null */
  validate?: (value: unknown) => string | null;
  /** Transform value before submission */
  transform?: (value: unknown) => unknown;
}

export interface CollectSubmitResult {
  success: boolean;
  eventsCreated?: number;
  errors?: Record<string, string>;
  redirectUrl?: string;
}

type EventHandler = (...args: unknown[]) => void;

export class FrodoCollect {
  private token: string;
  private endpoint: string;
  private source: string;
  private fields: Map<string, CollectField> = new Map();
  private values: Map<string, unknown> = new Map();
  private listeners: Map<string, EventHandler[]> = new Map();

  constructor(options: CollectOptions) {
    this.token = options.token;
    this.endpoint = options.endpoint ?? '/forms';
    this.source = options.source ?? 'user';
  }

  /** Register a field to collect */
  addField(field: CollectField): this {
    const key = `${field.module}.${field.field}`;
    this.fields.set(key, field);
    return this; // chainable
  }

  /** Register multiple fields */
  addFields(fields: CollectField[]): this {
    fields.forEach((f) => this.addField(f));
    return this;
  }

  /** Set a field value */
  setValue(module: string, field: string, value: unknown): this {
    const key = `${module}.${field}`;
    this.values.set(key, value);
    this.emit('change', module, field, value);
    return this;
  }

  /** Get a field value */
  getValue(module: string, field: string): unknown {
    return this.values.get(`${module}.${field}`);
  }

  /** Get all values as { module: { field: value } } */
  getValues(): Record<string, Record<string, unknown>> {
    const result: Record<string, Record<string, unknown>> = {};
    for (const [key, value] of this.values) {
      const [module, field] = key.split('.', 2);
      if (!result[module]) result[module] = {};
      result[module][field] = value;
    }
    return result;
  }

  /** Clear a specific field value */
  clearValue(module: string, field: string): this {
    this.values.delete(`${module}.${field}`);
    this.emit('change', module, field, undefined);
    return this;
  }

  /** Clear all values */
  clearAll(): this {
    this.values.clear();
    return this;
  }

  /** Validate all registered fields. Returns map of errors (empty = valid) */
  validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const [key, field] of this.fields) {
      const value = this.values.get(key);

      // Required check
      if (field.required && (value === undefined || value === null || value === '')) {
        errors[key] = `${field.field} is required`;
        continue;
      }

      // Custom validator
      if (field.validate && value !== undefined) {
        const error = field.validate(value);
        if (error) {
          errors[key] = error;
        }
      }
    }
    return errors;
  }

  /** Submit collected values to the Frodo backend */
  async submit(): Promise<CollectSubmitResult> {
    // 1. Validate
    const errors = this.validate();
    if (Object.keys(errors).length > 0) {
      this.emit('error', errors);
      return { success: false, errors };
    }

    // 2. Build submission payload — structured for event creation
    const fields: { module: string; field: string; value: unknown }[] = [];
    for (const [key, field] of this.fields) {
      const rawValue = this.values.get(key);
      if (rawValue === undefined) continue;

      const value = field.transform ? field.transform(rawValue) : rawValue;
      fields.push({ module: field.module, field: field.field, value });
    }

    // 3. POST to backend
    try {
      const response = await fetch(`${this.endpoint}/${this.token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields, source: this.source }),
      });

      const result = await response.json();

      if (response.ok) {
        this.emit('submit', result);
        return {
          success: true,
          eventsCreated: result.eventsCreated,
          redirectUrl: result.redirectUrl,
        };
      } else {
        this.emit('error', result);
        return {
          success: false,
          errors: result.errors ?? { _form: result.message ?? 'Submission failed' },
        };
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Network error';
      this.emit('error', { _network: error });
      return { success: false, errors: { _network: error } };
    }
  }

  /** Bind to a DOM form element — auto-extracts values on submit */
  bindForm(formElement: HTMLFormElement): this {
    formElement.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(formElement);

      // Extract values from form data and set them
      for (const [key, field] of this.fields) {
        // Support dot-notation names in form inputs (e.g., name="currentAddress.street")
        const value = formData.get(`${field.field}`) ?? formData.get(key);
        if (value !== null) {
          this.setValue(field.module, field.field, value);
        }
      }

      await this.submit();
    });
    return this;
  }

  /** Event emitter */
  on(event: string, handler: EventHandler): this {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
    return this;
  }

  off(event: string, handler: EventHandler): this {
    const handlers = this.listeners.get(event);
    if (handlers) {
      this.listeners.set(
        event,
        handlers.filter((h) => h !== handler),
      );
    }
    return this;
  }

  private emit(event: string, ...args: unknown[]): void {
    const handlers = this.listeners.get(event);
    if (handlers) handlers.forEach((h) => h(...args));
  }
}
