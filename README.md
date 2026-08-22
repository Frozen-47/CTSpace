# CTSpace - Campus & Classroom Scheduling Management System

CTSpace is a modern, high-performance web application designed for campus course management, faculty scheduling, student directory lookups, and administrative controls. Built with React, TypeScript, Vite, and Tailwind/Vanilla CSS.

## 🚀 Features

- **Multi-Role Dashboard**: Tailored perspectives for Administrators, Faculty, and Students.
- **Interactive Schedule & Timetable**: Real-time room availability, slot reservations, and conflict prevention.
- **Directory Management**: Comprehensive search and filtering for students, faculty, and course enrollments.
- **Course Administration**: Dynamic CRUD interface for managing courses, instructor assignments, and capacities.
- **Admin & Database Control**: Built-in health metrics, schema configurations, and mock data synchronization.
- **Role-Based Protection Gate**: Granular component access control based on user authentication level.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Modern CSS design tokens, Glassmorphism, Tailwind utilities
- **Icons**: Lucide React
- **Backend / Database**: Supabase Integration & Local IndexedDB fallback

## 📦 Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Frozen-47/CTSpace.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional for Supabase connectivity):
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## 📄 License

MIT License. Developed for Campus Management.

