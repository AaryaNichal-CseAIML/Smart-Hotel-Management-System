import React, { createContext, useContext } from 'react';
import { useHotelData } from './HotelDataContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { activeRole, switchRole, currentUser } = useHotelData();

  const loginAs = (role) => {
    switchRole(role);
  };

  const logout = () => {
    switchRole('customer');
  };

  return (
    <AuthContext.Provider
      value={{
        user: {
          id: activeRole === 'admin' ? 1 : activeRole === 'staff' ? 2 : 8,
          fullName: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          roles: [
            activeRole === 'admin'
              ? 'ROLE_ADMIN'
              : activeRole === 'staff'
              ? 'ROLE_RECEPTIONIST'
              : 'ROLE_GUEST',
          ],
        },
        activeRole,
        switchRole,
        loginAs,
        logout,
        isAuthenticated: true,
        isGuest: activeRole === 'customer',
        isStaff: activeRole === 'staff' || activeRole === 'admin',
        isAdmin: activeRole === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
