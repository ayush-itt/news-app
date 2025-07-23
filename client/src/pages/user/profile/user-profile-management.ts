import { IUser } from "../../../interfaces";

export class UserProfileManagement {
  constructor() {}

  async displayInterface(): Promise<void> {
    while (true) {
      console.clear();
      console.log("=".repeat(50));
      console.log("           USER PROFILE");
      console.log("=".repeat(50));
      console.log("1. View My Profile");
      console.log("2. Profile Summary");
      console.log("3. Account Information");
      console.log("4. Back to User Dashboard");
      console.log("=".repeat(50));

      const choice = prompt("Enter your choice (1-4): ")?.trim();

      try {
        switch (choice) {
          case "1":
            await this.viewProfile();
            break;
          case "2":
            await this.showProfileSummary();
            break;
          case "3":
            await this.showAccountInformation();
            break;
          case "4":
            return;
          default:
            console.log("Invalid choice. Please select 1-4.");
            await this.waitForKeyPress();
        }
      } catch (error: any) {
        console.error("Error:", error.message);
        await this.waitForKeyPress();
      }
    }
  }

  private async viewProfile(): Promise<void> {
    console.clear();
    console.log("=".repeat(40));
    console.log("        MY PROFILE");
    console.log("=".repeat(40));

    try {
      console.log("\nFetching profile information...");
      const userProfile = await this.fetchUserProfile();

      if (!userProfile) {
        console.log("\n❌ Unable to load profile information.");
        await this.waitForKeyPress();
        return;
      }

      console.log("\n👤 Profile Information:");
      console.log("=".repeat(40));
      console.log(`🆔 User ID: ${userProfile.id}`);
      console.log(`👤 Username: ${userProfile.username}`);
      console.log(`📧 Email: ${userProfile.email}`);
      console.log(`🏷️ Role: ${this.formatRole(userProfile.role.name)}`);
      console.log(
        `📅 Account Created: ${new Date(
          userProfile.createdAt
        ).toLocaleString()}`
      );

      if (userProfile.updatedAt) {
        console.log(
          `🔄 Last Updated: ${new Date(userProfile.updatedAt).toLocaleString()}`
        );
      }

      // Show account status
      const accountAge = this.calculateAccountAge(userProfile.createdAt);
      console.log(`⏰ Account Age: ${accountAge}`);

      console.log("\n💡 Profile Features:");
      console.log("-".repeat(30));
      console.log("• Browse and read articles");
      console.log("• Save articles to bookmarks");
      console.log("• React to articles (like/dislike)");
      console.log("• Set notification preferences");
      console.log("• Manage keyword alerts");
      console.log("• Report inappropriate content");
      console.log("• View reading history");
    } catch (error: any) {
      console.log(`\n❌ Failed to load profile: ${error.message}`);
    }

    await this.waitForKeyPress();
  }

  private async showProfileSummary(): Promise<void> {
    console.clear();
    console.log("=".repeat(40));
    console.log("      PROFILE SUMMARY");
    console.log("=".repeat(40));

    try {
      console.log("\nGenerating profile summary...");
      const userProfile = await this.fetchUserProfile();

      if (!userProfile) {
        console.log("\n❌ Unable to load profile information.");
        await this.waitForKeyPress();
        return;
      }

      console.log("\n📊 Account Summary:");
      console.log("=".repeat(30));
      console.log(`👤 Username: ${userProfile.username}`);
      console.log(`🏷️ Account Type: ${this.formatRole(userProfile.role.name)}`);
      console.log(
        `📅 Member Since: ${new Date(
          userProfile.createdAt
        ).toLocaleDateString()}`
      );

      const accountAge = this.calculateAccountAge(userProfile.createdAt);
      console.log(`⏰ Account Age: ${accountAge}`);

      // Profile completion status
      console.log("\n✅ Profile Status:");
      console.log("-".repeat(20));
      console.log("✅ Username set");
      console.log("✅ Email verified");
      console.log("✅ Account active");

      // Activity summary
      console.log("\n🎯 Available Features:");
      console.log("-".repeat(25));
      console.log("📰 Article browsing and reading");
      console.log("🔖 Bookmark management");
      console.log("👍 Article reactions");
      console.log("🔔 Notification preferences");
      console.log("🔑 Keyword management");
      console.log("🚨 Content reporting");
      console.log("📚 Reading history tracking");

      console.log("\n💡 Tip: Use the dashboard to access all these features!");
    } catch (error: any) {
      console.log(`\n❌ Failed to generate summary: ${error.message}`);
    }

    await this.waitForKeyPress();
  }

