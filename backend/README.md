# GHN Backend

This is the backend service for the Global HealthOps Nexus (GHN) MVP application. Built with FastAPI, it provides a modern, fast, and secure API with automatic OpenAPI documentation.

## 🚀 Getting Started

### Prerequisites

- Python 3.11+ (recommended)
- Python virtual environment
- SQLite (development) or PostgreSQL (production)

### Installation

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the values in `.env` with your configuration

### Running the Application

Development mode:
```bash
python run.py
```

Production mode:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Once running, visit:
- API Documentation: http://localhost:8000/docs
- Alternative Documentation: http://localhost:8000/redoc

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── core/        # Core functionality (config, security, database)
│   ├── models/      # Database models and Pydantic schemas
│   └── routes/      # API endpoints
├── logs/           # Application logs
├── migrations/     # Database migrations
├── tests/         # Test suite
├── main.py        # FastAPI application instance
└── run.py         # Application runner
```

## 🔑 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 📚 API Documentation

The API documentation is automatically generated and available through Swagger UI and ReDoc:

### Authentication Endpoints

- `POST /api/v1/auth/login` - Authenticate user and get JWT token
- `POST /api/v1/auth/register` - Register a new user

### Health Check Endpoint

- `GET /api/v1/health/check` - Check API health status

For detailed API documentation with request/response examples, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🧪 Testing

Run tests with:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=app tests/ --cov-report=html
```

## 🔍 Error Tracking

The application uses Sentry for error tracking and performance monitoring. To enable Sentry:

1. Get a Sentry DSN from https://sentry.io
2. Add your DSN to the `.env` file:
```
SENTRY_DSN=your-sentry-dsn
```

## 📦 Deployment

The application is configured for deployment on major cloud platforms. See our [Deployment Guide](./DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
