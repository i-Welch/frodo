---
slug: huawei-cloud-scraper-bank-security
title: 15,266 Requests From Huawei Cloud. Three in Four Posed as People.
description: Two Huawei Cloud networks sent us 15,266 requests in early November, up 47x in five days. Three in four posed as Chrome. How we shut them out, and why banks face the same bots: financial services drew 46% of account takeover incidents in 2025.
url: https://reportraven.tech/blog/huawei-cloud-scraper-bank-security
stat: 15,266
statLabel: Requests two Huawei Cloud networks sent our website in the first ten days of November. Three in four claimed to be Chrome.
---
Two Huawei Cloud networks sent our website 15,266 requests in the first ten days of November. Daily volume grew 47x in five days.

About a quarter came from Huawei's search crawler, which names itself. The other 11,292 claimed to be Chrome on Windows and Mac.

They weren't. They came from data centers, and they loaded 5,634 page scripts and files. The crawler that names itself loaded 18. That is a headless browser: real browser software with no person behind it.

It read everything public and never tried to sign in. Harmless scraping, reconnaissance or a probe ahead of something worse: from the outside there is no way to know, and that is the problem. So we didn't wait to find out. We blocked the two networks and turned on bot challenges.

In the two weeks since, 31% of requests to our sites got a challenge instead of a page. In the latest week, the largest source of challenged traffic was the United States, not China.

Blocking a country stops the bot you already caught. Behavior catches the rest.

Banks face the same software at login and account opening. Thales found financial services drew 46% of account takeover incidents in 2025.

Who at your bank sees the bot traffic hitting your website, your login page and your loan application?

#CommunityBanking #CyberSecurity #BankSecurity #FraudPrevention #CreditUnions
