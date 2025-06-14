# FAQ

## FINAL PROJECT

## News Aggregation

### FREQUENTLY ASKED QUESTIONS

1. **Sign-up can be done by everyone?**  
   Yes, sign-up can be done by any user with a unique email ID and a valid password.

2. **What role should be given to a new user when signing up?**  
   On signing up, the default role of a user is a normal user.

3. **How to Create/Delete any external server?**  
   Creating or deleting the external servers feature is not included in the problem statement.  
   It will be impressive if any participant adds this feature.

4. **How to get the status of the external server? What is the functional role of the "active" and "inactive" status flags if the system marks the source as active each time the API call is successful and inactive when API call is failed?**  
   The status of the external server is either Active or Inactive only.

   - **Active**: If the external API response is successful with news articles in the server application, then the status should be marked as Active.
   - **Inactive**: If the external API fails to give a response, or the external API limit is reached for the day, then the status should be marked as Inactive.

5. **What is the server ID while updating external server details?**  
   The server ID is something like a primary key of the server record from the database.

6. **"Back to main menu" option is missing in certain places?**  
   Yes, this option was missed in a few places. The console menu included in the document is intended to provide a reference for how the application should be presented in the console interface.

7. **Should notifications that are already read also be visible in the "View Notification" option?**  
   Not needed. Once the notification is visible in View Notifications, it should be marked as read in the database.

8. **Keywords should show the saved keywords in the notification settings, not the "enabled" option.**  
   Yes, keywords should be displayed along with the enabled or disabled status.

9. **Explain point g in the server application.**  
   Yes, to determine the category of a news article, need to define a set of keywords for each category.  
   If any of these keywords are found in an article that doesn't have a category, the article should be categorized accordingly based on the matched keywords.

   - **What if the article does not match with the keywords assigned to the categories?**  
     In that case, such articles can be categorized under 'All' and displayed only when the user selects the 'All' option to view the headlines.

10. **Notification Mechanism: What is the expected method or channel through which notifications will be delivered to the user (e.g., email, in-app notification, push message)?**  
    Notifications must be sent via email and also displayed under the "Notifications" section within the console application.

11. **Article Storage Location: Where should the user be able to save or store an article after viewing or interacting with it? In a user-specific database record?**  
    It's not necessary to track whether a news article has been viewed by users.

12. **Displaying Multiple Articles: What is the required approach to display multiple articles (when the user chooses heading, search, or saved article option) in the console output? Should they appear in a table format?**  
    Show it as a table displaying ID and heading. Later the user can select ID and details of that news article will be displayed as shown in the document.

13. **Email Notifications for Multiple Articles per Keyword: In cases where multiple news articles are retrieved for a single keyword, should we compile them into a single email listing all articles, or send out individual emails for each article?**  
    It's okay to send them as individual emails, but it would be more impressive to send them as a combined email.

14. **Handling Data Gaps When API Fails: If the API fails and data from the last 3 hours is not stored in the database, then after another 3 hours (when it starts working again), should the system retrieve only the most recent 3 hours of data, or attempt to backfill the missing 6 hours of data?**  
    No, only the most recent data to be stored.

15. **Duplicate Articles from Multiple APIs: If the same news article is received from both APIs being used, what is the appropriate way to handle this duplication—should one be discarded, both be stored, or merged?**  
    This would be a corner case. It's acceptable if the data is stored as a duplicate, but it would be impressive if this scenario were proactively handled. Specifically, when the server application fetches news articles from external APIs at regular intervals, and if the same articles appear in the response, duplicates should not be stored in the database.

16. **Search Behavior and API Interaction: Should the system interact with the external API only during scheduled news fetching, and for search functionality, should it query only the local database?**  
    Yes, the server application should fetch news articles from external APIs at regular intervals, and all search operations should be performed on the data stored in the database.

17. **Will keywords go under category, or will they work independently to receive notifications?**
    The system allows users to receive notifications based on either a selected category or specific keywords within a category.

    **Examples:**

    - **Case 1:** User selects the **"Sports"** category  
       → The user will receive notifications for all news related to the Sports category.

    - **Case 2:** User adds the keyword **"Virat Kohli"** under the Sports category  
       → The user will receive notifications only for news about Virat Kohli within the Sports category.

    - **Case 3:** User adds the keyword **"Tata Motor Share"** under the Sports category  
       → No notifications will be sent, as "Tata Motor Share" does not relate to any news in the Sports category.

18. **Can we develop a web app for the client?**  
    Yes, we are allowed to create a web app for the client side. We will use ReactJS.
