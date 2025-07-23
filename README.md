# News Aggregation System

A comprehensive news aggregation system that fetches, processes, and delivers news articles from various external APIs to users based on their preferences, with advanced content moderation and personalization features.

## Overview

This project consists of two main components with advanced features:

1. **Server Application**

   - Fetches news from external APIs (NewsAPI, The News API)
   - Processes and stores articles in a database
   - Provides REST APIs for client communication
   - Sends email notifications to users based on their preferences
   - Auto-categorizes uncategorized news articles
   - **Content Moderation**: Article reporting, admin controls, banned keywords
   - **Personalization**: AI-driven recommendations based on user behavior

2. **Client Application**
   - Web based interface with role-specific menus
   - Supports user authentication and registration
   - Allows browsing, searching, and saving articles
   - Provides notification preference management
   - **User Features**: Article reporting, personalized feeds
   - **Admin Features**: Content moderation dashboard, keyword management

## 🧩 **Advanced Features**

### **Complexity 1: Admin Controls**

- **Report System**: Users can flag inappropriate content
- **Auto-Moderation**: Articles auto-hide when reports exceed threshold
- **Category Management**: Admin can activate/deactivate categories
- **Keyword Filtering**: Banned keywords automatically filter content

### **Complexity 2: User Personalization**

- **Smart Recommendations**: AI-powered content suggestions
- **Behavior Tracking**: Reading history, likes, bookmarks analysis
- **Personalized Feeds**: Content tailored to individual preferences
- **Engagement Analytics**: User behavior insights and metrics

## 📚 **Documentation**

- **[Product Requirements Document](docs/product-requirements-document.md)** - Complete feature specifications
- **[FAQ](docs/frequently-asked-questions.md)** - Common questions and answers
