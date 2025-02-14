
abstract class ZodType<T> {
    abstract parse(data: unknown): T;
  
    safeParse(data: unknown): { success: boolean; data?: T; error?: Error } {
      try {
        const result = this.parse(data);
        return { success: true, data: result };
      } catch (e: any) {
        return { success: false, error: e };
      }
    }
  }
  
 
  class ZodString extends ZodType<string> {
    private minLength?: number;
    private maxLength?: number;
    private regexPattern?: RegExp;
  
 
    min(n: number): this {
      this.minLength = n;
      return this;
    }
  
   
    max(n: number): this {
      this.maxLength = n;
      return this;
    }
  
    
    regex(pattern: RegExp): this {
      this.regexPattern = pattern;
      return this;
    }
  
  
    parse(data: unknown): string {
      if (typeof data !== 'string') {
        throw new Error('Expected a string');
      }
      if (this.minLength !== undefined && data.length < this.minLength) {
        throw new Error(`String must have at least ${this.minLength} characters`);
      }
      if (this.maxLength !== undefined && data.length > this.maxLength) {
        throw new Error(`String must have no more than ${this.maxLength} characters`);
      }
      if (this.regexPattern && !this.regexPattern.test(data)) {
        throw new Error('String does not match the required pattern');
      }
      return data;
    }

  }
  
  
  class ZodNumber extends ZodType<number> {
    private minValue?: number;
    private maxValue?: number;
  
   
    min(n: number): this {
      this.minValue = n;
      return this;
    }
  
    max(n: number): this {
      this.maxValue = n;
      return this;
    }
  
   
    parse(data: unknown): number {
      if (typeof data !== 'number') {
        throw new Error('Expected a number');
      }
      if (this.minValue !== undefined && data < this.minValue) {
        throw new Error(`Number must be at least ${this.minValue}`);
      }
      if (this.maxValue !== undefined && data > this.maxValue) {
        throw new Error(`Number must be no more than ${this.maxValue}`);
      }
      return data;
    }
  }
  
 
  type Shape = { [key: string]: ZodType<any> };
  
  class ZodObject<T extends Shape> extends ZodType<{ [K in keyof T]: any }> {
    constructor(private shape: T) {
      super();
    }
  
    
    parse(data: unknown): { [K in keyof T]: any } {
      if (typeof data !== 'object' || data === null) {
        throw new Error('Expected an object');
      }
      const result: any = {};
      for (const key in this.shape) {
        const schema = this.shape[key];
        result[key] = schema.parse((data as any)[key]);
      }
      return result;
    }
  }

  class ZodUnion<T extends ZodType<any>[]> extends ZodType<any> {
    constructor(private schemas: T) {
      super();
    }
  
  
    parse(data: unknown): any {
      const errors: string[] = [];
      for (const schema of this.schemas) {
        try {
          return schema.parse(data);
        } catch (e: any) {
          errors.push(e.message);
        }
      }
      throw new Error(`No matching union type found. Errors: ${errors.join(', ')}`);
    }
  }
  
  class zodArray<T> extends ZodType<T[]> {
    private itemSchema: ZodType<T>;
    private minItems?: number;
    private maxItems?: number;

    constructor(itemSchema: ZodType<T>){
        super()
        this.itemSchema = itemSchema;
    }

    min(n: number): this {
        this.minItems = n;
        return this;
      }
    
     
      max(n: number): this {
        this.maxItems = n;
        return this;
      }

      parse(data: unknown): T[] {
        if (!Array.isArray(data)) {
          throw new Error('Expected an array');
        }
        if (this.minItems !== undefined && data.length < this.minItems) {
          throw new Error(`Array must have at least ${this.minItems} items`);
        }
        if (this.maxItems !== undefined && data.length > this.maxItems) {
          throw new Error(`Array must have no more than ${this.maxItems} items`);
        }
        return data.map((item) => this.itemSchema.parse(item));
      }
    
  }

export const zod  = {
    string:  ZodString,
    number:  ZodNumber,
    object: ZodObject,
    array: zodArray
}

