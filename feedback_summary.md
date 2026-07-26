# 💬 User Feedback Summary

This document summarizes the feedback collected from 15 actual learners and mentors who interacted with the **SkillPay** platform on the Stellar testnet. Based on this feedback, we planned and implemented several product iterations.

---

## 📊 Feedback Overview

| User ID | Name | Overall Rating (1-5) | Most Useful Feature | Bugs/Issues Encountered | Suggestion for Improvement | Status |
|---|---|:---:|---|---|---|---|
| **U001** | Vivaan Reddy | 5 | Mentor dashboard view is fantastic | Works perfectly fine | Allow saving draft submissions | Planned |
| **U002** | Sneha Rao | 4 | Easy to use UI | Found a small typo in the onboarding guide | Add a progress bar for challenge completion | **Implemented** |
| **U003** | Aarohi Kulkarni | 4 | Analytics dashboard | Didn't notice any issues | Add dark mode toggle | **Implemented** |
| **U004** | Swati Das | 5 | Challenge creation | Notification bell didn't update immediately | Better mobile view for the dashboard | **Implemented** |
| **U005** | Vihaan Chatterjee | 4 | The way GitHub and live demos are integrated | Graph didn't load on my first try but fixed after refresh | More chart options in the analytics section | Planned |
| **U006** | Diya Desai | 5 | Very intuitive student experience | The Freighter popup got blocked by my browser once | Support for other wallets besides Freighter | Planned |
| **U007** | Swati Verma | 4 | The seamless onboarding process | No bugs at all | More challenges from different domains | Planned |
| **U008** | Shaurya Patel | 5 | Being able to see earnings growth visually | None, it was smooth | A way to message mentors directly | Planned |
| **U009** | Anjali Iyer | 5 | Real-time notifications when a challenge is approved | Minor glitch when signing transaction but it worked | Allow filtering challenges by difficulty | **Implemented** |
| **U010** | Vikram Singh | 4 | Smart contract escrows make it trustless | None | Add a leaderboard for top earners | **Implemented** |
| **U011** | Rahul Shah | 4 | Freighter Wallet integration | I had to reconnect my wallet twice | Show estimated network fees upfront | **Implemented** |
| **U012** | Karan Pillai | 4 | Instant settlement on the Stellar network | Sometimes slow to load on mobile | Include more onboarding tooltips | **Implemented** |
| **U013** | Pooja Pillai | 5 | Direct wallet to wallet transfers without middlemen | Took a few seconds for the transaction to reflect in the UI | Detailed transaction history page | Planned |
| **U014** | Arjun Banerjee | 4 | The simple wallet connection step | All good, no bugs | More notifications (maybe email alerts?) | Planned |
| **U015** | Rohan Kulkarni | 5 | The clean and modern dark design (if available) | Loading spinner stayed for a bit too long on submission | Add support for multiple languages | Planned |

---

## 🛠 Product Iterations & Improvements

Based on the feedback above, we prioritized and implemented 7 key features to enhance usability:

1. **Estimated Network Fees Tooltip** (Feedback by **Rahul Shah**):
   - *Improvement:* Added an estimated network fee tooltip directly to the user's XLM wallet balance display.
   - *Commit:* [`1c728ca`](https://github.com/manish-kumar-a91949226/SkillPay---Learn-Earn-Platform-on-Stellar/commit/1c728caff15e4895d59271218ee122645296153e)

2. **Onboarding Tooltips** (Feedback by **Karan Pillai**):
   - *Improvement:* Added descriptive hover tooltips to primary navigation links (Dashboard, Challenges, New Challenge) to guide new users.
   - *Commit:* [`c4070d8`](https://github.com/manish-kumar-a91949226/SkillPay---Learn-Earn-Platform-on-Stellar/commit/c4070d8b9bb86140da2106c2f9c78e5bd83290aa)

3. **Difficulty Filtering** (Feedback by **Anjali Iyer**):
   - *Improvement:* Added a functional difficulty filter dropdown on the Challenges browsing page to help users find appropriate tasks.
   - *Commit:* [`6bb1f17`](https://github.com/manish-kumar-a91949226/SkillPay---Learn-Earn-Platform-on-Stellar/commit/6bb1f17af6ef71c96b8fc4d34dbf589dfe593e92)

4. **Level Progress Bar** (Feedback by **Sneha Rao**):
   - *Improvement:* Added a visual progress bar on the learner dashboard to track completed challenges.
   - *Commit:* [`53f7b06`](https://github.com/manish-kumar-a91949226/SkillPay---Learn-Earn-Platform-on-Stellar/commit/53f7b0620dcf80b8ab1dc66528fd185c04bd3980)

5. **Leaderboard rankings** (Feedback by **Vikram Singh**):
   - *Improvement:* Created a dedicated `/leaderboard` page showcasing top earners to gamify the platform.
   - *Commit:* [`7299b09`](https://github.com/manish-kumar-a91949226/SkillPay---Learn-Earn-Platform-on-Stellar/commit/7299b0958bfe3bb39b798d55cbfa4934357c7897)

6. **Mobile Grid Optimizations** (Feedback by **Swati Das**):
   - *Improvement:* Refactored the dashboard grid layout to stack properly on mobile devices.
   - *Commit:* [`e2a7ea0`](https://github.com/manish-kumar-a91949226/SkillPay---Learn-Earn-Platform-on-Stellar/commit/e2a7ea09bffaf2f01b7d3d94e624bc9ece316034)

7. **Dark Mode Toggle** (Feedback by **Aarohi Kulkarni**):
   - *Improvement:* Implemented a theme toggle button in the navigation bar with custom light/dark color variables.
   - *Commit:* [`87210f5`](https://github.com/manish-kumar-a91949226/SkillPay---Learn-Earn-Platform-on-Stellar/commit/87210f5662871e2b95b8cebd8154556dffe374b8)
