#!/bin/bash

# Kairos v2.0 - New Project Setup Script
# This script helps you quickly set up a new project based on Kairos v2.0

echo "🚀 Kairos v2.0 - New Project Setup"
echo "=================================="

# Get project name
read -p "Enter your new project name: " PROJECT_NAME
read -p "Enter your database name: " DB_NAME
read -p "Enter your main data type (events, businesses, conferences): " DATA_TYPE

echo ""
echo "📝 Setting up $PROJECT_NAME..."

# Create new directory
mkdir $PROJECT_NAME
cd $PROJECT_NAME

# Copy all files from current directory (excluding .git)
echo "📁 Copying project files..."
cp -r ../client ./
cp -r ../server ./
cp -r ../shared ./
cp -r ../scripts ./
cp ../package*.json ./
cp ../tailwind.config.ts ./
cp ../tsconfig.json ./
cp ../vite.config.ts ./
cp ../drizzle.config.ts ./
cp ../env ./

# Update package.json
echo "📦 Updating package.json..."
sed -i '' "s/kairos-v2-0/$PROJECT_NAME/g" package.json
sed -i '' "s/Kairos v2.0/$BRAND_NAME/g" package.json

# Update client package.json
sed -i '' "s/kairos-v2-0/$PROJECT_NAME/g" client/package.json

# Update server package.json
sed -i '' "s/rest-express/$PROJECT_NAME-server/g" server/package.json

# Update database configuration
echo "🗄️ Updating database configuration..."
sed -i '' "s/neondb/$DB_NAME/g" .env
sed -i '' "s/events/$DATA_TYPE/g" shared/schema.ts

# Update README
echo "📖 Updating README..."
sed -i '' "s/Kairos v2.0/$PROJECT_NAME/g" README.md
sed -i '' "s/isuckplshelpmetestimony\/Kairos-v2.0/your-username\/$PROJECT_NAME/g" README.md

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << EOL
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
EOL

# Initialize git
echo "🔧 Initializing git repository..."
git init
git add .
git commit -m "Initial commit: $BRAND_NAME setup"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. cd $PROJECT_NAME"
echo "2. npm install"
echo "3. cd client && npm install"
echo "4. cd ../server && npm install"
echo "5. Update .env with your database credentials"
echo "6. npm run dev (in server directory)"
echo "7. npm run dev (in client directory)"
echo ""
echo "🎉 Your $PROJECT_NAME backend is ready!"
echo ""
echo "📚 Check CUSTOMIZATION_GUIDE.md for detailed customization instructions" 