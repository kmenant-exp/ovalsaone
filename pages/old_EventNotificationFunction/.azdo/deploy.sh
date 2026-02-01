#!/bin/bash

# Deploy script for Azure Function using Azure Developer CLI
# This script will provision infrastructure and deploy the function app

set -e

echo "🚀 Starting Azure Function deployment..."

# Check if azd is installed
if ! command -v azd &> /dev/null
then
    echo "❌ Azure Developer CLI (azd) is not installed"
    echo "Install it from: https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd"
    exit 1
fi

# Check if logged in to Azure
if ! azd auth login --check-status &> /dev/null
then
    echo "🔐 Not logged in to Azure. Running azd auth login..."
    azd auth login
fi

# Initialize environment if not already done
if [ ! -f .azure/${AZURE_ENV_NAME}/.env ]; then
    echo "📋 Environment not initialized. Please run:"
    echo "   azd env new <environment-name>"
    echo "   azd env set AZURE_STORAGE_ACCOUNT_NAME <existing-storage-account>"
    echo "   azd env set SMTP_USER <your-gmail>"
    echo "   azd env set SMTP_PASS <your-app-password>"
    echo "   azd env set SMTP_FROM <your-gmail>"
    echo "   azd env set NOTIFICATION_EMAILS <email1;email2>"
    exit 1
fi

# Provision and deploy
echo "🏗️  Provisioning infrastructure..."
azd provision

echo "📦 Building and deploying function..."
azd deploy

echo "✅ Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Configure SMTP settings in Azure Portal or via azd env set"
echo "   2. Test the function: curl https://\$(azd env get-values | grep AZURE_FUNCTION_APP_URL | cut -d'=' -f2)/api/TestNotification"
echo "   3. Check logs: azd monitor --logs"
