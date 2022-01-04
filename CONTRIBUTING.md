## 📝 Contribution workflow

To contribute to this project you should follow these things:

1. Open an issue in the HyperTrace GitHub or Razorpay's fork based upon the type of the issue/requirement and it's scope (specific to Razorpay or not)
2. Discuss possible solutions and approaches on the issue itself and once finalised, you can start working on implementing the solution.
3. Checkout a new branch with the type of change you're committing. The type of change should be one of `fix, feat, chore, docs, ci, refactor, build` followed by `/` followed by a very short description. For eg: `feat/add-util-flatten`
   1. For branching, always create a new branch from `latest_fork` branch.
   2. The PR should be raised against `hypertrace/hypertrace-ui:main` if the changes are to be propagated to upstream branch.
   3. In case the changes are specific to Razorpay itself and won't be propagated to upstream, then the PR should be raised against `razorpay/hypertrace-ui:rzp_main` branch.
