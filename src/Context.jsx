import { createContext, useReducer, useContext, useState, useEffect } from "react";

export const themeContext = createContext();

const initialState = { darkMode: false };

const themeReducer = (state, action) => {
  switch (action.type) {
    case "toggle":
        return { darkMode: !state.darkMode };
      default:
        return state;
  }
};

export const ThemeProvider = (props) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);
  return (
    <themeContext.Provider value={{state, dispatch}}>{props.children}</themeContext.Provider>
  );
};

// User Context
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('notificationReadStatus');
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <UserContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user
    }}>
      {children}
    </UserContext.Provider>
  );
};
