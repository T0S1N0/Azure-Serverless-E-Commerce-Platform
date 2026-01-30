#!/usr/bin/env bash
# Deploy React build to Azure Storage static website.
# Usage: ./deploy-frontend.sh <storage_account_name> [path_to_build]
# Requires: az cli, npm run build in frontend/react-app

set -e
STORAGE_ACCOUNT="${1:?Usage: $0 <storage_account_name> [path_to_build]}"
BUILD_DIR="${2:-$(dirname "$0")/../frontend/react-app/dist}"

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build directory not found: $BUILD_DIR"
  echo "Run: cd frontend/react-app && npm run build"
  exit 1
fi

echo "Uploading from $BUILD_DIR to storage account $STORAGE_ACCOUNT..."
az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --destination '$web' \
  --source "$BUILD_DIR" \
  --overwrite

echo "Frontend deployed. Enable static website if not already:"
echo "  az storage blob service-properties update --account-name $STORAGE_ACCOUNT --static-website --index-document index.html --404-document index.html"
echo "URL: https://${STORAGE_ACCOUNT}.z.web.core.windows.net"
