
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
  
//usage
  const myStringSchema = new ZodString().min(5).max(10).regex(/^[a-z]+$/);
  

  try {
    const validString = myStringSchema.parse("hello");
    console.log("Valid string:", validString);
  } catch (error) {
    console.error("Validation error:", error);
  }
  
  
  const myNumberSchema = new ZodNumber().min(0);
  
  
  try {
    const validNumber = myNumberSchema.parse(42);
    console.log("Valid number:", validNumber);
  } catch (error) {
    console.error("Validation error:", error);
  }
  
 
  const myObjectSchema = new ZodObject({
    username: new ZodString().min(3),
    age: new ZodNumber().min(18)
  });
  

  try {
    const validObject = myObjectSchema.parse({ username: "joe", age: 25 });
    console.log("Valid object:", validObject);
  } catch (error) {
    console.error("Validation error:", error);
  }
  