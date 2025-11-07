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

# Install Playwright browsers using dotnet tool (official recommended method)
WORKDIR /app
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN dotnet new tool-manifest || true
RUN dotnet tool install Microsoft.Playwright.CLI
RUN dotnet tool run playwright install chromium --with-deps

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libatspi2.0-0 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# Copy published app
COPY --from=build /app/publish .
# Copy Playwright browsers from build stage
COPY --from=build /ms-playwright /ms-playwright
# Set Playwright browser path for runtime
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Expose port
EXPOSE 5000

# Set environment variable
ENV ASPNETCORE_URLS=http://+:5000

# Run migrations on startup (in production, use a separate init container)
ENTRYPOINT ["dotnet", "PersonalityTest.API.dll"]