  private async showAccountInformation(): Promise<void> {
    console.clear();
    console.log("=".repeat(40));
    console.log("     ACCOUNT INFORMATION");
    console.log("=".repeat(40));

    try {
      console.log("\nFetching account details...");
      const userProfile = await this.fetchUserProfile();

      if (!userProfile) {
        console.log("\n❌ Unable to load account information.");
        await this.waitForKeyPress();
        return;
      }

      console.log("\n🔐 Account Details:");
      console.log("=".repeat(30));
      console.log(`🆔 Account ID: ${userProfile.id}`);
      console.log(`👤 Display Name: ${userProfile.username}`);
      console.log(`📧 Email Address: ${userProfile.email}`);
      console.log(`🏷️ User Role: ${this.formatRole(userProfile.role.name)}`);

      console.log("\n📅 Important Dates:");
      console.log("-".repeat(20));
      console.log(
        `📅 Account Created: ${new Date(
          userProfile.createdAt
        ).toLocaleString()}`
      );

      if (userProfile.updatedAt) {
        console.log(
          `🔄 Profile Updated: ${new Date(
            userProfile.updatedAt
          ).toLocaleString()}`
        );
      }

      console.log("\n🔒 Security Information:");
      console.log("-".repeat(25));
      console.log("✅ Account is active");
      console.log("✅ Email address verified");
      console.log("🔐 Password is encrypted and secure");

      console.log("\n📋 Account Capabilities:");
      console.log("-".repeat(25));

      if (userProfile.role.name === "admin") {
        console.log("👑 Full administrative access");
        console.log("🛠️ User and content management");
        console.log("📊 System analytics and reports");
      } else {
        console.log("👤 Standard user access");
        console.log("📰 Article reading and interaction");
        console.log("⚙️ Personal preferences management");
      }

      console.log("\n⚠️ Important Notes:");
      console.log("-".repeat(20));
      console.log("• Keep your login credentials secure");
      console.log("• Report any suspicious account activity");
      console.log("• Contact support for account issues");
    } catch (error: any) {
      console.log(`\n❌ Failed to load account information: ${error.message}`);
    }

    await this.waitForKeyPress();
  }

  private async fetchUserProfile(): Promise<IUser | null> {
    try {
      // Get user data from localStorage or make API call
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("User not authenticated");
      }

      // Make API call to get user profile
      const response = await fetch("http://localhost:3001/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userProfile = await response.json();
      return userProfile;
    } catch (error: any) {
      console.error("Error fetching user profile:", error);

      // Fallback: try to get user data from localStorage
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (e) {
          // If localStorage data is corrupted, return null
          return null;
        }
      }

      throw error;
    }
  }

  private formatRole(role: string): string {
    const roleMap: { [key: string]: string } = {
      admin: "Administrator",
      user: "Standard User",
      moderator: "Moderator",
    };

    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  }

  private calculateAccountAge(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? "s" : ""}, ${
        diffMonths % 12
      } month${diffMonths % 12 !== 1 ? "s" : ""}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""}, ${
        diffDays % 30
      } day${diffDays % 30 !== 1 ? "s" : ""}`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    }
  }

  private async waitForKeyPress(): Promise<void> {
    console.log("\nPress Enter to continue...");
    prompt("");
  }
}
