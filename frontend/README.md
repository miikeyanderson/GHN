# GHN Frontend

This is the frontend application for the Global Health Network (GHN) MVP. Built with React, TypeScript, and Vite, it provides a modern and responsive user interface for healthcare professionals.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend service running (see ../backend/README.md)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the values in `.env` with your configuration

### Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

Build for production:
```bash
npm run build
# or
yarn build
```

## 🏗️ Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Reusable UI components
├── pages/         # Route pages
├── store/         # Redux store configuration
│   ├── services/  # API services
│   └── slices/    # Redux slices
├── styles/        # Global styles
└── utils/         # Helper functions
```

## 🎨 Key Features

- **Modern Stack**: Built with React 18, TypeScript, and Vite
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS for responsive design
- **Authentication**: JWT-based auth with secure storage
- **API Integration**: Automated API integration with backend

## 🧪 Testing

Run tests:
```bash
npm run test
# or
yarn test
```

Run tests with coverage:
```bash
npm run test:coverage
# or
yarn test:coverage
```

## 📦 Building and Deployment

Build the application:
```bash
npm run build
# or
yarn build
```

Preview the production build:
```bash
npm run preview
# or
yarn preview
```

## 🔧 Configuration

### Environment Variables

- `VITE_API_URL`: Backend API URL
- `VITE_AUTH_TOKEN_KEY`: Local storage key for auth token
- `VITE_ENV`: Environment (development/production)

### ESLint Configuration

The project uses a strict TypeScript-aware ESLint configuration. Key features:

- TypeScript integration
- React-specific rules
- Strict type checking
- Code style enforcement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
