# ShopSense AI

ShopSense AI is a full-stack AI-powered e-commerce project. It has a Spring Boot backend, a React TypeScript frontend, PostgreSQL database storage, JWT authentication, admin product management, cart/order/payment flow, and AI features such as semantic search, shopping assistant, recommendations, and review sentiment analysis.

This README is written so that you can understand what the project does, how it is structured, and how to run it locally.

## Features

- User registration and login with JWT authentication
- Product listing with search, category filtering, product details, and ratings
- Cart flow: add item, update quantity, remove item
- Order flow with mock payment
- User dashboard and order history
- AI semantic product search
- AI shopping assistant using Gemini
- AI product recommendations
- AI review sentiment analysis and moderation
- Admin panel for products, inventory, reviews, and analytics
- Admin analytics charts for category value, stock health, product mix, and review signals
- PostgreSQL database persistence

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- Zustand
- React Hook Form
- Zod
- Lucide React

### Backend

- Java 21
- Spring Boot 4
- Spring Web MVC
- Spring Security
- Spring Data JPA
- Hibernate
- PostgreSQL
- JWT authentication
- Springdoc OpenAPI / Swagger

### AI

- Gemini API for text generation, shopping assistant, and review sentiment analysis
- Hugging Face Inference API with `sentence-transformers/all-MiniLM-L6-v2` for embeddings
- Semantic search using stored product embeddings

### Database

- PostgreSQL
- Docker Compose is used to run PostgreSQL locally

## Project Structure

```text
ShopSense/
├── backend/
│   ├── src/main/java/shopsense/
│   │   ├── ai/                 # Gemini, Hugging Face embeddings, semantic search
│   │   ├── auth/               # Login, register, current user
│   │   ├── cart/               # Cart and cart items
│   │   ├── category/           # Product categories
│   │   ├── config/             # Data seeding and OpenAPI config
│   │   ├── inventory/          # Stock management
│   │   ├── order/              # Orders and mock payment
│   │   ├── product/            # Product APIs and admin product flow
│   │   ├── recommendation/     # Personalized and popular recommendations
│   │   ├── review/             # Reviews and AI moderation
│   │   ├── security/           # JWT security setup
│   │   └── user/               # User entity and roles
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── docker-compose.yml
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios client and API service functions
│   │   ├── assets/             # Product images
│   │   ├── components/         # Common UI, product cards, AI chat
│   │   ├── layouts/            # Main page layout
│   │   ├── pages/              # Home, Products, Admin, Cart, Login, etc.
│   │   ├── routes/             # App routes
│   │   ├── store/              # Zustand stores
│   │   ├── types/              # TypeScript API types
│   │   └── utils/              # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## How the Project Works

1. The frontend runs on Vite and shows the ShopSense UI.
2. The frontend calls backend APIs using Axios.
3. The backend exposes REST APIs under `/api`.
4. Users can register or login.
5. After login, the backend returns a JWT token.
6. The frontend stores the token and sends it in future API requests.
7. Products, users, carts, orders, inventory, reviews, and embeddings are stored in PostgreSQL.
8. Admin can add products and update inventory.
9. When a product is added or updated, the backend generates embeddings for AI semantic search.
10. Gemini is used for AI assistant and review sentiment analysis.
11. Hugging Face embeddings are used for semantic search.

## Prerequisites

Install these before running the project:

- Java 21
- Node.js and npm
- Docker Desktop
- Git
- Gemini API key
- Hugging Face read token

## Local Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ShopSense
```

### 2. Start PostgreSQL

```bash
cd backend
docker compose up -d
```

This starts PostgreSQL on port `5433`.

Database details used locally:

```text
Database: shopsense_db
Username: shopsense_user
Password: shopsense_pass
Port: 5433
```

### 3. Create Backend Local Config

Create this file:

```text
backend/application-local.properties
```

Add your local secrets:

```properties
SHOPSENSE_ADMIN_EMAIL=admin@example.com
SHOPSENSE_ADMIN_PASSWORD=yourStrongPassword
SHOPSENSE_ADMIN_NAME=Admin

GEMINI_API_KEY=your_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_read_token
```

Important: do not push `application-local.properties` to GitHub. It contains private credentials.

### 4. Start the Backend

From the `backend` folder:

