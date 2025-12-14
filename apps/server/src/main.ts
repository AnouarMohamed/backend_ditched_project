import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow your Next.js app to call the API
  app.enableCors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  });

  // Swagger UI
  const config = new DocumentBuilder()
    .setTitle("Mediflow API")
    .setDescription("Clinic queue & visit management")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}
bootstrap();
