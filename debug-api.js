// Debug script to test API endpoints
const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api/v1";

// Test authentication and cart/wishlist operations
async function debugAPI() {
  try {
    console.log("🔍 Starting API Debug Tests...\n");

    // 1. Test health endpoint
    console.log("1️⃣ Testing health endpoint...");
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log("✅ Health check:", healthResponse.data);
    } catch (error) {
      console.log("❌ Health check failed:", error.message);
    }

    // 2. Test login
    console.log("\n2️⃣ Testing login...");
    let token = null;
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: "admin@rgpublication.com",
        password: "admin123",
      });
      console.log("✅ Login successful:", {
        success: loginResponse.data.success,
        hasToken: !!loginResponse.data.data?.tokens?.accessToken,
        hasUser: !!loginResponse.data.data?.user,
      });
      token = loginResponse.data.data?.tokens?.accessToken;
    } catch (error) {
      console.log("❌ Login failed:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    if (!token) {
      console.log("❌ No token available, skipping authenticated tests");
      return;
    }

    // 3. Test cart endpoint
    console.log("\n3️⃣ Testing cart endpoint...");
    try {
      const cartResponse = await axios.get(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("✅ Cart fetch successful:", {
        success: cartResponse.data.success,
        itemCount: cartResponse.data.data?.items?.length || 0,
        total: cartResponse.data.data?.total || 0,
      });
    } catch (error) {
      console.log("❌ Cart fetch failed:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }

    // 4. Test wishlist endpoint
    console.log("\n4️⃣ Testing wishlist endpoint...");
    try {
      const wishlistResponse = await axios.get(`${API_BASE_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("✅ Wishlist fetch successful:", {
        success: wishlistResponse.data.success,
        itemCount: wishlistResponse.data.data?.items?.length || 0,
      });
    } catch (error) {
      console.log("❌ Wishlist fetch failed:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }

    // 5. Test products endpoint (to get a product ID for cart testing)
    console.log("\n5️⃣ Testing products endpoint...");
    let productId = null;
    try {
      const productsResponse = await axios.get(
        `${API_BASE_URL}/products?limit=1`
      );
      console.log("✅ Products fetch successful:", {
        success: productsResponse.data.success,
        productCount: productsResponse.data.data?.products?.length || 0,
      });
      productId = productsResponse.data.data?.products?.[0]?.id;
      console.log("📦 First product ID:", productId);
    } catch (error) {
      console.log("❌ Products fetch failed:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    // 6. Test add to cart
    if (productId) {
      console.log("\n6️⃣ Testing add to cart...");
      try {
        const addCartResponse = await axios.post(
          `${API_BASE_URL}/cart/items`,
          {
            productId: productId,
            quantity: 1,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("✅ Add to cart successful:", {
          success: addCartResponse.data.success,
          message: addCartResponse.data.message,
        });
      } catch (error) {
        console.log("❌ Add to cart failed:", {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          data: error.response?.data,
        });
      }
    }

    // 7. Test cart again after adding item
    console.log("\n7️⃣ Testing cart after adding item...");
    try {
      const cartResponse2 = await axios.get(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("✅ Cart fetch after add successful:", {
        success: cartResponse2.data.success,
        itemCount: cartResponse2.data.data?.items?.length || 0,
        total: cartResponse2.data.data?.summary?.total || 0,
      });
    } catch (error) {
      console.log("❌ Cart fetch after add failed:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    console.log("\n🏁 API Debug Tests Complete!");
  } catch (error) {
    console.error("💥 Unexpected error:", error.message);
  }
}

// Run the debug tests
debugAPI();
