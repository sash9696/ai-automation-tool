#!/bin/bash

echo "🚀 Deploying AI Automation Tool to Render"
echo "=========================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository as remote origin:"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    echo ""
    echo "Then visit: https://dashboard.render.com/new/blueprint"
    echo "And connect your GitHub repository"
else
    echo "✅ Git remote found"
    echo "📤 Pushing to GitHub..."
    git add .
    git commit -m "Update for Render deployment"
    git push
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Visit: https://dashboard.render.com/new/blueprint"
echo "2. Connect your GitHub repository"
echo "3. Render will automatically detect the render.yaml file"
echo "4. Set your environment variables (OPENAI_API_KEY, etc.)"
echo "5. Deploy!"
echo ""
echo "🌐 Your app will be available at:"
echo "   Frontend: https://ai-automation-frontend.onrender.com"
echo "   Backend: https://ai-automation-backend.onrender.com"
echo ""
echo "📝 Required Environment Variables:"
echo "   - OPENAI_API_KEY"
echo "   - LINKEDIN_CLIENT_ID"
echo "   - LINKEDIN_CLIENT_SECRET"
echo ""
echo "✅ Deployment configuration ready!" 