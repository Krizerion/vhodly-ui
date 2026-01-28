# Deployment Guide: Angular App to AWS Elastic Beanstalk via GitHub Actions

This guide will walk you through deploying your Angular application to AWS Elastic Beanstalk using GitHub Actions with Docker and connecting your Cloudflare domain.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Setup](#aws-setup)
3. [GitHub Actions Configuration](#github-actions-configuration)
4. [Cloudflare Domain Configuration](#cloudflare-domain-configuration)
5. [Deployment Process](#deployment-process)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- An AWS account with appropriate permissions
- A GitHub repository for your project
- A domain registered with Cloudflare
- AWS CLI installed (optional, for local testing)
- Basic knowledge of AWS services (ECR, Elastic Beanstalk, Route 53)

---

## AWS Setup

### Step 1: Create an Amazon ECR Repository

1. **Log in to AWS Console** and navigate to **Amazon ECR** (Elastic Container Registry)

2. **Create a new repository**:
   - Click "Create repository"
   - Repository name: `vhodly-ui`
   - Visibility: Private
   - Tag immutability: Enable (recommended)
   - Scan on push: Enable (recommended for security)
   - Click "Create repository"

3. **Note your ECR repository URI**:
   - Format: `{account-id}.dkr.ecr.{region}.amazonaws.com/vhodly-ui`
   - You'll need this for the GitHub Actions workflow

### Step 2: Create an Elastic Beanstalk Application

1. **Navigate to Elastic Beanstalk** in AWS Console

2. **Create a new application**:
   - Click "Create application"
   - Application name: `vhodly-ui`
   - Description: "Vhodly UI Application" (optional)
   - Click "Create"

3. **Create an environment**:
   - Click "Create environment"
   - Choose **Docker** platform
   - Platform branch: Docker running on 64bit Amazon Linux 2
   - Platform version: Latest recommended version
   - Application code: Sample application (we'll update this later)
   - Environment name: `vhodly-ui-prod`
   - Domain: Leave default (or choose a unique subdomain)
   - Description: "Production environment for Vhodly UI"
   - Click "Create environment"

4. **Wait for environment creation** (takes 5-10 minutes)

5. **Configure environment**:
   - Once created, go to Configuration → Software
   - Add environment properties if needed
   - Save changes

### Step 3: Create IAM User for GitHub Actions

1. **Navigate to IAM** in AWS Console

2. **Create a new user**:
   - Click "Users" → "Create user"
   - User name: `github-actions-vhodly`
   - Select "Provide user access to the AWS Management Console" → "I will create the access key"
   - Click "Next"

3. **Attach policies**:
   - Click "Attach policies directly"
   - Add the following policies:
     - `AWSElasticBeanstalkFullAccess`
     - `AmazonEC2ContainerRegistryFullAccess`
     - `AmazonS3FullAccess` (needed for Elastic Beanstalk deployments)
   - Click "Next" → "Create user"

4. **Create access keys**:
   - Click on the newly created user
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Choose "Application running outside AWS"
   - Click "Next"
   - Description: "GitHub Actions deployment"
   - Click "Create access key"
   - **IMPORTANT**: Copy both Access Key ID and Secret Access Key immediately
   - Store them securely (you'll add them to GitHub Secrets)

### Step 4: Configure Elastic Beanstalk for Docker

1. **Update environment configuration**:
   - Go to your Elastic Beanstalk environment
   - Click "Configuration" → "Edit" on "Docker" section
   - Ensure "Dockerfile" is selected as the deployment method
   - Save changes

2. **Configure health check**:
   - Go to Configuration → Load balancer
   - Health check path: `/health`
   - Health check interval: 30 seconds
   - Healthy threshold: 3
   - Unhealthy threshold: 5
   - Timeout: 5 seconds
   - Save changes

---

## GitHub Actions Configuration

### Step 1: Add GitHub Secrets

1. **Go to your GitHub repository**

2. **Navigate to Settings → Secrets and variables → Actions**

3. **Add the following secrets**:
   - `AWS_ACCESS_KEY_ID`: Your IAM user's Access Key ID
   - `AWS_SECRET_ACCESS_KEY`: Your IAM user's Secret Access Key

### Step 2: Update Workflow Configuration

1. **Edit `.github/workflows/deploy.yml`**:

   Update these environment variables if needed:
   ```yaml
   env:
     AWS_REGION: us-east-1  # Change to your preferred region
     ECR_REPOSITORY: vhodly-ui
     EB_APPLICATION_NAME: vhodly-ui
     EB_ENVIRONMENT_NAME: vhodly-ui-prod
   ```

2. **Commit and push** the workflow file to your repository

### Step 3: Test the Workflow

1. **Push to main branch** or manually trigger the workflow:
   - Go to Actions tab in GitHub
   - Select "Deploy to AWS Elastic Beanstalk"
   - Click "Run workflow"

2. **Monitor the deployment**:
   - Watch the workflow logs for any errors
   - Check AWS Elastic Beanstalk console for environment status

---

## Cloudflare Domain Configuration

### Step 1: Get Elastic Beanstalk Environment URL

1. **After successful deployment**, go to your Elastic Beanstalk environment
2. **Copy the environment URL** (e.g., `vhodly-ui-prod.us-east-1.elasticbeanstalk.com`)

### Step 2: Configure DNS in Cloudflare

1. **Log in to Cloudflare Dashboard**

2. **Select your domain**

3. **Go to DNS → Records**

4. **Add a CNAME record**:
   - Type: `CNAME`
   - Name: `@` (for root domain) or `www` (for www subdomain) or any subdomain
   - Target: Your Elastic Beanstalk environment URL (e.g., `vhodly-ui-prod.us-east-1.elasticbeanstalk.com`)
   - Proxy status: Proxied (orange cloud) - Recommended for DDoS protection
   - TTL: Auto
   - Click "Save"

5. **For SSL/TLS**:
   - Go to SSL/TLS → Overview
   - Ensure SSL/TLS encryption mode is set to **Full** or **Full (strict)**
   - This ensures encrypted connection between Cloudflare and Elastic Beanstalk

### Step 3: Configure Cloudflare SSL Settings

1. **SSL/TLS → Overview**:
   - Set encryption mode to "Full" or "Full (strict)"

2. **SSL/TLS → Edge Certificates**:
   - Enable "Always Use HTTPS"
   - Enable "Automatic HTTPS Rewrites"

3. **SSL/TLS → Origin Server**:
   - If using Full (strict), you may need to create an Origin Certificate
   - However, Elastic Beanstalk provides SSL certificates, so "Full" mode usually works

### Step 4: Update Elastic Beanstalk for Custom Domain

1. **In AWS Elastic Beanstalk**:
   - Go to Configuration → Load balancer
   - Click "Edit"
   - Add your custom domain to the "Listeners" section:
     - Port: 443
     - Protocol: HTTPS
     - SSL certificate: Request a new certificate or use ACM certificate
   - Save changes

2. **Request SSL Certificate in AWS Certificate Manager (ACM)**:
   - Navigate to AWS Certificate Manager
   - Request a public certificate
   - Add your domain (e.g., `yourdomain.com` and `*.yourdomain.com`)
   - Choose DNS validation
   - Add the CNAME records to Cloudflare DNS
   - Wait for validation (can take a few minutes to hours)

3. **Attach certificate to Elastic Beanstalk**:
   - Once validated, go back to Elastic Beanstalk configuration
   - Select the certificate from the dropdown
   - Save changes

---

## Deployment Process

### Automatic Deployment

Once configured, deployments happen automatically when you:

1. **Push to main branch**: The workflow triggers automatically
2. **Manual trigger**: Go to Actions → Deploy workflow → Run workflow

### Deployment Steps (Automated)

The GitHub Actions workflow will:

1. ✅ Checkout your code
2. ✅ Configure AWS credentials
3. ✅ Login to Amazon ECR
4. ✅ Build Docker image
5. ✅ Push image to ECR
6. ✅ Generate deployment package
7. ✅ Deploy to Elastic Beanstalk
8. ✅ Wait for environment to be healthy

### Monitoring Deployment

1. **GitHub Actions**:
   - Go to Actions tab
   - Click on the running workflow
   - Monitor logs in real-time

2. **AWS Elastic Beanstalk**:
   - Go to your environment
   - Check "Events" tab for deployment progress
   - Check "Health" tab for environment status

---

## Troubleshooting

### Common Issues and Solutions

#### 1. GitHub Actions Fails: "Access Denied"

**Problem**: IAM user doesn't have sufficient permissions

**Solution**:
- Verify IAM user has all required policies:
  - `AWSElasticBeanstalkFullAccess`
  - `AmazonEC2ContainerRegistryFullAccess`
  - `AmazonS3FullAccess`
- Check that AWS credentials in GitHub Secrets are correct

#### 2. Docker Build Fails

**Problem**: Build errors in Dockerfile

**Solution**:
- Test Docker build locally: `docker build -t vhodly-ui .`
- Check Dockerfile syntax
- Verify all required files are present (nginx.conf, etc.)

#### 3. Elastic Beanstalk Deployment Fails

**Problem**: Environment health check fails

**Solution**:
- Check Elastic Beanstalk logs:
  - Go to Logs → Request Logs → Last 100 Lines
- Verify health check path `/health` is accessible
- Check nginx configuration
- Ensure port 80 is exposed in Dockerfile

#### 4. Domain Not Resolving

**Problem**: CNAME record not working

**Solution**:
- Verify CNAME record in Cloudflare DNS
- Check TTL and wait for propagation (can take up to 48 hours, usually minutes)
- Ensure proxy status is correct
- Verify SSL/TLS mode is set to "Full" or "Full (strict)"

#### 5. SSL Certificate Issues

**Problem**: Mixed content or SSL errors

**Solution**:
- Ensure ACM certificate is validated
- Check Cloudflare SSL/TLS mode is "Full" or "Full (strict)"
- Verify certificate is attached to Elastic Beanstalk load balancer
- Check that your Angular app uses HTTPS for API calls

#### 6. Application Not Loading

**Problem**: 404 errors or blank page

**Solution**:
- Check nginx configuration (nginx.conf)
- Verify Angular routing configuration
- Check browser console for errors
- Verify base href in index.html matches your deployment path

### Viewing Logs

1. **Elastic Beanstalk Logs**:
   - Go to your environment → Logs → Request Logs
   - Download full logs for detailed debugging

2. **Docker Container Logs**:
   - SSH into EC2 instance (if enabled)
   - Run: `docker ps` to see running containers
   - Run: `docker logs <container-id>` to view logs

3. **GitHub Actions Logs**:
   - Go to Actions → Select workflow run → View logs

---

## Environment Variables

If your application needs environment variables:

1. **In Elastic Beanstalk**:
   - Go to Configuration → Software
   - Add environment properties
   - Save and apply

2. **In Angular**:
   - Use Angular's environment files (`src/environments/`)
   - Build-time variables are baked into the build
   - For runtime variables, consider using a config service

---

## Cost Optimization

### Tips to Reduce AWS Costs

1. **Use t3.micro or t3.small** instances (sufficient for most Angular apps)
2. **Enable auto-scaling** with minimum 1 instance
3. **Use Application Load Balancer** (cheaper than Classic)
4. **Set up CloudWatch alarms** to monitor costs
5. **Use Reserved Instances** if running 24/7
6. **Enable Elastic Beanstalk managed updates** for automatic patching

---

## Security Best Practices

1. ✅ **Never commit AWS credentials** to repository
2. ✅ **Use IAM roles** with least privilege principle
3. ✅ **Enable ECR image scanning** for vulnerabilities
4. ✅ **Use HTTPS** everywhere (enforced by Cloudflare)
5. ✅ **Enable Cloudflare DDoS protection** (proxied DNS)
6. ✅ **Regularly update** Docker base images
7. ✅ **Monitor CloudWatch** for unusual activity
8. ✅ **Use AWS Secrets Manager** for sensitive data

---

## Rollback Procedure

If deployment fails or issues occur:

1. **Via GitHub Actions**:
   - Re-run previous successful workflow
   - Or manually deploy previous Docker image tag

2. **Via Elastic Beanstalk**:
   - Go to Application versions
   - Select previous working version
   - Click "Deploy"

3. **Via AWS CLI**:
   ```bash
   aws elasticbeanstalk update-environment \
     --application-name vhodly-ui \
     --environment-name vhodly-ui-prod \
     --version-label <previous-version-label>
   ```

---

## Next Steps

After successful deployment:

1. ✅ Set up monitoring and alerts
2. ✅ Configure backup strategies
3. ✅ Set up CI/CD for other branches (staging, dev)
4. ✅ Implement blue-green deployments
5. ✅ Set up CDN (Cloudflare already provides this)
6. ✅ Configure logging and monitoring tools

---

## Additional Resources

- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [Amazon ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Angular Deployment Guide](https://angular.dev/guide/deployment)

---

## Support

If you encounter issues not covered in this guide:

1. Check AWS CloudWatch logs
2. Review GitHub Actions workflow logs
3. Check Elastic Beanstalk environment events
4. Consult AWS documentation
5. Review Cloudflare DNS and SSL settings

---

**Last Updated**: January 2026
