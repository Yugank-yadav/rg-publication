# GitHub Repository Setup Commands

## Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository" or go to https://github.com/new
3. Repository name: `rg-publication`
4. Description: `Modern e-commerce platform for educational books with Next.js 15 and admin dashboard`
5. Set to **Public** (for Vercel free tier)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 2: Connect Local Repository to GitHub
After creating the repository, run these commands in your terminal:

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rg-publication.git

# Set default branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify Repository
1. Refresh your GitHub repository page
2. You should see all files uploaded
3. Check that README.md displays properly
4. Verify the commit message appears correctly

## Step 4: Repository Settings (Optional)
1. Go to repository Settings
2. Under "General" → "Features":
   - ✅ Enable Issues
   - ✅ Enable Projects
   - ✅ Enable Wiki (optional)
3. Under "Pages" (if you want GitHub Pages):
   - Source: Deploy from a branch
   - Branch: main / (root)

## Next Steps
After GitHub setup is complete:
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy to production

## Repository URL Format
Your repository will be available at:
`https://github.com/YOUR_USERNAME/rg-publication`

## Clone Command for Others
Others can clone your repository with:
```bash
git clone https://github.com/YOUR_USERNAME/rg-publication.git
```
