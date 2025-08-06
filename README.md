# JSR-352 Batch Tool 🚀

> A friendly wizard to help you create Java batch jobs without the headache!

## What's This All About? 🤔

Ever had to configure a JSR-352 batch job and felt like you needed a PhD in XML? We've been there! This tool turns that painful process into a simple, step-by-step wizard that actually makes sense.

## Quick Start ⚡

```bash
# Get the dependencies
npm install

# Fire it up!
npm run dev

# That's it! Open http://localhost:5173 🎉
```

## 📚 Documentation

Check out our comprehensive documentation in the [`docs/`](./docs/) folder:

- 🚀 [JSR-352 Guide](./docs/JSR352-GUIDE.md) - What's JSR-352 all about?
- 🔄 [Batch Job Flows](./docs/BATCH-FLOWS.md) - How different job patterns work
- 🚨 [Error Handling Guide](./docs/ERROR-HANDLING.md) - Skip, retry, and recovery patterns
- 🖥️ [Screens Guide](./docs/SCREENS.md) - What each page does
- 🎣 [Hooks Guide](./docs/HOOKS.md) - Our custom React hooks
- 🧪 [Testing Guide](./docs/TESTING.md) - Comprehensive testing setup with 80+ tests and 88%+ coverage
- 🔍 [Code Quality Guide](./docs/CODE-QUALITY.md) - Quality standards, metrics, and best practices
- ♿ [Accessibility Guide](./docs/ACCESSIBILITY.md) - WCAG 2.1 AA compliance features
- 📖 [JSDoc Guide](./docs/JSDOC.md) - API documentation standards
- 🌐 [API Documentation](./docs/api/index.html) - Interactive API reference

## 🏗️ How This App Was Built

This application was created step-by-step using modern React development practices. Here's the complete journey:

### 1. Initial Project Setup
```bash
# Create Vite React TypeScript project
npm create vite@latest raven-app -- --template react-swc-ts
cd raven-app
npm install
```

### 2. UI Framework Setup
```bash
# Install Tailwind CSS for styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install Shadcn/ui for components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card form input label select
```

### 3. Form Management & Validation
```bash
# Install React Hook Form for form handling
npm install react-hook-form @hookform/resolvers

# Install Zod for schema validation
npm install zod
```

### 4. State Management
```bash
# Install Zustand for simple state management
npm install zustand
```

### 5. Testing Setup
```bash
# Install Vitest and React Testing Library
npm install -D vitest @vitest/ui @vitest/coverage-v8
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D jsdom
```

### 6. Development Tools
```bash
# Install additional TypeScript types
npm install -D @types/node

# Install ESLint and Prettier (if not included)
npm install -D eslint prettier eslint-config-prettier
```

### 7. Project Structure Creation
```bash
# Create organized folder structure
mkdir -p src/screens/main src/screens/dynamic-steps
mkdir -p src/hooks src/utils src/types src/components/ui
mkdir -p src/test src/screens/__tests__ src/hooks/__tests__ src/utils/__tests__
```

### 8. Core Development Steps

#### Phase 1: Basic Screens & Navigation
- Created main workflow screens (Batch Details, Properties, Listeners, etc.)
- Implemented step-by-step wizard navigation
- Added form validation with Zod schemas

#### Phase 2: Dynamic Step Generation
- Built dynamic step configuration system
- Created different step types (Batchlet, Chunk, Partitioned)
- Implemented conditional screen flows

#### Phase 3: Code Quality Improvements
- Extracted common utilities (`stepUtils.ts`, `validationUtils.ts`)
- Created reusable hooks (`useStepNavigation`, `useStepDataUpdate`)
- Implemented consistent validation patterns
- Added TypeScript interfaces for type safety

#### Phase 4: File Organization
- Reorganized screens into logical folders (`main/`, `dynamic-steps/`)
- Created index files for clean imports
- Standardized file naming conventions (`.ts` vs `.tsx`)
- Added comprehensive documentation

#### Phase 5: Testing Implementation
- Set up Vitest with React Testing Library
- Created comprehensive test suite (80+ tests across 15+ files)
- Implemented proper mocking strategies for components and utilities
- Added test coverage for all critical paths
- Achieved 88%+ line coverage with targeted improvements
- Added tests for missing screen components (16 additional screens)
- Fixed critical lint errors and improved code quality
- Enhanced XML validator coverage from 53% to 80%+

