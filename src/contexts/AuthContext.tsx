'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está autenticado no localStorage
    const authStatus = localStorage.getItem('prolead-auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      // Obter a palavra do Wordle do dia
      const wordleWord = await getWordleWordOfTheDay();
      
      if (password.toLowerCase() === wordleWord.toLowerCase()) {
        setIsAuthenticated(true);
        localStorage.setItem('prolead-auth', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('prolead-auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Função para obter a palavra do Wordle do dia
async function getWordleWordOfTheDay(): Promise<string> {
  try {
    // Usar a API gratuita do New York Times
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const url = `https://www.nytimes.com/svc/wordle/v2/${dateString}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('API não respondeu corretamente');
    const data = await response.json();
    if (!data.solution || typeof data.solution !== 'string') {
      throw new Error('Formato inesperado da resposta');
    }
    return data.solution;
  } catch (error) {
    console.error('Erro ao obter palavra do Wordle:', error);
    // Fallback: usar uma palavra fixa caso a API falhe
    return 'prolead';
  }
} 