```bash
./mvnw spring-boot:run
```

Backend will run at:

```text
http://localhost:8080
```

Swagger/OpenAPI documentation:

```text
http://localhost:8080/swagger-ui/index.html
```

To stop the backend, press:

```text
Ctrl + C
```

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

The frontend uses this backend URL by default:

```text
http://localhost:8080/api
```

If you want to change it, create:

```text
frontend/.env
```

Then add:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Admin Login

Admin credentials come from:

```text
backend/application-local.properties
```

If you change admin email or password, restart the backend.

```bash
cd backend
./mvnw spring-boot:run
```

If the old admin credentials still work, it means that user already exists in the database. You can either:

- keep the same admin email and change only the password, then restart backend
- create a new admin email in local properties
- update or remove old admin data directly from PostgreSQL

## Main API Modules

The backend has these main modules:

- `/api/auth` - register, login, current user
- `/api/products` - product listing, product details, similar products
- `/api/categories` - product categories
- `/api/cart` - cart operations
- `/api/orders` - order placement and mock payment
- `/api/recommendations` - popular and personalized recommendations
- `/api/ai` - AI assistant, semantic search, embedding generation
- `/api/admin` - admin products, inventory, review moderation

## AI Features Explained

### Semantic Search

Normal search matches keywords. Semantic search understands meaning.

Example:

```text
lightweight laptop for travel
```

It can find laptop-related products even if the exact words are not present in the product name.

### AI Assistant

The shopping assistant uses Gemini to answer shopping questions and suggest relevant products.

Example:

```text
Suggest a budget smartwatch for fitness tracking
```

### Recommendations

Recommendations are based on product popularity, user activity, similar products, and product data.

### Sentiment Analysis

When a user writes a review, Gemini analyzes the review and marks it as:

- POSITIVE
- NEUTRAL
- NEGATIVE
- TOXIC
- SPAM

Admin can approve or reject pending reviews.

## Admin Features

Admin can:

- add new products
- edit products
- soft delete products from storefront
- update inventory
- generate AI embeddings
- moderate reviews
- view analytics charts

When admin adds a new product:

1. Product is saved in PostgreSQL.
2. Inventory is created or updated.
3. Embedding is generated for semantic search.
4. Product becomes available in storefront.
5. Cart, order, recommendation, assistant, and search features can work with it.

## Build Commands

### Frontend Build

```bash
cd frontend
npm run build
```

### Backend Build

```bash
cd backend
./mvnw clean package
```

## Environment Variables for Deployment

For deployment, do not use local secret files. Set environment variables in your hosting platform:

```text
SHOPSENSE_ADMIN_EMAIL
SHOPSENSE_ADMIN_PASSWORD
SHOPSENSE_ADMIN_NAME
GEMINI_API_KEY
HUGGINGFACE_API_KEY
```

For frontend deployment:

```text
VITE_API_BASE_URL
```

Example:

```text
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## Security Notes

- Never commit API keys.
- Never commit `application-local.properties`.
- Use strong admin passwords.
- Change the JWT secret before production.
- Use environment variables for production secrets.
- Use HTTPS in production.

## Common Problems and Fixes

### Backend says port 8080 is already in use

Stop the old backend process:

```bash
lsof -i :8080
kill -9 <PID>
```

### New admin credentials are invalid

Restart the backend after changing:

```text
backend/application-local.properties
```

### Frontend cannot reach backend

Make sure backend is running:

```text
http://localhost:8080
```

Also check:

```text
frontend/.env
```

### AI features are not working

Check that these keys are present:

```text
GEMINI_API_KEY
HUGGINGFACE_API_KEY
```

Then restart backend.

### Semantic search does not find new products

Go to Admin panel and click:

```text
Generate AI Embeddings
```

## Resume Project Title

You can add this project to your resume as:

```text
ShopSense AI - Full Stack AI-Powered E-Commerce Platform
```

Resume description:

```text
Built a full-stack AI-powered e-commerce platform using React, TypeScript, Spring Boot, PostgreSQL, JWT authentication, Gemini API, and Hugging Face embeddings. Implemented product search, semantic search, AI shopping assistant, recommendations, cart/order flow, mock payment, review sentiment analysis, admin inventory management, review moderation, and analytics dashboard.
```

## Author

Built by Aman Jaiswal.
