# 📰 News Aggregation - Final Project

## 📌 Description

The News Aggregation project consists of a **Server** and a **Client** application:

- **Server**:

  - Fetches news from various APIs (JSON format).
  - Processes and stores data in a database.
  - Provides news via REST API to the client.
  - Handles user management and authentication.
  - Sends news articles to users via email.

- **Client**:

  - Allows login (Admin/User).
  - Users can browse, search, and save articles.
  - Supports keyword-based notification preferences.

---

## 👥 User Roles

1. **Admin**
2. **User**

---

## ⚙️ Applications

### 🔧 Server Application

- Periodically fetches news (every 3–4 hours).
- Exposes REST APIs for the client.
- Manages DB connections and queries.
- Authenticates users.
- Handles saving and retrieving user/news data.
- Sends email notifications.
- Auto-categorizes uncategorized news based on content.

### 💻 Client Application

- **ReactJS web application**
- Handles user login (Admin/User) with web interface
- Allows user registration:
  - Username
  - Email (must be validated)
  - Password
- Checks if a user already exists
- Displays different components based on role
- Users can configure:
  - **Category-based notifications**: Subscribe to entire categories
  - **Keyword-based notifications**: Add keywords within specific categories
  - **Hierarchical preference system**: Keywords work within category scope

---

## 🔄 Application Flow

### 🔐 Login Flow

1. Enter username and password.
2. Option to sign up with validation.
3. Exit option.

### 🛠️ Admin Menu

1. View external servers and status.
2. View external server details.
3. Edit external server.
4. Add news categories.
5. Logout

### 👤 User Menu (Web Interface)

1. **Headlines**

   - View today's headlines or by date range
   - Filter: All, Business, Entertainment, Sports, Tech

2. **Saved Articles**

   - Save/Delete articles by ID

3. **Search**

   - Filter by date range
   - Sort by likes/dislikes

4. **Notifications**

   - View or configure with hierarchical system:
     - **Category subscriptions**: Receive all news for selected categories
     - **Keyword subscriptions**: Receive news matching keywords within specific categories
     - **Example**: "Virat Kohli" keyword under Sports category will only match sports-related news
   - Email notifications for matching articles

5. **Logout**

---

## ✅ Functional Requirements

1. RESTful APIs for external data fetching.
2. REST API communication between server and client (GET, POST, PUT, DELETE).
3. Database (Relational/NoSQL – justify choice).
4. Multi-threading.
5. SOLID principles.
6. Unit & System test cases.
7. Layered architecture.
8. API documentation.
9. Clean code.

---

## 🌐 **Frontend Technology**

- **ReactJS** for component-based web application
- **No additional CSS frameworks** (no Tailwind, Bootstrap, etc.)
- **Responsive design** using current CSS styles
- **Component structure** for role-based UI rendering

---

## 🔧 **Backend Technology**

- **NestJS** for scalable server-side application framework
- **TypeORM** for Object-Relational Mapping and database operations
- **PostgreSQL** as the primary relational database
- **JWT Authentication** for secure user sessions
- **RESTful API architecture** following OpenAPI specifications
- **Modular architecture** with dependency injection
- **Scheduled tasks** for periodic news fetching
- **Email service integration** for notifications

---

## 🌐 External APIs

### 1. **NewsAPI**

- [https://newsapi.org/](https://newsapi.org/)
- **GET** `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=<API_KEY>`

### 2. **The News API**

- [https://www.thenewsapi.com/documentation](https://www.thenewsapi.com/documentation)
- **GET** `https://api.thenewsapi.com/v1/news/top?api_token=<API_KEY>&locale=us&limit=3`

### 3. **Firebase API (Test Data)**

- **GET** `https://us-central1-symbolic-gift-98004.cloudfunctions.net/newsapi?country=us&category=business`
