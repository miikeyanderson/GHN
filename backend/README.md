# GHN Backend

This is the backend service for the GHN (Global Health Network) MVP application. It provides the API endpoints and business logic for the application.

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL
- Python virtual environment (recommended)

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

4. Initialize the database:
```bash
flask db upgrade
```

### Running the Application

Development mode:
```bash
flask run
```

Production mode:
```bash
gunicorn app:app
```

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── models/      # Database models
│   ├── routes/      # API endpoints
│   ├── services/    # Business logic
│   └── utils/       # Helper functions
├── migrations/      # Database migrations
├── tests/          # Test suite
└── config.py       # Application configuration
```

## 🔑 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`

### Health Endpoints

- `GET /api/health/check`
- `POST /api/health/records`
- `GET /api/health/records/:id`

For detailed API documentation, see our [API Documentation](./API.md).

## 🧪 Testing

Run tests with:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=app tests/
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
