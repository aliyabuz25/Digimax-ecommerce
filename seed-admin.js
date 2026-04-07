import { getDb, createUser, getUserByEmail } from "./server/admin-db.js";
import bcrypt from "bcrypt";

async function seedAdmin() {
  const adminEmail = "admin@digimax.az";
  const existing = await getUserByEmail(adminEmail);
  
  if (existing) {
    console.log("Admin already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await createUser({
    name: "Admin",
    email: adminEmail,
    password: hashedPassword,
    role: "admin"
  });

  console.log("Admin created successfully!");
  console.log("Email: " + adminEmail);
  console.log("Password: admin123");
}

seedAdmin().catch(console.error);
