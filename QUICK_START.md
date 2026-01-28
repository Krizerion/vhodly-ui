# Quick Start Deployment Checklist

Use this checklist to quickly set up your deployment.

## Pre-Deployment Checklist

- [ ] AWS account created and accessible
- [ ] GitHub repository ready
- [ ] Cloudflare domain ready
- [ ] AWS CLI installed (optional, for testing)

## AWS Setup (15-20 minutes)

- [ ] **ECR Repository Created**
  - Repository name: `vhodly-ui`
  - Note ECR URI: `{account-id}.dkr.ecr.{region}.amazonaws.com/vhodly-ui`

- [ ] **Elastic Beanstalk Application Created**
  - Application name: `vhodly-ui`
  - Environment name: `vhodly-ui-prod`
  - Platform: Docker on Amazon Linux 2

- [ ] **IAM User Created**
  - User name: `github-actions-vhodly`
  - Policies attached:
    - `AWSElasticBeanstalkFullAccess`
    - `AmazonEC2ContainerRegistryFullAccess`
    - `AmazonS3FullAccess`
  - Access keys created and saved securely

## GitHub Configuration (5 minutes)

- [ ] **Secrets Added**
  - `AWS_ACCESS_KEY_ID` added to GitHub Secrets
  - `AWS_SECRET_ACCESS_KEY` added to GitHub Secrets

- [ ] **Workflow File Updated** (if needed)
  - Check `.github/workflows/deploy.yml`
  - Update `AWS_REGION` if different from `us-east-1`
  - Verify application and environment names match AWS

## First Deployment (5-10 minutes)

- [ ] **Push to main branch** or manually trigger workflow
- [ ] **Monitor GitHub Actions** for build progress
- [ ] **Check Elastic Beanstalk** environment health
- [ ] **Note environment URL** from Elastic Beanstalk console

## Cloudflare Configuration (10 minutes)

- [ ] **CNAME Record Added**
  - Type: CNAME
  - Name: `@` or `www` (or desired subdomain)
  - Target: Elastic Beanstalk environment URL
  - Proxy: Enabled (orange cloud)

- [ ] **SSL/TLS Configured**
  - Mode: Full or Full (strict)
  - Always Use HTTPS: Enabled
  - Automatic HTTPS Rewrites: Enabled

- [ ] **ACM Certificate** (if using Full strict)
  - Certificate requested in AWS Certificate Manager
  - DNS validation records added to Cloudflare
  - Certificate validated and attached to Elastic Beanstalk

## Verification

- [ ] Application accessible via Elastic Beanstalk URL
- [ ] Application accessible via custom domain
- [ ] HTTPS working correctly
- [ ] Health check endpoint (`/health`) responding
- [ ] Angular routing working correctly

## Common Commands

### Test Docker Build Locally
```bash
docker build -t vhodly-ui .
docker run -p 8080:80 vhodly-ui
# Visit http://localhost:8080
```

### Check ECR Repository
```bash
aws ecr describe-repositories --repository-names vhodly-ui
```

### Check Elastic Beanstalk Status
```bash
aws elasticbeanstalk describe-environments --application-name vhodly-ui
```

### View Environment Logs
```bash
aws elasticbeanstalk request-environment-info \
  --environment-name vhodly-ui-prod \
  --info-type tail
```

## Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Access Denied | Check IAM policies |
| Build Fails | Test Docker locally |
| Health Check Fails | Check `/health` endpoint |
| Domain Not Working | Verify CNAME in Cloudflare |
| SSL Errors | Check Cloudflare SSL mode |

## Need Help?

See `DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.
