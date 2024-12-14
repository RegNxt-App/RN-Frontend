# Pull request guide 🏅

## Developer Instructions

- Whenever you create a PR, make sure you only assign a reviewer to the PR when you are done working on it and is ready for the review. **Do not** assign a reviewer when you are just working on it (this must be followed strictly since a few automations depend on this instruction).
- Your PR will be judged (approved/dimissed) on [rubric given below](#pr-approval-checklist). As a developer, it is considered good manners to analyze your own PRs on the rubric before asking for a review.

## Reviewer Instructions

- Keep a close eye on the console or rather, always keep it open.
- Check on different screen sizes if it is a responsive screen (functional reviewer only).
- Review in normal browser window and in incogito mode (functional reviewer only).
- **DO NOT** forget to check the items in the following checklist.
- Some items may not be applicable for some tasks so check the N/A column for that item.
- Make sure to **track your time** on the task as reviewer.
- Make sure to add a tag (either 'dev_review' or 'func_review' or both) to your tracked time entries.
- All the items in the rubric below must be checked off in order for the PR to be considered approved. Even if a single check is failing, PR will be considered unapproved and will be sent back to (changes requested stage) the developer to fix.

## PR approval checklist

| Items                                                                                             | Responsible Reviewer | Not Applicable |
| ------------------------------------------------------------------------------------------------- | -------------------- | -------------- |
| - [ ] Clickup task attached with PR ?                                                             | Func                 | - [ ]          |
| - [ ] Branch name & PR title conform to the convention [task or bug]/[task-id]/[two word summary] | Func                 | - [ ]          |
| - [ ] Appropriate reviewers assigned to the PR?                                                   | Func                 | - [ ]          |
| - [ ] PR assignee field not empty?                                                                | Func                 |                |
| - [ ] Eslint check passed?                                                                        | Func                 |                |
| - [ ] Prettier check passed?                                                                      |  Func                 |                |
| - [ ] No re-renders?                                                                              | Func                 | - [ ]          |
| - [ ] Functionally working as described in the task/user story?                                   | Func                 | - [ ]          |
| - [ ] Pixel perfect design as reflected in Figma?                                                 | Func                 | - [ ]          |
| - [ ] Design tokens(theme) used everywhere?                                                       | Func                 | - [ ]          |
| - [ ] No console statements?                                                                      | Func                 |                |
| - [ ] No errors/warnings in console?                                                              | Func                 | - [ ]          |
| - [ ] No debuggers?                                                                               | Dev                  |                |
| - [ ] No redundant CSS classes or HTML tags used?                                                 | Dev                  | - [ ]          |
| - [ ] No redundant component wraping?                                                             | Dev                  | - [ ]          |
| - [ ] No redundant useEffect hooks ?                                                              | Dev                  | - [ ]          |
| - [ ] Are proptypes accurate?                                                                     | Dev                  | - [ ]          |
| - [ ] Correct contextual use of forEach, map and filter functions?                                | Dev                  | - [ ]          |
| - [ ] Use of useMemo where necessary?                                                             | Dev                  | - [ ]          |
| - [ ] All the created states are absolutely necessary?                                            | Dev                  | - [ ]          |
