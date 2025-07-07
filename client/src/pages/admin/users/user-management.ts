import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { AdminUserService } from "../../../services/admin/user.service";

export async function userManagementPage(): Promise<void> {
  const userService = new AdminUserService();

  while (true) {
    ConsoleUI.newLine();
    ConsoleUI.title("👥 User Management");

    const choices = [
      { name: "📋 View All Users", value: "list" },
      { name: "🔍 Search User by ID", value: "search" },
      { name: "🔙 Back to Dashboard", value: "back" },
    ];

    try {
      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: "What would you like to do?",
          choices,
        },
      ]);

      switch (action) {
        case "list":
          await listAllUsers(userService);
          break;
        case "search":
          await searchUserById(userService);
          break;
        case "back":
          return; // Exit the loop and return to dashboard
      }
    } catch (error) {
      ConsoleUI.error("User management error: " + (error as Error).message);
      await waitForContinue();
    }
  }
}

async function listAllUsers(userService: AdminUserService): Promise<void> {
  try {
    ConsoleUI.info("Loading users...");
    const users = await userService.getAllUsers();

    if (users.length === 0) {
      ConsoleUI.warning("No users found.");
      await waitForContinue();
      return;
    }

    ConsoleUI.newLine();
    ConsoleUI.title(`📋 All Users (${users.length} total)`);
    ConsoleUI.separator();

    users.forEach((user, index) => {
      const status = user.isActive ? "🟢 Active" : "🔴 Inactive";
      const role = user.role?.name || "Unknown";

      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   👤 ${user.username} (${user.email})`);
      console.log(`   🛡️ Role: ${role}`);
      console.log(`   📊 Status: ${status}`);
      console.log(
        `   📅 Created: ${new Date(user.createdAt).toLocaleDateString()}`
      );
      ConsoleUI.separator();
    });

    await waitForContinue();
  } catch (error) {
    ConsoleUI.error("Failed to load users: " + (error as Error).message);
    await waitForContinue();
  }
}

async function searchUserById(userService: AdminUserService): Promise<void> {
  try {
    const { userId } = await inquirer.prompt([
      {
        type: "number",
        name: "userId",
        message: "Enter User ID:",
        validate: (input: number) =>
          input > 0 || "Please enter a valid user ID",
      },
    ]);

    ConsoleUI.info("Searching for user...");
    const user = await userService.getUserById(userId);

    ConsoleUI.newLine();
    ConsoleUI.title("🔍 User Details");
    ConsoleUI.separator();

    const status = user.isActive ? "🟢 Active" : "🔴 Inactive";
    const role = user.role?.name || "Unknown";

    console.log(`👤 Username: ${user.username}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`🛡️ Role: ${role}`);
    console.log(`📊 Status: ${status}`);
    console.log(`📅 Created: ${new Date(user.createdAt).toLocaleDateString()}`);
    console.log(`📝 Updated: ${new Date(user.updatedAt).toLocaleDateString()}`);

    ConsoleUI.separator();
    await waitForContinue();
  } catch (error) {
    ConsoleUI.error(
      "User not found or error occurred: " + (error as Error).message
    );
    await waitForContinue();
  }
}

async function waitForContinue(): Promise<void> {
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: "Press Enter to continue...",
    },
  ]);
}
