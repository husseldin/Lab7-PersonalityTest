# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["PersonalityTest.sln", "./"]
COPY ["src/PersonalityTest.Domain/PersonalityTest.Domain.csproj", "src/PersonalityTest.Domain/"]
COPY ["src/PersonalityTest.Application/PersonalityTest.Application.csproj", "src/PersonalityTest.Application/"]
COPY ["src/PersonalityTest.Infrastructure/PersonalityTest.Infrastructure.csproj", "src/PersonalityTest.Infrastructure/"]
COPY ["src/PersonalityTest.API/PersonalityTest.API.csproj", "src/PersonalityTest.API/"]

# Restore dependencies
RUN dotnet restore "PersonalityTest.sln"

# Copy everything else
COPY . .

# Build and publish
WORKDIR "/src/src/PersonalityTest.API"
RUN dotnet build "PersonalityTest.API.csproj" -c Release -o /app/build
RUN dotnet publish "PersonalityTest.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Install Playwright browsers for PDF generation
RUN pwsh -Command "playwright install chromium"
RUN pwsh -Command "playwright install-deps chromium"

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcb1 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Copy published app
COPY --from=build /app/publish .

# Expose port
EXPOSE 5000

# Set environment variable
ENV ASPNETCORE_URLS=http://+:5000

# Run migrations on startup (in production, use a separate init container)
ENTRYPOINT ["dotnet", "PersonalityTest.API.dll"]
