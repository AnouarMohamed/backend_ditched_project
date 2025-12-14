import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const res = this.schema.safeParse(value);
    if (!res.success) {
      const details = res.error.issues.map(i => ({
        path: i.path.join("."),
        message: i.message,
      }));
      throw new BadRequestException({
        message: "Validation failed",
        details,
      });
    }
    return res.data;
  }
}
