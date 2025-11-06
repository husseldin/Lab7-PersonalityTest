# Contributing to Personality Test Platform

Thank you for considering contributing to this project! Here are guidelines to help you get started.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Help create a positive community

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. Use the bug report template
3. Provide:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, .NET version, browser, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check if the feature has already been requested
2. Describe the feature and its benefits
3. Provide use cases
4. Consider implementation complexity

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Follow coding standards**:
   - Backend: Follow C# coding conventions, use Clean Architecture patterns
   - Frontend: Follow Angular style guide, use standalone components
4. **Write tests**: All new features must include tests
5. **Update documentation**: Update README or other docs as needed
6. **Commit with clear messages**: Use conventional commits (feat:, fix:, docs:, etc.)
7. **Push to your fork**: `git push origin feature/your-feature-name`
8. **Create a Pull Request**

### Coding Standards

#### Backend (.NET)
- Follow Clean Architecture principles
- Use SOLID principles
- Write unit tests for business logic
- Use async/await for I/O operations
- Follow naming conventions:
  - Classes: PascalCase
  - Methods: PascalCase
  - Private fields: _camelCase
  - Parameters: camelCase

#### Frontend (Angular)
- Use standalone components (Angular 17+)
- Follow Angular style guide
- Use TypeScript strict mode
- Write unit tests for components and services
- Follow naming conventions:
  - Components: kebab-case.component.ts
  - Services: kebab-case.service.ts
  - Use reactive programming (RxJS, signals)

### Testing Requirements

- Backend: Minimum 70% code coverage
- Frontend: Test critical user flows
- Integration tests for API endpoints
- E2E tests for main user journeys

### Development Workflow

1. Pull latest changes: `git pull origin main`
2. Create feature branch
3. Make changes
4. Run tests locally
5. Commit changes
6. Push to fork
7. Create PR
8. Address review feedback

## Development Setup

See [README.md](./README.md) for detailed setup instructions.

## Questions?

Open a GitHub Discussion or contact the maintainers.

Thank you for contributing! 🎉