#### Phase 6: Accessibility Implementation
- Added WCAG 2.1 AA compliance features
- Implemented skip navigation and focus management
- Created keyboard shortcuts for navigation
- Added ARIA landmarks and live regions
- Enhanced form accessibility with proper labeling

#### Phase 7: Documentation Enhancement
- Added comprehensive JSDoc documentation
- Created API documentation with examples
- Implemented accessibility testing and guidelines
- Enhanced existing documentation with new features

### 9. Key Architecture Decisions

**State Management:**
- Chose Zustand over Redux for simplicity
- Implemented persistent state with session storage
- Created centralized form data management

**Form Handling:**
- Used React Hook Form for performance
- Implemented Zod schemas for validation
- Created reusable form step patterns

**Code Organization:**
- Separated concerns (screens, hooks, utils, types)
- Implemented clean import patterns
- Used TypeScript for type safety

**UI/UX:**
- Responsive design with Tailwind CSS
- Consistent component patterns with Shadcn/ui
- Step-by-step wizard interface

**Testing:**
- Used Vitest for fast unit testing
- Implemented React Testing Library for component testing
- Created comprehensive mocking strategies
- Achieved 88%+ line coverage with 80+ tests across 15+ files
- Added missing screen component tests for complete coverage
- Fixed critical lint errors and improved code quality
- Enhanced utility function coverage (XML validator: 53% → 80%+)

**Accessibility:**
- WCAG 2.1 AA compliance with screen reader support
- Skip navigation and keyboard shortcuts
- ARIA landmarks and live regions
- Focus management and error announcements

**Documentation:**
- Comprehensive JSDoc API documentation
- Interactive HTML documentation with examples
- Accessibility testing guidelines
- Code standards and contribution guides

### 10. Final Project Structure
```
raven-app/
├── src/
│   ├── screens/
│   │   ├── main/           # Main workflow screens
│   │   ├── dynamic-steps/  # Dynamic step screens
│   │   └── __tests__/      # Screen component tests
│   ├── hooks/
│   │   ├── *.ts            # Custom React hooks
│   │   └── __tests__/      # Hook tests
│   ├── utils/
│   │   ├── *.ts            # Utility functions
│   │   └── __tests__/      # Utility tests
│   ├── test/               # Test setup and utilities
│   ├── types/              # TypeScript definitions
│   ├── components/ui/      # Reusable UI components
│   └── lib/                # Core libraries & stores
├── docs/                   # Comprehensive documentation
├── vitest.config.ts        # Test configuration
└── README.md              # This file
```

## 🛠️ Tech Stack

- **React 18** + **TypeScript** - Modern React with type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful, accessible components
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation
- **Zustand** - Simple state management
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities

## 🎯 Key Features

- ✨ **Step-by-step wizard** - Intuitive batch job configuration
- 🔄 **Dynamic flows** - Adapts based on job type selection
- ✅ **Real-time validation** - Catches errors before submission
- 💾 **Persistent state** - Never lose your progress
- 📱 **Responsive design** - Works on all devices
- 🎨 **Modern UI** - Clean, professional interface
- ♿ **Accessibility first** - WCAG 2.1 AA compliant with screen reader support
- ⌨️ **Keyboard navigation** - Full keyboard accessibility with shortcuts
- 📚 **Comprehensive docs** - JSDoc API documentation and guides
- 🧪 **Robust testing** - 80+ tests with 88%+ line coverage
- 🔍 **High code quality** - Zero lint errors, enhanced security, optimized performance

## 🤝 Contributing

Want to contribute? Check out our guides:
- [Development Guide](./docs/DEVELOPMENT.md) - Setup and best practices
- [Code Quality Guide](./docs/CODE-QUALITY.md) - Quality standards and metrics
- [JSDoc Standards](./docs/JSDOC.md) - Documentation requirements
- [Accessibility Guidelines](./docs/ACCESSIBILITY.md) - A11y compliance

## 📄 License

This project is open source and available under the [MIT License](LICENSE).