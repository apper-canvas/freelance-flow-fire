import { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser, clearUser, setLoading, setError } from '../store/userSlice';

// Create the authentication context
const AuthContext = createContext(null);

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize ApperUI and ApperClient
    const initializeApperSDK = async () => {
      try {
        dispatch(setLoading());
        
        const { ApperClient, ApperUI } = window.ApperSDK;
        
        // Initialize ApperClient
        const client = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });

        // Set up ApperUI with authentication handling
        ApperUI.setup(client, {
          target: '#authentication',
          clientId: import.meta.env.VITE_APPER_PROJECT_ID,
          view: 'both',
          onSuccess: function(user) {
            if (user && user.isAuthenticated) {
              dispatch(setUser(user));
              const currentPath = window.location.pathname;
              if (currentPath === '/login' || currentPath === '/signup') {
                navigate('/');
              }
            } else {
              dispatch(clearUser());
              if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
                navigate('/login');
              }
            }
          },
          onError: function(error) {
            console.error("Authentication failed:", error);
            dispatch(setError(error.message || "Authentication failed"));
            navigate('/login');
          }
        });

        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing authentication:", error);
        dispatch(setError(error.message || "Failed to initialize authentication"));
      }
    };

    initializeApperSDK();
  }, [dispatch, navigate]);

  // Logout function
  const logout = async () => {
    try {
      const { ApperUI } = window.ApperSDK;
      await ApperUI.logout();
      dispatch(clearUser());
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      dispatch(setError(error.message || "Logout failed"));
    }
  };

  // Show login form
  const showLogin = () => {
    if (isInitialized) {
      const { ApperUI } = window.ApperSDK;
      ApperUI.showLogin("#authentication");
    }
  };

  // Show signup form
  const showSignup = () => {
    if (isInitialized) {
      const { ApperUI } = window.ApperSDK;
      ApperUI.showSignup("#authentication");
    }
  };

  // Context value
  const contextValue = {
    isInitialized,
    logout,
    showLogin,
    showSignup
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;