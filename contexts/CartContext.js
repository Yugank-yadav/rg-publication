"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { cartAPI } from "@/lib/api";
import logger from "@/lib/logger";

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export function CartProvider({ children }) {
  logger.debug("CartProvider component rendering...");
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();
  const { isAuthenticated, user } = useAuth();

  logger.debug("CartProvider auth state:", {
    isAuthenticated,
    userId: user?.id,
  });

  // Ref to track pending toasts to prevent duplicates
  const pendingToasts = useRef(new Set());

  // Simple test useEffect to verify useEffect is working
  useEffect(() => {
    logger.debug("Test useEffect is working!");
    logger.debug("Starting simple cart initialization...");

    // Simple initialization without complex dependencies
    const initCart = () => {
      logger.debug("Simple cart init - auth state:", {
        isAuthenticated,
        userId: user?.id,
      });

      if (isAuthenticated && user?.id) {
        logger.cart.init("database", 0);
        // For now, just set empty cart and not loading
        setCartItems([]);
        setIsLoading(false);
        setIsInitialized(true);
      } else {
        logger.debug("User not authenticated - loading from localStorage");
        try {
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            const cartData = JSON.parse(savedCart);
            logger.cart.init("localStorage", cartData.length);
            setCartItems(cartData);
          } else {
            logger.debug("No localStorage cart found");
            setCartItems([]);
          }
        } catch (error) {
          logger.error("Error loading localStorage cart:", error);
          setCartItems([]);
        }
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initCart();
  }, [isAuthenticated, user?.id]);

  // Ref to track previous auth state for detecting changes
  const prevAuthState = useRef({ isAuthenticated: false, userId: null });

  // Helper function to show toast only once
  const showToastOnce = useCallback(
    (message, type = "success") => {
      const toastKey = `${type}-${message}`;

      logger.debug(
        "Toast request:",
        toastKey,
        "Pending:",
        Array.from(pendingToasts.current)
      );

      if (pendingToasts.current.has(toastKey)) {
        logger.debug("Toast already pending, skipping:", toastKey);
        return; // Toast already pending, skip
      }

      logger.debug("Showing toast:", toastKey);
      pendingToasts.current.add(toastKey);

      setTimeout(() => {
        if (type === "success") {
          showSuccess(message);
        } else if (type === "info") {
          showInfo(message);
        } else if (type === "error") {
          showError(message);
        }

        // Remove from pending after showing
        setTimeout(() => {
          pendingToasts.current.delete(toastKey);
          logger.debug("Cleaned up toast:", toastKey);
        }, 1000); // Increased timeout to prevent rapid re-adds
      }, 0);
    },
    [showSuccess, showInfo, showError]
  );

  // Helper function to load cart from localStorage
  const loadLocalCart = useCallback(() => {
    logger.debug("Loading cart from localStorage...");
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          logger.cart.init("localStorage", cartData.length);
          return cartData;
        }
      } catch (error) {
        logger.error("Error loading local cart:", error);
      }
    }
    return [];
  }, []);

  // Helper function to save cart to localStorage (only for non-authenticated users)
  const saveLocalCart = useCallback(
    (items) => {
      // Safeguard: Never save to localStorage for authenticated users
      if (isAuthenticated && user?.id) {
        logger.warn(
          "Attempted to save to localStorage for authenticated user - blocked!"
        );
        return;
      }

      logger.debug("Saving cart to localStorage:", items.length, "items");
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("cart", JSON.stringify(items));
        } catch (error) {
          logger.error("Error saving local cart:", error);
        }
      }
    },
    [isAuthenticated, user?.id]
  );

  // Helper function to clear localStorage cart
  const clearLocalCart = useCallback(() => {
    logger.debug("Clearing localStorage cart...");
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("cart");
      } catch (error) {
        logger.error("Error clearing local cart:", error);
      }
    }
  }, []);

  // Helper function to load cart from database with comprehensive error handling
  const loadDatabaseCart = useCallback(async () => {
    logger.debug("Loading cart from database...");
    try {
      const response = await cartAPI.getCart();
      if (response.success && response.data?.cart?.items) {
        // Transform database cart items to match frontend format
        const transformedItems = response.data.cart.items
          .map((item) => {
            // Validate required fields
            if (!item.productId || !item.quantity || !item.unitPrice) {
              logger.warn("Invalid cart item found:", item);
              return null;
            }

            return {
              id: item.productId, // Use productId as id for frontend compatibility
              title: item.product?.title || "Unknown Product",
              price: item.unitPrice,
              quantity: item.quantity,
              image: item.product?.coverImage || item.product?.image,
              author: item.product?.author,
              subject: item.product?.subject,
              class: item.product?.class,
              inStock: item.product?.inStock !== false,
            };
          })
          .filter(Boolean); // Remove null items

        logger.cart.init("database", transformedItems.length);
        return transformedItems;
      } else {
        logger.debug("No cart data found in database");
        return [];
      }
    } catch (error) {
      logger.error("Error loading database cart:", error);

      // Check if it's a network error
      if (
        error.message?.includes("fetch") ||
        error.message?.includes("Network")
      ) {
        showToastOnce("Network error - using local cart", "error");
      } else if (error.status === 401) {
        showToastOnce("Session expired - please login again", "error");
      } else {
        showToastOnce("Failed to load cart from server", "error");
      }

      // Return empty array on error
      return [];
    }
  }, [showToastOnce]);

  // Helper function to merge localStorage cart with database cart with comprehensive error handling
  const mergeCartOnLogin = useCallback(
    async (localItems) => {
      logger.debug(
        "Merging cart on login...",
        localItems.length,
        "local items"
      );

      try {
        // Validate local items before merging
        const validLocalItems = localItems.filter(
          (item) => item && item.id && item.quantity && item.quantity > 0
        );

        if (validLocalItems.length > 0) {
          logger.debug("Merging", validLocalItems.length, "valid local items");

          // Transform frontend cart items to backend format
          const localCartItems = validLocalItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          }));

          const response = await cartAPI.mergeCart(localCartItems);
          if (response.success && response.data?.cart?.items) {
            // Transform merged cart back to frontend format
            const mergedItems = response.data.cart.items
              .map((item) => {
                // Validate merged items
                if (!item.productId || !item.quantity || !item.unitPrice) {
                  logger.warn("Invalid merged item:", item);
                  return null;
                }

                return {
                  id: item.productId,
                  title: item.product?.title || "Unknown Product",
                  price: item.unitPrice,
                  quantity: item.quantity,
                  image: item.product?.coverImage || item.product?.image,
                  author: item.product?.author,
                  subject: item.product?.subject,
                  class: item.product?.class,
                  inStock: item.product?.inStock !== false,
                };
              })
              .filter(Boolean); // Remove invalid items

            logger.cart.sync("database", mergedItems.length);
            return mergedItems;
          } else {
            throw new Error(response.message || "Merge cart API failed");
          }
        } else {
          // No valid local items, just load database cart
          logger.debug("No valid local items, loading database cart");
          return await loadDatabaseCart();
        }
      } catch (error) {
        logger.error("Error merging cart:", error);

        // Provide specific error messages
        if (
          error.message?.includes("fetch") ||
          error.message?.includes("Network")
        ) {
          showToastOnce("Network error during cart sync", "error");
        } else if (error.status === 401) {
          showToastOnce("Session expired during cart sync", "error");
        } else {
          showToastOnce("Failed to sync cart with server", "error");
        }

        // Fallback strategy: try to load database cart, then local cart
        try {
          logger.debug("Attempting fallback to database cart");
          const databaseCart = await loadDatabaseCart();
          if (databaseCart.length > 0) {
            return databaseCart;
          }
        } catch (fallbackError) {
          logger.error("Fallback to database cart failed:", fallbackError);
        }

        // Final fallback to local cart
        logger.debug("Final fallback to local cart");
        return localItems.filter(
          (item) => item && item.id && item.quantity && item.quantity > 0
        );
      }
    },
    [loadDatabaseCart, showToastOnce]
  );

  // Cart initialization - load from appropriate storage based on auth state
  useEffect(() => {
    logger.debug("Cart initialization useEffect triggered", {
      isAuthenticated,
      userId: user?.id,
    });

    const initializeCart = async () => {
      logger.debug("Initializing cart...", {
        isAuthenticated,
        userId: user?.id,
      });
      setIsLoading(true);

      try {
        if (isAuthenticated && user?.id) {
          // User is authenticated - load from database
          logger.debug("User authenticated - loading from database");
          const databaseCart = await loadDatabaseCart();
          setCartItems(databaseCart);
        } else {
          // User not authenticated - load from localStorage
          logger.debug("User not authenticated - loading from localStorage");
          const localCart = loadLocalCart();
          setCartItems(localCart);
        }
      } catch (error) {
        logger.error("Cart initialization error:", error);
        // Fallback to localStorage on error
        const localCart = loadLocalCart();
        setCartItems(localCart);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        logger.debug("Cart initialization complete");
      }
    };

    // Initialize cart when component mounts or auth state changes
    initializeCart();
  }, [isAuthenticated, user?.id]);

  // Detect authentication state changes and handle cart migration
  useEffect(() => {
    const handleAuthStateChange = async () => {
      const currentAuthState = {
        isAuthenticated,
        userId: user?.id || null,
      };

      const prevState = prevAuthState.current;

      logger.debug("Auth state change detected:", {
        previous: prevState,
        current: currentAuthState,
        isInitialized,
      });

      // Only handle changes after initial load
      if (!isInitialized) {
        prevAuthState.current = currentAuthState;
        return;
      }

      // User just logged in
      if (!prevState.isAuthenticated && currentAuthState.isAuthenticated) {
        logger.auth.login(true, currentAuthState.user);
        setIsLoading(true);

        try {
          const localCart = loadLocalCart();
          const mergedCart = await mergeCartOnLogin(localCart);
          setCartItems(mergedCart);

          // Clear localStorage after successful merge
          clearLocalCart();
          showToastOnce("Cart synced with your account", "success");
        } catch (error) {
          logger.error("Error during login cart merge:", error);
          showToastOnce("Failed to sync cart", "error");
        } finally {
          setIsLoading(false);
        }
      }

      // User just logged out
      if (prevState.isAuthenticated && !currentAuthState.isAuthenticated) {
        logger.auth.logout();
        setIsLoading(true);

        try {
          // Clear localStorage completely on logout
          clearLocalCart();

          // Start with empty cart after logout
          setCartItems([]);

          showToastOnce("Logged out - cart cleared", "info");
        } catch (error) {
          logger.error("Error during logout cart handling:", error);
        } finally {
          setIsLoading(false);
        }
      }

      // Update previous state
      prevAuthState.current = currentAuthState;
    };

    handleAuthStateChange();
  }, [
    isAuthenticated,
    user?.id,
    isInitialized,
    cartItems,
    loadLocalCart,
    saveLocalCart,
    clearLocalCart,
    mergeCartOnLogin,
    showToastOnce,
  ]);

  // Save cart to localStorage ONLY for non-authenticated users
  useEffect(() => {
    if (!isInitialized) return; // Don't save during initialization

    if (isAuthenticated && user?.id) {
      // For authenticated users, do NOT save to localStorage
      // Cart is managed entirely through database API calls
      logger.debug("Authenticated user - cart managed via database only");
    } else {
      // For non-authenticated users, save to localStorage
      logger.debug("Non-authenticated user - saving to localStorage");
      saveLocalCart(cartItems);
    }
  }, [cartItems, isAuthenticated, user?.id, isInitialized, saveLocalCart]);

  // Add to cart function with persistence handling
  const addToCart = useCallback(
    async (product) => {
      logger.cart.add(product.title, true);

      // Handle different product data formats (API vs static data)
      const price =
        typeof product.price === "string"
          ? parseFloat(product.price.replace(/[₹,]/g, ""))
          : product.price;

      const newItem = {
        id: product.id,
        title: product.title,
        price: price,
        quantity: 1,
        image: product.image || product.coverImage,
        author: product.author,
        subject: product.subject || product.category,
        class: product.class,
        inStock: product.inStock !== false,
      };

      if (isAuthenticated && user?.id) {
        // Authenticated user - add to database ONLY (no localStorage)
        try {
          logger.debug("Adding to database cart (authenticated user)");
          const response = await cartAPI.addToCart(product.id, 1);

          if (response.success) {
            // Update local state with database response
            setCartItems((prevItems) => {
              const existingItem = prevItems.find(
                (item) => item.id === product.id
              );

              if (existingItem) {
                showToastOnce(
                  `Updated quantity for "${product.title}"`,
                  "success"
                );
                return prevItems.map((item) =>
                  item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
              } else {
                showToastOnce(`"${product.title}" added to cart`, "success");
                return [...prevItems, newItem];
              }
            });
          } else {
            throw new Error(response.message || "Failed to add to cart");
          }
        } catch (error) {
          logger.error("Database add to cart error:", error);
          showToastOnce("Failed to add item to cart", "error");
        }
      } else {
        // Non-authenticated user - add to localStorage via state
        logger.debug("Adding to localStorage cart (non-authenticated user)");
        setCartItems((prevItems) => {
          const existingItem = prevItems.find((item) => item.id === product.id);

          if (existingItem) {
            showToastOnce(`Updated quantity for "${product.title}"`, "success");
            return prevItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            showToastOnce(`"${product.title}" added to cart`, "success");
            return [...prevItems, newItem];
          }
        });
      }

      logger.debug("Item added to cart successfully");
    },
    [isAuthenticated, user?.id, showToastOnce]
  );

  // Remove from cart function with persistence handling
  const removeFromCart = useCallback(
    async (productId) => {
      const itemToRemove = cartItems.find((item) => item.id === productId);
      logger.cart.remove(itemToRemove?.title || productId, true);

      if (isAuthenticated && user?.id) {
        // Authenticated user - remove from database ONLY (no localStorage)
        try {
          // First find the cart item to get the database item ID
          const itemToRemove = cartItems.find((item) => item.id === productId);
          if (!itemToRemove) {
            logger.debug("Item not found in cart");
            return;
          }

          logger.debug("Removing from database cart");
          // Note: We need to find the database cart item ID, not the product ID
          // For now, we'll use the product ID and let the backend handle it
          // This might need adjustment based on the actual backend implementation

          // Update local state immediately for better UX
          setCartItems((prevItems) => {
            const filtered = prevItems.filter((item) => item.id !== productId);
            showToastOnce(`"${itemToRemove.title}" removed from cart`, "info");
            return filtered;
          });

          // Then sync with database (we'll implement this when we have the cart item ID)
          // For now, we'll reload the cart from database to ensure consistency
          setTimeout(async () => {
            try {
              const databaseCart = await loadDatabaseCart();
              setCartItems(databaseCart);
            } catch (error) {
              logger.error("Error reloading cart after remove:", error);
            }
          }, 100);
        } catch (error) {
          logger.error("Database remove from cart error:", error);
          showToastOnce("Failed to remove item from cart", "error");
        }
      } else {
        // Non-authenticated user - remove from localStorage via state
        logger.debug(
          "Removing from localStorage cart (non-authenticated user)"
        );
        setCartItems((prevItems) => {
          const itemToRemove = prevItems.find((item) => item.id === productId);
          if (itemToRemove) {
            showToastOnce(`"${itemToRemove.title}" removed from cart`, "info");
          }
          return prevItems.filter((item) => item.id !== productId);
        });
      }

      logger.debug("Item removed from cart successfully");
    },
    [isAuthenticated, user?.id, cartItems, showToastOnce, loadDatabaseCart]
  );

  // Update quantity function with persistence handling
  const updateQuantity = useCallback(
    async (productId, newQuantity) => {
      const item = cartItems.find((item) => item.id === productId);
      logger.cart.update(item?.title || productId, newQuantity, true);

      if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
      }

      if (isAuthenticated && user?.id) {
        // Authenticated user - update in database ONLY (no localStorage)
        try {
          logger.debug("Updating quantity in database (authenticated user)");

          // Update local state immediately for better UX
          setCartItems((prevItems) =>
            prevItems.map((item) =>
              item.id === productId ? { ...item, quantity: newQuantity } : item
            )
          );

          // Sync with database (we'll implement proper API call later)
          // For now, we'll reload the cart to ensure consistency
          setTimeout(async () => {
            try {
              const databaseCart = await loadDatabaseCart();
              setCartItems(databaseCart);
            } catch (error) {
              logger.error(
                "Error reloading cart after quantity update:",
                error
              );
            }
          }, 100);
        } catch (error) {
          logger.error("Database update quantity error:", error);
          showToastOnce("Failed to update quantity", "error");
        }
      } else {
        // Non-authenticated user - update localStorage via state
        logger.debug(
          "Updating quantity in localStorage (non-authenticated user)"
        );
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    },
    [isAuthenticated, user?.id, removeFromCart, loadDatabaseCart, showToastOnce]
  );

  // Clear cart function with persistence handling
  const clearCart = useCallback(async () => {
    logger.debug("Clearing cart", { isAuthenticated, userId: user?.id });

    if (isAuthenticated && user?.id) {
      // Authenticated user - clear database cart
      try {
        logger.debug("Clearing database cart");
        await cartAPI.clearCart();
        setCartItems([]);
        showToastOnce("Cart cleared", "info");
      } catch (error) {
        logger.error("Database clear cart error:", error);
        showToastOnce("Failed to clear cart", "error");
      }
    } else {
      // Non-authenticated user - clear localStorage via state
      logger.debug("Clearing localStorage cart");
      setCartItems([]);
      showToastOnce("Cart cleared", "info");
    }

    logger.debug("Cart cleared successfully");
  }, [isAuthenticated, user?.id, showToastOnce]);

  // Calculate cart totals
  const getCartTotals = useCallback(() => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const itemCount = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    return { subtotal, itemCount };
  }, [cartItems]);

  // Check if item is in cart
  const isInCart = useCallback(
    (productId) => {
      return cartItems.some((item) => item.id === productId);
    },
    [cartItems]
  );

  // Get item quantity in cart
  const getItemQuantity = useCallback(
    (productId) => {
      const item = cartItems.find((item) => item.id === productId);
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  // Provider value
  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotals,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
