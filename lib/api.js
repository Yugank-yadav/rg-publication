import axios from "axios";
import Cookies from "js-cookie";
import logger from "./logger";

// Retry mechanism for failed requests
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (
      retries > 0 &&
      (error.code === "NETWORK_ERROR" ||
        error.code === "ECONNREFUSED" ||
        error.response?.status >= 500 ||
        error.response?.status === 429) // Retry on rate limiting
    ) {
      // Use longer delay for rate limiting errors
      const retryDelay = error.response?.status === 429 ? delay * 3 : delay;
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return retryRequest(fn, retries - 1, retryDelay * 2);
    }
    throw error;
  }
};

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    logger.api.response(response.config?.url, response.status, response.data);
    return response.data;
  },
  (error) => {
    logger.api.error(
      error.config?.method || "UNKNOWN",
      error.config?.url || "unknown",
      error
    );

    if (error.response?.status === 401) {
      // Token expired or invalid
      logger.debug("Authentication failed, clearing tokens");
      Cookies.remove("auth_token");
      Cookies.remove("user_data");
      // Don't redirect automatically, let the app handle it
      // window.location.href = "/auth/login";
    }

    // Handle rate limiting (429) errors
    if (error.response?.status === 429) {
      const errorMessage =
        "Too many requests. Please wait a moment and try again.";
      return Promise.reject(new Error(errorMessage));
    }

    // Handle server connection errors
    if (error.code === "ECONNREFUSED" || error.code === "NETWORK_ERROR") {
      const errorMessage =
        "Unable to connect to server. Please check if the backend is running.";
      return Promise.reject(new Error(errorMessage));
    }

    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(errorMessage));
  }
);

// ===== AUTHENTICATION APIs =====

export const authAPI = {
  // Register new user
  register: async (userData) => {
    logger.api.request("POST", "/auth/register", userData);
    const response = await api.post("/auth/register", userData);
    logger.debug("authAPI: Registration response:", response);
    if (response.success && response.data.tokens?.accessToken) {
      Cookies.set("auth_token", response.data.tokens.accessToken, {
        expires: 365,
      });
      Cookies.set("user_data", JSON.stringify(response.data.user), {
        expires: 365,
      });
    }
    return response;
  },

  // Login user
  login: async (credentials) => {
    logger.api.request("POST", "/auth/login");
    try {
      const response = await api.post("/auth/login", credentials);
      logger.debug("authAPI: Response received:", {
        success: response.success,
        hasData: !!response.data,
        hasTokens: !!response.data?.tokens,
        hasUser: !!response.data?.user,
      });

      if (response.success && response.data.tokens?.accessToken) {
        logger.debug("authAPI: Setting cookies");
        Cookies.set("auth_token", response.data.tokens.accessToken, {
          expires: 365,
        });
        Cookies.set("user_data", JSON.stringify(response.data.user), {
          expires: 365,
        });
      }
      return response;
    } catch (error) {
      logger.error("authAPI: Login request failed:", error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      logger.error("Logout error:", error);
    } finally {
      Cookies.remove("auth_token");
      Cookies.remove("user_data");
    }
  },

  // Get current user
  getCurrentUser: () => {
    const userData = Cookies.get("user_data");
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Cookies.get("auth_token");
  },
};

// ===== PRODUCT APIs =====

export const productAPI = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    return await retryRequest(async () => {
      const queryString = new URLSearchParams(params).toString();
      return await api.get(`/products?${queryString}`);
    });
  },

  // Get single product by ID
  getProduct: async (id) => {
    return await retryRequest(async () => {
      return await api.get(`/products/${id}`);
    });
  },

  // Get featured products
  getFeaturedProducts: async (type = "bestsellers") => {
    return await retryRequest(async () => {
      return await api.get(`/products/featured?type=${type}`);
    });
  },

  // Search products
  searchProducts: async (params = {}) => {
    return await retryRequest(async () => {
      const queryString = new URLSearchParams(params).toString();
      return await api.get(`/search/products?${queryString}`);
    });
  },

  // Get search suggestions
  getSearchSuggestions: async (query) => {
    return await retryRequest(async () => {
      return await api.get(
        `/search/suggestions?q=${encodeURIComponent(query)}`
      );
    });
  },
};

// ===== CART APIs =====

