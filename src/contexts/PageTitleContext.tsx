'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface PageTitleContextType {
  title: string
  setTitle: (title: string) => void
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined)

export const usePageTitle = () => {
  const context = useContext(PageTitleContext)
  if (context === undefined) {
    throw new Error('usePageTitle must be used within a PageTitleProvider')
  }
  return context
}

interface PageTitleProviderProps {
  children: React.ReactNode
}

export const PageTitleProvider: React.FC<PageTitleProviderProps> = ({ children }) => {
  const [title, setTitle] = useState('Indas Estimo')

  useEffect(() => {
    document.title = title
  }, [title])

  const value = {
    title,
    setTitle,
  }

  return (
    <PageTitleContext.Provider value={value}>
      {children}
    </PageTitleContext.Provider>
  )
}