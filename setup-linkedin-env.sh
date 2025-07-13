#!/bin/bash

echo "🔧 LinkedIn Environment Setup"
echo "=============================="
echo ""

echo "Current LinkedIn configuration:"
echo "LINKEDIN_CLIENT_ID: $(grep LINKEDIN_CLIENT_ID backend/.env | cut -d'=' -f2)"
echo "LINKEDIN_CLIENT_SECRET: $(grep LINKEDIN_CLIENT_SECRET backend/.env | cut -d'=' -f2)"
echo "USE_MOCK_LINKEDIN: $(grep USE_MOCK_LINKEDIN backend/.env | tail -1 | cut -d'=' -f2)"
echo ""

echo "Choose an option:"
echo "1. Enable Mock LinkedIn Service (for development/testing)"
echo "2. Configure Real LinkedIn API (requires LinkedIn Developer credentials)"
echo "3. Exit"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🔧 Enabling Mock LinkedIn Service..."
        # Update USE_MOCK_LINKEDIN to true
        sed -i '' 's/USE_MOCK_LINKEDIN=false/USE_MOCK_LINKEDIN=true/g' backend/.env
        echo "✅ Mock LinkedIn service enabled!"
        echo "📝 You can now test LinkedIn features without real credentials"
        echo "🔄 Restart your backend server to apply changes"
        ;;
    2)
        echo "🔧 Configuring Real LinkedIn API..."
        echo ""
        echo "To use the real LinkedIn API, you need:"
        echo "1. A LinkedIn Developer account"
        echo "2. A LinkedIn App with OAuth 2.0 permissions"
        echo "3. Client ID and Client Secret from your LinkedIn App"
        echo ""
        echo "Steps:"
        echo "1. Go to https://www.linkedin.com/developers/"
        echo "2. Create a new app or use existing one"
        echo "3. Add OAuth 2.0 redirect URL: http://localhost:3001/api/linkedin/callback"
        echo "4. Request these scopes: w_member_social, openid, profile"
        echo "5. Get your Client ID and Client Secret"
        echo ""
        read -p "Enter your LinkedIn Client Secret: " client_secret
        if [ ! -z "$client_secret" ]; then
            sed -i '' "s/LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret/LINKEDIN_CLIENT_SECRET=$client_secret/g" backend/.env
            sed -i '' 's/USE_MOCK_LINKEDIN=true/USE_MOCK_LINKEDIN=false/g' backend/.env
            echo "✅ LinkedIn Client Secret updated!"
            echo "🔄 Restart your backend server to apply changes"
        else
            echo "❌ Client Secret cannot be empty"
        fi
        ;;
    3)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Current configuration after changes:"
echo "USE_MOCK_LINKEDIN: $(grep USE_MOCK_LINKEDIN backend/.env | tail -1 | cut -d'=' -f2)"
if [ "$choice" = "2" ]; then
    echo "LINKEDIN_CLIENT_SECRET: [CONFIGURED]"
fi 