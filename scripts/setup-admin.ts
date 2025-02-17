import { databases, ID } from "@/lib/appwrite";
import { Query } from "appwrite";

const setupAdmin = async () => {
  try {
    // First check if admin already exists
    const existingAdmins = await databases.listDocuments(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "admins",
      [Query.equal("email", "kaelalson58@gmail.com")]
    );

    if (existingAdmins.documents.length > 0) {
      console.log("Admin already exists");
      return;
    }

    // Create admin document
    await databases.createDocument(
      process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
      "admins",
      ID.unique(),
      {
        email: "kaelalson58@gmail.com",
        role: "super_admin",
        user_id: "6798a7f06b660bfda3c6",
        created_at: new Date().toISOString(),
      }
    );

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error setting up admin:", error);
  }
};

// Run the setup
setupAdmin();
