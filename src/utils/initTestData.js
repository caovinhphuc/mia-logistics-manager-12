import { initializeTestData } from "../test-data/testData";

// Initialize test data on app start in development
if (process.env.NODE_ENV === "development") {
  initializeTestData();
  console.log("🧪 Test data initialized for development");
}
