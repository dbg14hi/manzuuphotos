# Photography Portfolio

A photography portfolio e-commerce website where users can browse and purchase photo albums. Features an interactive 3D hero section, admin dashboard for album management, and a responsive gallery with high-quality image previews.

## Deployment

https://manzuuphotos.vercel.app/

## TODO
Add a payment
Tried using STRIPE -- but not availabile in Iceland
Tried using RAPYD -- Need a company kennitala and stuff, hassle.
Tried using STRAUMUR -- Also a hassle.

## About

This is a full-stack photography portfolio platform that allows photographers to showcase and sell their work. The site displays albums of high-resolution photos with watermarks, and provides a streamlined admin interface for uploading and managing content. The homepage features an animated 3D camera model that creates an immersive first impression.

## Features

- **3D Hero Section**: Interactive Three.js camera model with scroll-triggered animations
- **Album Gallery**: Responsive justified masonry layout preserving natural image aspect ratios
- **Admin Dashboard**: Secure album upload and management with multi-image support
- **Image Optimization**: Full-resolution images with optional watermarking via Cloudinary
- **Responsive Design**: Modern UI with dark theme and smooth animations

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Animations**: GSAP (ScrollTrigger), Framer Motion
- **UI Components**: shadcn/ui

### Backend & Services
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth (email-based admin access)
- **Image Storage**: Cloudinary (CDN, transformations, watermarking)
- **API**: Next.js API Routes

### Architecture
- **Database Schema**: Albums and album_images tables with proper indexing
- **Image Handling**: Server-side URL generation with Cloudinary transformations
- **Security**: Admin-only API routes with centralized authentication
- **Type Safety**: Full TypeScript coverage with Supabase-generated types

## Project Structure

```
photoportfolio/
├── app/
│   ├── admin/              # Admin dashboard and login
│   ├── api/admin/          # Protected admin API routes
│   ├── albums/[id]/        # Dynamic album detail pages
│   └── page.tsx            # Homepage with 3D hero
├── components/
│   ├── ui/                 # Reusable shadcn/ui components
│   ├── CameraHero.tsx      # 3D hero section
│   ├── AlbumGallery.tsx    # Justified masonry gallery
│   ├── AlbumCard.tsx       # Album preview cards
│   └── ...                 # Other feature components
├── lib/
│   ├── supabase/           # Supabase client configurations
│   ├── cloudinary.ts       # Image upload and URL generation
│   ├── auth.ts             # Admin authentication utilities
│   └── albums.ts           # Album data fetching
├── types/                  # TypeScript type definitions
└── supabase/
    └── migrations/         # Database schema migrations
```

## Key Technical Details

- **Image Display**: Full-resolution images with automatic format optimization and watermarking
- **Gallery Layout**: Dynamic justified masonry layout that maintains image aspect ratios
- **3D Rendering**: GLB model loading with post-processing effects (Bloom, Vignette)
- **Scroll Animations**: GSAP ScrollTrigger for hero section fade-out and canvas transformations
- **Admin Security**: Centralized `requireAdmin()` utility with email-based authorization
- **Database**: PostgreSQL with UUID primary keys, cascading deletes, and RLS policies

## License

MIT
