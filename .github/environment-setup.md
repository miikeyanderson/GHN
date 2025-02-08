# GitHub Actions Environment Setup

This document describes how to set up the required environments and secrets for the CI/CD pipeline.

## Required Environments

Create the following environments in your GitHub repository settings:
- development
- staging
- production

## Required Secrets

### Repository Secrets (Available to all environments)
- `GITHUB_TOKEN` (Automatically provided)
- `GITGUARDIAN_API_KEY`: API key for GitGuardian security scanning
- `SONAR_TOKEN`: Token for SonarCloud analysis
- `K6_CLOUD_TOKEN`: Token for k6 Cloud (if using cloud features)
- `CYPRESS_RECORD_KEY`: Record key for Cypress Dashboard
- `LHCI_GITHUB_APP_TOKEN`: GitHub App token for Lighthouse CI

### Environment Secrets (Set per environment)
For each environment (development, staging, production), set these secrets:

#### AWS Configuration
- `AWS_ROLE_ARN`: ARN of the IAM role to assume (recommended over static credentials)
  Format: `arn:aws:iam::<account-id>:role/github-actions-role`

#### Deployment Configuration
- `KUBE_CONFIG`: Base64 encoded kubeconfig file (if not using AWS EKS)
- `DOCKER_REGISTRY_PASSWORD`: Password for container registry (if not using GHCR)

#### Monitoring
- `SLACK_WEBHOOK_URL`: Webhook URL for Slack notifications
- `SENTRY_AUTH_TOKEN`: Authentication token for Sentry releases

## Environment Protection Rules

### Production Environment
- Required reviewers: 2
- Wait timer: 15 minutes
- Branch protection rules:
  - Require status checks to pass
  - Require conversation resolution
  - Require signed commits

### Staging Environment
- Required reviewers: 1
- Branch protection rules:
  - Require status checks to pass

### Development Environment
- No additional protection rules

## AWS IAM Role Setup

1. Create an IAM role with the following trust relationship:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:<org>/<repo>:*"
        }
      }
    }
  ]
}
```

2. Attach the following managed policies:
   - `AmazonEKSClusterPolicy`
   - `AmazonECR_PowerUser`

## Branch Protection Rules

Add the following branch protection rules for the main branch:

1. Require pull request reviews
2. Require status checks to pass:
   - security-scan
   - lint-test
   - frontend-quality
   - backend-quality
   - e2e-tests
   - performance-test
3. Require branches to be up to date
4. Include administrators in restrictions
