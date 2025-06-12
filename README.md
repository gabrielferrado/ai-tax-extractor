# Tabelizador

An AI-powered web application for processing and organizing bank statements. Built with Next.js and powered by Google's Gemini AI model.

## Features

- **AI-Powered PDF Processing**: Automatically extracts tax information from bank statements using Google's Gemini AI model
- **Smart Tax Categorization**: Intelligently categorizes taxes and fees into organized tables
- **Interactive Tables**: 
  - Separate tables for different tax categories
  - Sortable by date
  - Total amounts per category
  - Print and copy functionality for each table
- **Modern UI**: Clean and responsive interface built with Next.js and Tailwind CSS
- **Real-time Processing**: Immediate feedback on processing status and results
- **Smart Caching**: 
  - Content-based caching using Redis
  - Automatic cache invalidation
  - Improved performance for repeated files
  - Serverless-friendly implementation

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **AI Processing**: Google Gemini API
- **Caching**: Upstash Redis
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key and Redis credentials to `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key for AI processing
- `UPSTASH_REDIS_REST_URL`: Your Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis REST token

## Caching Implementation

The application uses Upstash Redis for caching processed results:

- **Cache Key**: Generated using SHA-256 hash of file content
- **Cache Entry**: Stores processed summary and file metadata
- **Cache Duration**: Persistent (no automatic expiration)
- **Cache Invalidation**: Automatic based on file content changes

Benefits:
- Faster response times for repeated files
- Reduced API calls to Gemini
- Cost optimization
- Improved user experience

## License

MIT
