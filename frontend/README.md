# Kleio.ai - AI-Powered Household Management

An intelligent household inventory management system designed specifically for Indian families. Manage your inventory, plan meals, track usage patterns, and get AI-powered suggestions tailored to your household needs.

## Features

- **Smart Inventory Management**: Track household items with expiry dates and quantity monitoring
- **AI-Powered Predictions**: Get usage pattern insights and shopping recommendations
- **Receipt Scanning**: Automatically extract items from receipts using OCR
- **Recipe Generation**: Generate recipes based on available ingredients
- **Pattern Insights**: Track consumption patterns and predict when items will run out
- **Multi-language Support**: Available in Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, and Marathi

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: Firebase Auth
- **State Management**: TanStack Query (React Query)

## Getting Started

### Prerequisites

- Node.js (v18 or higher) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or yarn

### Installation

```sh
# Step 1: Clone the repository
git clone https://github.com/mrnithesh/Kleio.ai.git

# Step 2: Navigate to the project directory
cd kleio/frontend

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── lib/            # Utility functions and API client
│   ├── hooks/          # Custom React hooks
│   └── assets/         # Static assets
├── public/             # Public assets (logo, favicon)
└── index.html          # HTML entry point
```

## Development

### Working with the Codebase

You can edit files using:
- Your preferred IDE (VS Code, WebStorm, etc.)
- GitHub's web editor
- GitHub Codespaces

Changes will be reflected immediately in the development server.

## Deployment

Build the project for production:

```sh
npm run build
```

The `dist` folder will contain the production-ready files that can be deployed to any static hosting service.

## Contributing

This project is maintained by Nithesh. For contributions, please reach out through GitHub.

