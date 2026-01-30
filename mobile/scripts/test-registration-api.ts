/**
 * Test script to verify complete-registration API
 * Run this to check if backend is working correctly
 */

import axios from "axios";

const BASE_URL = "http://10.0.2.2:8082/api";

// Test data
const testData = {
  // Option 1: Using Firebase ID Token (JWT)
  withIdToken: {
    idToken: "YOUR_FIREBASE_ID_TOKEN_HERE", // From console log
    firstName: "Test",
    lastName: "User",
    birthday: "2000-01-01",
  },

  // Option 2: Using temp token from backend
  withTempToken: {
    tempToken: "YOUR_TEMP_TOKEN_HERE", // From backend response
    firstName: "Test",
    lastName: "User",
    birthday: "2000-01-01",
  },
};

async function testCompleteRegistration() {
  console.log("Testing Complete Registration API...\n");
  console.log("Base URL:", BASE_URL);
  console.log("Endpoint:", `${BASE_URL}/auth/complete-registration`);

  try {
    // Test with idToken
    console.log("\n=== Test 1: With Firebase ID Token ===");
    console.log("Request:", testData.withIdToken);

    const response1 = await axios.post(
      `${BASE_URL}/auth/complete-registration`,
      testData.withIdToken,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      },
    );

    console.log("✅ Success!");
    console.log("Response:", response1.data);
  } catch (error: any) {
    console.log("❌ Error!");
    console.log("Status:", error.response?.status);
    console.log("Error Code:", error.response?.data?.code);
    console.log("Error Message:", error.response?.data?.message);
    console.log("Full Response:", error.response?.data);

    // Analyze the error
    if (error.response?.status === 500) {
      console.log("\n🔍 Analysis:");
      console.log("- Backend returned 500 (Internal Server Error)");
      console.log("- Check backend logs for stack trace");
      console.log("- Possible issues:");
      console.log("  1. Invalid token format");
      console.log("  2. Token expired or not found in database");
      console.log("  3. Database connection issue");
      console.log("  4. Missing required fields");
      console.log("  5. Backend validation error");
    }
  }
}

// Instructions
console.log("=== API Test Instructions ===\n");
console.log("1. Get Firebase ID Token from app logs");
console.log("2. Replace YOUR_FIREBASE_ID_TOKEN_HERE in testData");
console.log("3. Run: npx ts-node scripts/test-registration-api.ts");
console.log("4. Check the response\n");

// Uncomment to run the test
// testCompleteRegistration();

export { testCompleteRegistration };
