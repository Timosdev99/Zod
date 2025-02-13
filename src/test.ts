import { zod } from "./zod";

const string = new zod.string()
const number = new zod.number()

try {
    const myStringSchema = new zod.string()
    const validString = myStringSchema.parse("hello");
    console.log("Valid string:", validString);
  } catch (error) {
    console.error("Validation error:", error);
  }
  

  try {
    const myNumberSchema = new zod.number()
    const validNumber = myNumberSchema.parse(42);
    console.log("Valid number:", validNumber);
  } catch (error) {
    console.error("Validation error:", error);
  }

  const myObjectSchema = new zod.object({
    username:  string.min(3),
    age: number.min(18)
  });
  

  try {
    const validObject = myObjectSchema.parse({ username: "joe", age: 25 });
    console.log("Valid object:", validObject);
  } catch (error) {
    console.error("Validation error:", error);
  }
  