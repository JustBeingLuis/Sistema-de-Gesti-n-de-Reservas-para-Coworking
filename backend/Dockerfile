# Etapa de construcción (Instala dependencias y compila el código)
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa de ejecución (Toma el archivo .jar compilado y lo corre)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/reservas-0.0.1-SNAPSHOT.jar app.jar

# Exponer el puerto
EXPOSE 8080

# Iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
