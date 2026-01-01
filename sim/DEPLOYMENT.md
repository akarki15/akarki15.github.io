# Deployment Guide

This guide explains how to deploy the Tesla Inventory Monitor to GitHub Actions.

## Prerequisites

1.  **GitHub Account**: You need a free GitHub account.
2.  **Discord Account**: For receiving notifications.

## Step 1: Create a Discord Webhook

1.  Open Discord and go to your private server (or create one).
2.  Right-click on a text channel (e.g., `#general`) -> **Edit Channel**.
3.  Go to **Integrations** -> **Webhooks**.
4.  Click **New Webhook**.
5.  Click on the new webhook, name it "Tesla Bot", and click **Copy Webhook URL**.
    - It should look like: `https://discord.com/api/webhooks/123456.../abcdef...`

## Step 2: Upload Code to GitHub

(Already done if you are reading this in the repo!)

## Step 3: Configure Secrets

1.  Go to your GitHub Repository page.
2.  Click on **Settings** (top tab).
3.  On the left sidebar, scroll down to **Secrets and variables** -> **Actions**.
4.  Click **New repository secret**.
5.  Add the following secrets:

    -   `DISCORD_WEBHOOK_URL`: Paste the URL you copied from Discord.
    -   `SEND_STATUS_SMS`: Set to `true` to receive a notification every time (even if no matches found). Set to `false` (default) to only get notified on exact matches.
-   `PROXY_URL`: (Optional) An HTTP/SOCKS proxy (e.g. `http://user:pass@proxy.com:8080`) to bypass cloud-IP blocking on GitHub Actions.

## Step 4: Run It!

1.  Go to the **Actions** tab.
2.  Click **Tesla Inventory Check** on the left.
3.  Click **Run workflow** -> **Run workflow**.

The script will now run automatically every ~5 minutes.
