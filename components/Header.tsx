'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Instagram } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export function Header() {
  const [scrolled, setScrolled] = useState(false) // Track if user has scrolled for header styling
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Add background blur when user scrolls past 20px
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll to top when navigating to home page
  useEffect(() => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pathname])

  const navItems = [
    { name: 'Gallery', href: '/#albums-section' },
  ]

  // Scroll to top if on home, otherwise navigate to home then scroll
  const scrollToTop = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push('/')
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-white/20 shadow-2xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            onClick={scrollToTop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center cursor-pointer"
          >
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
              manzuuphotos
            </span>
          </motion.div>

          {/* Instagram Link */}
          <a
            href="https://www.instagram.com/manzuuphotos/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-white/90 hover:text-white transition-colors"
            >
              <Instagram className="w-6 h-6" />
            </motion.div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className="relative text-lg font-medium bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer"
                  whileHover={{ y: -2 }}
                >
                  {item.name}
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-white/10"
          >
            <div className="px-6 py-8 space-y-6">
              {/* Instagram Link in Mobile */}
              <a
                href="https://www.instagram.com/manzuuphotos/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-2xl font-medium text-white/90 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Instagram className="w-6 h-6" />
                <span>Instagram</span>
              </a>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-2xl font-medium bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Spacer so content isn't hidden under fixed header */}
      <div className="h-24" />
    </>
  )
}