export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    return await retryRequest(async () => {
      return await api.get("/cart");
    });
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    return await retryRequest(async () => {
      return await api.post("/cart/items", { productId, quantity });
    });
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    return await retryRequest(async () => {
      return await api.put(`/cart/items/${itemId}`, { quantity });
    });
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    return await retryRequest(async () => {
      return await api.delete(`/cart/items/${itemId}`);
    });
  },

  // Clear entire cart
  clearCart: async () => {
    return await retryRequest(async () => {
      return await api.delete("/cart/clear");
    });
  },

  // Sync localStorage cart with server
  syncCart: async (cartItems) => {
    return await retryRequest(async () => {
      return await api.post("/cart/sync", { items: cartItems });
    });
  },

  // Merge localStorage cart with database cart (for login scenarios)
  mergeCart: async (localCartItems) => {
    return await retryRequest(async () => {
      return await api.post("/cart/merge", { localCartItems });
    });
  },
};

// ===== WISHLIST APIs =====

export const wishlistAPI = {
  // Get user's wishlist
  getWishlist: async () => {
    return await retryRequest(async () => {
      return await api.get("/wishlist");
    });
  },

  // Add item to wishlist
  addToWishlist: async (productId) => {
    return await retryRequest(async () => {
      return await api.post("/wishlist/items", { productId });
    });
  },

  // Remove item from wishlist
  removeFromWishlist: async (itemId) => {
    return await retryRequest(async () => {
      return await api.delete(`/wishlist/items/${itemId}`);
    });
  },

  // Check if product is in wishlist
  checkWishlist: async (productId) => {
    return await retryRequest(async () => {
      return await api.get(`/wishlist/check/${productId}`);
    });
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    return await retryRequest(async () => {
      return await api.delete("/wishlist");
    });
  },
};

// ===== USER APIs =====

export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return await api.get("/users/profile");
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await api.put("/users/profile", profileData);
  },

  // Change password
  changePassword: async (passwordData) => {
    return await api.put("/users/password", passwordData);
  },

  // Get user addresses
  getAddresses: async () => {
    return await api.get("/users/addresses");
  },

  // Add new address
  addAddress: async (addressData) => {
    return await api.post("/users/addresses", addressData);
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    return await api.put(`/users/addresses/${addressId}`, addressData);
  },

  // Delete address
  deleteAddress: async (addressId) => {
    return await api.delete(`/users/addresses/${addressId}`);
  },
};

// ===== ORDER APIs =====

export const orderAPI = {
  // Create new order
  createOrder: async (orderData) => {
    return await api.post("/orders", orderData);
  },

  // Get order by ID
  getOrder: async (orderId) => {
    return await api.get(`/orders/${orderId}`);
  },

  // Get user's order history
  getOrderHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/orders?${queryString}`);
  },
};

// ===== REVIEW APIs =====

export const reviewAPI = {
  // Get product reviews
  getProductReviews: async (productId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(
      `/reviews/products/${productId}/reviews?${queryString}`
    );
  },

  // Add product review
  addReview: async (productId, reviewData) => {
    return await api.post(`/reviews/products/${productId}/reviews`, reviewData);
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    return await api.put(`/reviews/${reviewId}`, reviewData);
  },

  // Delete review
  deleteReview: async (reviewId) => {
    return await api.delete(`/reviews/${reviewId}`);
  },

  // Mark review as helpful
  markHelpful: async (reviewId) => {
    return await api.post(`/reviews/${reviewId}/helpful`);
  },
};

// ===== CONTACT APIs =====

export const contactAPI = {
  // Submit contact form
  submitContact: async (contactData) => {
    return await api.post("/contact/submit", contactData);
  },
};

// ===== COUPON APIs =====

export const couponAPI = {
  // Validate coupon code
  validateCoupon: async (code) => {
    return await api.get(`/coupons/validate/${code}`);
  },

  // Apply coupon to cart
  applyCoupon: async (code) => {
    return await api.post("/cart/coupon", { code });
  },

  // Remove coupon from cart
  removeCoupon: async () => {
    return await api.delete("/cart/coupon");
  },

  // Get available coupons
  getAvailableCoupons: async () => {
    return await api.get("/coupons/available");
  },
};

// Export default api instance for custom requests
export default api;
