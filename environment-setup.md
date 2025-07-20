# Environment Setup Instructions

## 1. Create .env.local file
Copy and paste the following content into a new file called `.env.local` in your project root:

```bash
# Environment Variables Configuration
# Generated JWT Secret (secure)
JWT_SECRET=/wtp1oNZntVS0sCkgx0d0d9elqsrQSda98ukwjZpuzQ=

# Supabase Configuration (replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration (replace with your actual API key)
OPENAI_API_KEY=your_openai_api_key_here

# Node Environment
NODE_ENV=development
```

## 2. Required Dependencies
Run these commands in your terminal:

```bash
# Install JWT library
npm install jose

# Install Node.js type definitions
npm install --save-dev @types/node
```

## 3. Security Notes
- ✅ JWT_SECRET has been generated securely
- ⚠️ Replace placeholder values with your actual API keys
- 🔒 Never commit .env.local to version control
- 🔄 Use different secrets for production

## 4. Next Steps After Setup
1. Add your real Supabase URL and keys
2. Add your real OpenAI API key
3. Run the install commands above
4. Restart your development server

Your application will now be significantly more secure!
