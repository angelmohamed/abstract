# #!/bin/bash
# set -e

TMP_DIR="./next-deploy"
REPO="git@gitlab.com:wealwinprojects/sonotrade-frontend-2025.git"
SSH_KEY="/Users/mariselvam/Documents/project/sonotrade/ref/developerssh.pem"
BRANCH="main"

npx @cloudflare/next-on-pages

# Clone repo into new temp folder
echo "📁 Cloning repo into temp dir: $TMP_DIR"
GIT_SSH_COMMAND="ssh -i $SSH_KEY" git clone --branch "$BRANCH" "$REPO" "$TMP_DIR" || exit 1

# Copy build into repo
echo "📦 Copying build output to repo..."
rm -rf "$TMP_DIR/build/.vercel"
cp -r .vercel "$TMP_DIR/build/"

# Commit & push
git -C "$TMP_DIR" add .
git -C "$TMP_DIR" commit -m "🚀 Deploy build $(date +%F_%T)" || echo "⚠️ Nothing to commit"
GIT_SSH_COMMAND="ssh -i $SSH_KEY" git -C "$TMP_DIR" push

# Clean up
rm -rf "$TMP_DIR"

echo "✅ Deployment complete."