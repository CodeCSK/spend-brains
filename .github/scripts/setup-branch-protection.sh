#!/usr/bin/env bash
# Configure GitHub branch protection for Spendbrains.
# Requires: gh CLI authenticated as a repo admin.
#
# Usage:
#   ./.github/scripts/setup-branch-protection.sh [owner/repo]
#
# Default repo: CodeCSK/spend-brains

set -euo pipefail

REPO="${1:-CodeCSK/spend-brains}"
BRANCH_POLICY_CHECK="Branch policy"
CI_CHECK="CI"

echo "Configuring branch protection for ${REPO}..."

echo "-> Setting default branch to develop"
gh api -X PATCH "repos/${REPO}" -f default_branch=develop

echo "-> Protecting master (production)"
gh api -X PUT "repos/${REPO}/branches/master/protection" \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["${BRANCH_POLICY_CHECK}", "${CI_CHECK}"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true
}
EOF

echo "-> Protecting develop (integration)"
gh api -X PUT "repos/${REPO}/branches/develop/protection" \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["${BRANCH_POLICY_CHECK}", "${CI_CHECK}"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": false
}
EOF

echo ""
echo "Done."
echo ""
echo "Next steps for repo admins:"
echo "  1. Point Cloudflare Pages production branch to master."
echo "  2. Point staging/preview deploys to develop."
echo "  3. Delete legacy main after verifying master and develop are in use."
