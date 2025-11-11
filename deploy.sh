#!/bin/bash

# 🚀 React Google Integration - Quick Deploy Script
# Author: React Google Integration Team
# Description: Quick commit and push for frontend & backend deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
CHECK="✅"
WARNING="⚠️"
GEAR="⚙️"
CLOUD="☁️"
PACKAGE="📦"

echo -e "${BLUE}${ROCKET} React Google Integration - Quick Deploy${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# Function to show usage
show_usage() {
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ${GREEN}./deploy.sh${NC} [commit_message]"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${GREEN}./deploy.sh \"Fix navigation bug\"${NC}"
    echo -e "  ${GREEN}./deploy.sh \"Add new feature\"${NC}"
    echo -e "  ${GREEN}./deploy.sh${NC}  (will prompt for message)"
    echo ""
    exit 1
}

# Check if help is requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_usage
fi

# Get commit message
if [ -z "$1" ]; then
    echo -e "${YELLOW}💬 Enter commit message:${NC}"
    read -p "Message: " COMMIT_MESSAGE
else
    COMMIT_MESSAGE="$1"
fi

# Validate commit message
if [ -z "$COMMIT_MESSAGE" ]; then
    echo -e "${RED}${WARNING} Error: Commit message cannot be empty${NC}"
    exit 1
fi

echo -e "${BLUE}${GEAR} Starting deployment process...${NC}"
echo ""

# Step 1: Check git status
echo -e "${CYAN}${PACKAGE} Step 1: Checking git status...${NC}"
git status --porcelain > /dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}${WARNING} Error: Not a git repository${NC}"
    exit 1
fi

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}${WARNING} No changes detected. Creating empty commit...${NC}"
    git commit --allow-empty -m "${COMMIT_MESSAGE}"
else
    echo -e "${GREEN}${CHECK} Changes detected${NC}"
    
    # Step 2: Build frontend
    echo -e "${CYAN}${PACKAGE} Step 2: Building frontend...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}${WARNING} Error: Frontend build failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}${CHECK} Frontend build successful${NC}"
    
    # Step 3: Add all changes
    echo -e "${CYAN}${PACKAGE} Step 3: Adding changes to git...${NC}"
    git add .
    echo -e "${GREEN}${CHECK} All changes added${NC}"
    
    # Step 4: Commit changes
    echo -e "${CYAN}${PACKAGE} Step 4: Committing changes...${NC}"
    git commit -m "${COMMIT_MESSAGE}"
    if [ $? -ne 0 ]; then
        echo -e "${RED}${WARNING} Error: Commit failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}${CHECK} Changes committed${NC}"
fi

# Step 5: Push to GitHub
echo -e "${CYAN}${PACKAGE} Step 5: Pushing to GitHub...${NC}"
git push origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}${WARNING} Error: Push to GitHub failed${NC}"
    exit 1
fi
echo -e "${GREEN}${CHECK} Pushed to GitHub successfully${NC}"

echo ""
echo -e "${PURPLE}${CLOUD} Deployment Status:${NC}"
echo -e "${GREEN}${CHECK} Frontend: Will auto-deploy to Netlify (3-5 minutes)${NC}"
echo -e "${GREEN}${CHECK} Backend: Will auto-deploy to Render (5-10 minutes)${NC}"
echo ""

echo -e "${BLUE}${ROCKET} Production URLs:${NC}"
echo -e "${CYAN}Frontend: https://leafy-baklava-595711.netlify.app/${NC}"
echo -e "${CYAN}Backend:  https://react-google-backend.onrender.com${NC}"
echo ""

echo -e "${GREEN}${CHECK} Deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 Tip: Monitor deployment status on Netlify and Render dashboards${NC}"
echo ""
