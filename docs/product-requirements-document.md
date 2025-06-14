# 📋 **News Aggregation System - PRD**

## 🎯 **Product Overview**

A news aggregation system consisting of server and client applications. The server fetches news from external APIs, processes and stores articles, and provides data through REST APIs. The client enables users to browse, search, save articles, and receive email notifications for news matching their interests.

---

## 👥 **User Roles**

1. **User**
   - Register/login to the system
   - Browse and search news articles
   - Save articles for later viewing
   - Like/dislike news articles
   - Configure notification preferences
2. **Admin**
   - Manage external news API servers
   - View server status (Active/Inactive)
   - Add and manage news categories
   - Access/Manage all user (optional)

---

## 🚀 **Core Features**

### **Authentication**

- User registration with username, email (UNIQUE), and password
- Email format validation (no verification links required)
- Secure password storage (HASHING)
- Role-based access control (Admin/User)

### **News Management**

- Fetch news every 3-4 hours from multiple sources (NewsAPI, The News API) - (DONE BY CRON JOB)
- Process and categorize articles
- Remove duplicate articles
- Store in database for client access

### **User Features**

- Browse headlines by date range and category
- Filter by categories: All, Business, Entertainment, Sports, Tech
- Save/unsave articles for later viewing
- User can Like/Dislike articles
- Search articles with date filters and sort articles based on likes/dislikes
- Configure category and keyword-based notification preferences with hierarchical structure:
  - **Category-based notifications**: Receive all news for selected categories
  - **Keyword-based notifications**: Receive specific news matching keywords within selected categories
  - **Keyword scope**: Keywords work within category context, not independently

### **Admin Features**

- View external API server status
- Edit external server details
- Add news categories
- User management

### **Notification**

- **Email Delivery**: Send notifications via email for news articles matching user's categories or configured keywords
- **In-App Notifications**: Display notifications in the client application's "Notifications" section
- **Hierarchical Keyword System**:
  - Keywords are scoped within specific categories
  - Users can subscribe to entire categories OR specific keywords within categories
  - Keywords outside their associated category scope will not trigger notifications
- **Category Subscription**: Enable subscription to specific news categories for all related news
- **Notification Management**: View and manage notification history in the client application
- **Read Status**: Automatically mark notifications as read once viewed by the user
- **Combined Emails**: Group multiple matching articles into a single email notification when possible
- **Notification Frequency**: Send notifications based on the periodic news fetching schedule
- **Customizable Preferences**: Enable/disable notifications for specific keywords or categories
- **Email Format**: Include article headlines, brief summaries, and links in notification emails

---

## ⚙️ **Technical Requirements**

### **Server Application**

- REST API endpoints for client-server communication
- Database storage for users, articles, and preferences
- Periodic news fetching from external APIs
- Email notification system
- Auto-categorization for uncategorized articles
  - Setup Gemeni API client for text classification (Ollama optional)
  - Process article content to assign appropriate categories
  - Use pre-trained models for efficient categorization

### **Client Application**

- **Web-based ReactJS interface** with role-specific components. (no additional CSS frameworks)
- Authentication and session management
- Article browsing and search functionality
- Notification preferences management with category-keyword hierarchy
- Responsive design using existing CSS styles

### **External APIs**

- NewsAPI (headlines endpoint)
- The News API (top news endpoint)
- Firebase API (for testing)

---

## 💾 **Data Management**

- **Articles**: Store title, content, source, publication date, category
- **Users**: Username, email, password (hashed), role, saved articles
- **External Servers**: Server details, status (Active/Inactive)
- **Notifications**: User preferences, delivery status

---

## 🔄 **User Flows**

### **Login Flow**

```
1. User launches client application
2. Options: Login / Register / Exit
3. If Register:
   - Enter username, email, password
   - System validates email format and uniqueness
   - Account created with User role
4. If Login:
   - Enter credentials
   - System validates and grants access
   - Display appropriate menu based on role
```

### **User Menu Flow**

```
1. Headlines
   - View today's headlines or by date range
   - Filter by category
   - Option to save articles by ID
2. Saved Articles
   - View saved articles
   - Delete saved articles
3. Search
   - Search with date filters
   - Sort by relevance
4. Notifications
   - Configure keyword preferences
   - View notification history
5. Logout
```

### **Admin Menu Flow**

```
1. View external servers and status
2. View/edit external server details
3. Add news categories
4. Logout
```

---

## 📝 **Implementation Notes**

- Email notifications should be sent for articles matching user keywords
- System should mark notifications as read once viewed
- External server status updates based on API response success/failure
- Search queries should be performed on the local database
- Duplicate articles from multiple APIs should be handled appropriately
- System only retrieves most recent data, no backfilling of missed intervals
- LLM integration for auto-categorization:
  - Use gemeni to find article catogory (ollama optional)
  - Implement api to get catogory for an article

---

## ✅ **Quality Requirements**

- RESTful API design
- SOLID principles implementation
- Unit and system test cases
- Layered architecture
- API documentation
- Clean, maintainable code
