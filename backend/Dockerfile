# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project files for restore
COPY ["src/PersonalityTest.Domain/PersonalityTest.Domain.csproj", "PersonalityTest.Domain/"]
COPY ["src/PersonalityTest.Application/PersonalityTest.Application.csproj", "PersonalityTest.Application/"]
COPY ["src/PersonalityTest.Infrastructure/PersonalityTest.Infrastructure.csproj", "PersonalityTest.Infrastructure/"]
COPY ["src/PersonalityTest.API/PersonalityTest.API.csproj", "PersonalityTest.API/"]

# Restore dependencies for API project (includes all dependencies)
RUN dotnet restore "PersonalityTest.API/PersonalityTest.API.csproj"

# Copy source files
COPY ["src/PersonalityTest.Domain/", "PersonalityTest.Domain/"]
COPY ["src/PersonalityTest.Application/", "PersonalityTest.Application/"]
COPY ["src/PersonalityTest.Infrastructure/", "PersonalityTest.Infrastructure/"]
COPY ["src/PersonalityTest.API/", "PersonalityTest.API/"]
COPY ["data/", "data/"]

# Build and publish
WORKDIR "/app/PersonalityTest.API"
RUN dotnet build "PersonalityTest.API.csproj" -c Release -o /app/build
RUN dotnet publish "PersonalityTest.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Expose port
EXPOSE 5000

# Set environment variable
ENV ASPNETCORE_URLS=http://+:5000

# Run migrations on startup (in production, use a separate init container)
ENTRYPOINT ["dotnet", "PersonalityTest.API.dll"]
