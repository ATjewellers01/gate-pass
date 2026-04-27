"use client"

import { useState } from "react"
import { Menu, X } from 'lucide-react'
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-sky-100 bg-white px-4 md:hidden shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500 p-1.5 rounded-lg">
              <span className="text-white font-bold text-lg">GP</span>
            </div>
            <h1 className="text-lg font-bold text-gray-800">GatePass</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-sky-50 transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}