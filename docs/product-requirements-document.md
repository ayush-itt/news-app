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
- **Article Reporting**:
  - Report articles with custom reasons
  - Users can provide detailed explanations for reports
  - Cannot report the same article multiple times
- **Personalized Content & Analytics**:
  - Advanced reading history tracking with detailed analytics
  - Personalized article recommendations based on behavior patterns
  - Reading statistics including completion rates and time spent
  - Cross-platform reading synchronization
  - Privacy-compliant data management with GDPR deletion options
  - Real-time recommendation engine based on multiple factors:
    - Reading history and patterns
    - User preferences and subscriptions
    - Article likes and bookmarks
    - Category engagement metrics

### **Admin Features**

- View external API server status
- Edit external server details
- Add news categories
- User management
- **Article Content Moderation**:
  - Hide/show individual articles from public view
  - View all articles (including hidden ones)
  - Manage reported articles
- **Report Management**:
  - Receive notifications when articles are reported
  - Review and take action on reported articles
  - Auto-hide articles when reports exceed threshold (5 reports)
- **Category Management**:
  - Activate/deactivate entire categories
  - Hidden categories prevent articles from being shown to users
- **Keyword Filtering**:
  - Manage banned keywords with advanced filtering options
  - Support for case-sensitive and regex pattern matching
  - Articles containing banned keywords are rejected during import
  - Comprehensive admin interface for keyword management
  - Toggle active/inactive status without deletion
  - Manage list of banned keywords

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

---

## 🧩 **Advanced Features & Complexities**

### **Complexity 1: Admin Controls**

#### **Report Feature**

- Users can flag/report news articles with custom reasons
- Admin receives notifications when articles are reported
- Admin can manually hide reported articles from public view
- Auto-hide feature: Articles are automatically hidden when reports exceed threshold (5 reports)
- Duplicate prevention: Users cannot report the same article multiple times

#### **Category Management**

- Admins can activate/deactivate entire categories
- Inactive categories hide all associated articles from users
- Admin retains access to view articles from inactive categories

#### **Keyword Filtering**

- Admins can add banned keywords to filter content
- Articles containing banned keywords are automatically hidden from users
- Comprehensive keyword management interface for admins

### **Complexity 2: User Personalization**

#### **Personalized Recommendations**

News articles are personalized and recommended based on:

- **Configured notification settings**: Category and keyword preferences
- **Keywords added for notifications**: User-defined interest keywords
- **Articles the user has liked**: Positive interaction history
- **Articles the user has saved**: Bookmark behavior analysis
- **History of articles the user has read**: Reading pattern tracking

#### **Objective**

Ensure users receive more relevant and engaging content tailored to their behavior and preferences through advanced recommendation algorithms.
