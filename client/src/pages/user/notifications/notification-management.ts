import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { ApiService } from "../../../services/api.service";
import { NotificationService } from "../../../services/notification.service";
import { Notification, NotificationQueryDto } from "../../../interfaces";

export class NotificationManagement {
  private notificationService: NotificationService;

  constructor() {
    const apiService = ApiService.getInstance();
    this.notificationService = new NotificationService(apiService);
  }

  async show(): Promise<void> {
    try {
      while (true) {
        const choice = await this.showMenu();

        switch (choice) {
          case "view_all":
            await this.viewAllNotifications();
            break;
          case "view_unread":
            await this.viewUnreadNotifications();
            break;
          case "unread_count":
            await this.showUnreadCount();
            break;
          case "mark_all_read":
            await this.markAllAsRead();
            break;
          case "mark_single_read":
            await this.markSingleAsRead();
            break;
          case "test_email":
            await this.sendTestEmail();
            break;
          case "back":
            return;
        }

        // Wait for user input before showing menu again
        await inquirer.prompt([
          {
            type: "input",
            name: "continue",
            message: "Press Enter to continue...",
          },
        ]);
      }
    } catch (error) {
      ConsoleUI.error(
        `Error in notifications management: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async showMenu(): Promise<string> {
    // First, quickly get unread count for the menu
    let unreadCount = 0;
    try {
      const count = await this.notificationService.getUnreadCount();
      unreadCount = count.count;
    } catch (error) {
      // If error getting count, just continue without showing it
    }

    const unreadIndicator = unreadCount > 0 ? ` (${unreadCount} unread)` : "";

    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: `Notifications Management${unreadIndicator}:`,
        choices: [
          { name: "📬 View All Notifications", value: "view_all" },
          { name: "📭 View Unread Notifications Only", value: "view_unread" },
          { name: "🔢 Show Unread Count", value: "unread_count" },
          { name: "✅ Mark All as Read", value: "mark_all_read" },
          {
            name: "📖 Mark Single Notification as Read",
            value: "mark_single_read",
          },
          { name: "📧 Send Test Email", value: "test_email" },
          { name: "← Back to Main Menu", value: "back" },
        ],
      },
    ]);
    return choice;
  }

  private async viewAllNotifications(): Promise<void> {
    try {
      ConsoleUI.info("Loading all notifications...");
      const response = await this.notificationService.getNotifications({
        limit: 20,
      });

      this.displayNotifications(response, "All Notifications");
    } catch (error) {
      ConsoleUI.error(
        `Failed to load notifications: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async viewUnreadNotifications(): Promise<void> {
    try {
      ConsoleUI.info("Loading unread notifications...");
      const response = await this.notificationService.getNotifications({
        isRead: false,
        limit: 20,
      });

      this.displayNotifications(response, "Unread Notifications");
    } catch (error) {
      ConsoleUI.error(
        `Failed to load unread notifications: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private displayNotifications(response: any, title: string): void {
    const notifications = response.notifications || response;

    if (notifications.length === 0) {
      ConsoleUI.warning("No notifications found.");
      return;
    }

    ConsoleUI.title(title);

    notifications.forEach((notification: Notification, index: number) => {
      const status = notification.isRead ? "📖 Read" : "📩 Unread";
      const readAt = notification.readAt
        ? new Date(notification.readAt).toLocaleString()
        : "Not read";

      ConsoleUI.info(`\n${index + 1}. Notification #${notification.id}`);
      console.log(`   Status: ${status}`);
      console.log(`   Type: ${notification.type || "Unknown"}`);
      console.log(`   Message: ${notification.message || "No message"}`);

      if (notification.article) {
        console.log(`   📰 Article: "${notification.article.title}"`);
        console.log(`   📎 URL: ${notification.article.url}`);
      }

      if (notification.category) {
        console.log(`   📂 Category: ${notification.category.name}`);
      }

      if (notification.keyword) {
        console.log(`   🔑 Keyword: ${notification.keyword.name}`);
      }

      console.log(
        `   📅 Created: ${new Date(notification.createdAt).toLocaleString()}`
      );
      console.log(`   👁️ Read At: ${readAt}`);

      if (index < notifications.length - 1) {
        console.log("   " + "─".repeat(40));
      }
    });

    // Display summary
    if (response.total !== undefined) {
      ConsoleUI.success(
        `\nShowing ${notifications.length} of ${response.total} notifications`
      );
      ConsoleUI.info(`Unread notifications: ${response.unreadCount || 0}`);

      if (response.totalPages > 1) {
        ConsoleUI.info(`Page ${response.page} of ${response.totalPages}`);
      }
    } else {
      ConsoleUI.success(`\nTotal: ${notifications.length} notifications`);
    }
  }

  private async showUnreadCount(): Promise<void> {
    try {
      ConsoleUI.info("Getting unread count...");
      const response = await this.notificationService.getUnreadCount();

      ConsoleUI.title("Unread Notifications Count");

      if (response.count === 0) {
        ConsoleUI.success("🎉 You have no unread notifications!");
      } else if (response.count === 1) {
        ConsoleUI.info("📩 You have 1 unread notification.");
      } else {
        ConsoleUI.warning(
          `📩 You have ${response.count} unread notifications.`
        );
      }
    } catch (error) {
      ConsoleUI.error(
        `Failed to get unread count: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async markAllAsRead(): Promise<void> {
    try {
      // First check if there are any unread notifications
      const countResponse = await this.notificationService.getUnreadCount();

      if (countResponse.count === 0) {
        ConsoleUI.success("All notifications are already read!");
        return;
      }

      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Mark all ${countResponse.count} unread notifications as read?`,
          default: false,
        },
      ]);

      if (!confirm) {
        ConsoleUI.info("Operation cancelled.");
        return;
      }

      ConsoleUI.info("Marking all notifications as read...");
      const response = await this.notificationService.markAllAsRead();

      ConsoleUI.success(
        `✅ Successfully marked ${response.count} notifications as read!`
      );
    } catch (error) {
      ConsoleUI.error(
        `Failed to mark all as read: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async markSingleAsRead(): Promise<void> {
    try {
      // First show unread notifications so user can see IDs
      ConsoleUI.info("Loading unread notifications...");
      const response = await this.notificationService.getNotifications({
        isRead: false,
        limit: 10,
      });

      if (response.notifications.length === 0) {
        ConsoleUI.success("All notifications are already read!");
        return;
      }

      ConsoleUI.title("Unread Notifications");
      response.notifications.forEach(
        (notification: Notification, index: number) => {
          const shortMessage =
            notification.message?.substring(0, 50) +
            (notification.message && notification.message.length > 50
              ? "..."
              : "");
          console.log(`${index + 1}. [ID: ${notification.id}] ${shortMessage}`);
        }
      );

      const { notificationId } = await inquirer.prompt([
        {
          type: "input",
          name: "notificationId",
          message: "Enter notification ID to mark as read:",
          validate: (input) => {
            const id = parseInt(input);
            if (isNaN(id) || id <= 0) {
              return "Please enter a valid positive number";
            }
            const notification = response.notifications.find(
              (n) => n.id === id
            );
            if (!notification) {
              return "Notification with this ID not found in unread list";
            }
            return true;
          },
        },
      ]);

      ConsoleUI.info("Marking notification as read...");
      const updatedNotification = await this.notificationService.markAsRead(
        parseInt(notificationId)
      );

      ConsoleUI.success("✅ Notification marked as read successfully!");
      ConsoleUI.info(
        `Read at: ${new Date(
          updatedNotification.readAt || new Date()
        ).toLocaleString()}`
      );
    } catch (error) {
      ConsoleUI.error(
        `Failed to mark notification as read: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async sendTestEmail(): Promise<void> {
    try {
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "Send a test email notification to your email address?",
          default: false,
        },
      ]);

      if (!confirm) {
        ConsoleUI.info("Test email cancelled.");
        return;
      }

      ConsoleUI.info("Sending test email...");
      const response = await this.notificationService.sendTestEmail();

      if (response.success) {
        ConsoleUI.success("✅ Test email sent successfully!");
        ConsoleUI.info("Check your email inbox for the test notification.");
      } else {
        ConsoleUI.error("❌ Failed to send test email.");
        ConsoleUI.info(response.message);
      }
    } catch (error) {
      ConsoleUI.error(
        `Failed to send test email: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
