
# Decision Compass Backend

The backend of Decision Compass is engineered in Indore to provide a robust and secure foundation for complex decision-making. It primarily handles secure user authentication, ensuring that all decision data remains private and accessible only to authorized users.

## Features

- Secure user authentication
- Robust backend for decision-making workflows
- Privacy-focused: Only authorized access to decision data
- 100% JavaScript

## Getting Started

### Prerequisites

- Node.js (version X.X.X or higher)
- npm (Node package manager)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/hyper-27/dc-backend.git
    cd dc-backend
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Configure environment variables:**
    - Create a `.env` file in the root directory.
    - Add necessary configuration values as shown below.

4. **Start the server:**
    ```bash
    npm start
    ```

## Environment Variables

Create a `.env` file in your project root with values like:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/dc-backend
JWT_SECRET=your_jwt_secret
```

## Example API Routes

### User Authentication

**Register**  
`POST /api/auth/register`
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```
_Response:_
```json
{
  "message": "User registered successfully",
  "userId": "abc123"
}
```

**Login**  
`POST /api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```
_Response:_
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "abc123",
    "username": "john_doe"
  }
}
```

### Decision Data

**Get All Decisions (Authenticated)**  
`GET /api/decisions`  
_Headers:_  
`Authorization: Bearer <jwt_token>`

_Response:_
```json
[
  {
    "id": "decision1",
    "title": "Choose tech stack",
    "options": ["Node.js", "Python", "Go"],
    "createdBy": "abc123"
  }
]
```

**Create a New Decision**  
`POST /api/decisions`  
_Headers:_  
`Authorization: Bearer <jwt_token>`
```json
{
  "title": "Choose cloud provider",
  "options": ["AWS", "Azure", "GCP"]
}
```
_Response:_
```json
{
  "message": "Decision created",
  "decisionId": "decision2"
}
```

## Project Structure

```
dc-backend/
├── controllers/
│   ├── authController.js
│   └── decisionController.js
├── models/
│   ├── userModel.js
│   └── decisionModel.js
├── routes/
│   ├── authRoutes.js
│   └── decisionRoutes.js
├── middleware/
│   └── authMiddleware.js
├── app.js
├── server.js
├── .env.example
└── README.md
```

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements or bug fixes.

## License

[MIT](LICENSE)
```

---
