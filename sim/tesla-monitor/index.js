
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Load .env for local testing
try { require('dotenv').config(); } catch (e) { }

// Configuration
// We now fetch ALL Model Ys to find alternatives, and filter locally for the exact match.
const CONFIG = {
    zip: '95112',
    // ... (rest of config)
    // Use secret URL if set, otherwise default to the broad search
    targetUrl: process.env.TESLA_SEARCH_URL || 'https://www.tesla.com/inventory/new/my?arrangeby=plh&zip=95112&range=0&PaymentType=lease',
    filters: {
        trim: 'PRRWD',          // Premium Rear-Wheel Drive
        paint: 'WHITE',
        interior: 'PREMIUM_BLACK'
    }
};

async function sendDiscordNotification(exactMatches, alternatives, totalScanned, targetUrl) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    const sendStatus = process.env.SEND_STATUS_SMS === 'true'; // Keeping same var name for simplicity, serves same purpose

    if (!webhookUrl) {
        console.log('--- DISCORD CONFIG ERROR ---');
        console.log('DISCORD_WEBHOOK_URL: MISSING');
        console.log('----------------------------');
        return;
    }

    // Decision: Send if matches found OR if Status SMS is requested
    const shouldSend = (exactMatches.length > 0 || alternatives.length > 0) && sendStatus;

    // IF we have 0 vehicles scanned, it's definitely a blockage.
    if (totalScanned === 0 && !sendStatus) {
        console.log('Scanned 0 vehicles (Blocked). No notification sent.');
        return;
    }

    const embeds = [];

    // Distinct Colors and Titles
    const isSuccess = exactMatches.length > 0;
    const isBlocked = totalScanned === 0;

    let embedColor = isSuccess ? 5763719 : 15548997; // Green vs Red/Orange
    if (isBlocked) embedColor = 0x34495e; // Dark Grey for blocked

    let title = isSuccess ? `🚀 FOUND ${exactMatches.length} MATCHES!` : `⚠️ No Exact Matches Found`;
    if (isBlocked) title = `❌ Scan Blocked by Tesla (0 Vehicles)`;

    // 1. Status Embed
    const statusEmbed = {
        title: title,
        color: embedColor,
        fields: [
            {
                name: "📊 Stats",
                value: `Scanned: **${totalScanned}** vehicles\n[Search Link](${targetUrl})`,
                inline: false
            }
        ]
    };

    if (isBlocked) {
        statusEmbed.fields.push({
            name: "🛡️ Anti-Bot Alert",
            value: "Tesla is blocking the scan. Run this script locally for better results.",
            inline: false
        });
    }

    // 2. Add Exact Matches
    exactMatches.slice(0, 3).forEach((c, i) => {
        const p = c.Price || 'N/A';
        const lease = c.Finance?.estimate?.lease?.monthlyPayment || 'N/A';
        const link = `https://www.tesla.com/my/order/${c.VIN}?zip=${CONFIG.zip}`;

        statusEmbed.fields.push({
            name: `🎯 MATCH #${i + 1}: $${p}`,
            value: `Lease: $${Math.round(lease)}/mo\n[View Vehicle](${link})`,
            inline: true
        });
    });

    embeds.push(statusEmbed);

    // 3. Alternatives Embed (if any)
    if (alternatives.length > 0) {
        const altEmbed = {
            title: `📉 Best Alternatives (Lowest Price)`,
            color: 16776960, // Yellow
            fields: []
        };

        alternatives.slice(0, 3).forEach(c => {
            const p = c.Price || 'N/A';
            const lease = c.Finance?.estimate?.lease?.monthlyPayment || 'N/A';

            // Clean up Trim
            let trim = c.TrimName || 'Model Y';
            if (trim.includes('Rear-Wheel Drive')) trim = 'RWD';
            if (trim.includes('Long Range')) trim = 'LR';
            if (trim.includes('Performance')) trim = 'Perf';

            // Clean up Paint
            let color = 'Unknown Color';
            const paintOption = c.OptionCodeList?.find(x => x.startsWith('PAINT_'));
            if (paintOption) {
                color = paintOption.replace('PAINT_', '').replace('_', ' ').toLowerCase();
                color = color.charAt(0).toUpperCase() + color.slice(1); // Capitalize first letter
            }

            // Clean up Interior
            let interior = 'Unknown Int';
            const intOption = c.OptionCodeList?.find(x => x.startsWith('INTERIOR_') || x.startsWith('INT_'));
            if (intOption) {
                if (intOption.includes('WHITE')) interior = 'White';
                else if (intOption.includes('BLACK')) interior = 'Black';
                else if (intOption.includes('CREAM')) interior = 'Cream';
            }

            const wheels = c.OptionCodeList?.find(x => x.includes('WHEELS')) ? '20"' : '19"';

            const link = `https://www.tesla.com/my/order/${c.VIN}?zip=${CONFIG.zip}`;

            altEmbed.fields.push({
                name: `🔹 ${trim} - ${color} / ${interior}`,
                value: `**Price**: $${p}\n**Lease**: $${Math.round(lease)}/mo\n**Wheels**: ${wheels}\n[View Vehicle](${link})`,
                inline: true
            });
        });

        embeds.push(altEmbed);
    }

    try {
        const payload = {
            content: isSuccess ? "@everyone 🚨 FOUND A MATCH! 🚨" : "",
            embeds: embeds
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('Discord notification sent successfully!');
        } else {
            console.error('Failed to send Discord notification:', await response.text());
        }
    } catch (error) {
        console.error('Error sending Discord notification:', error);
    }
}

async function checkInventory() {
    console.log(`Checking inventory at: ${new Date().toISOString()}`);

    const launchArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors',
        '--disable-blink-features=AutomationControlled', // Stealth
        '--disable-infobars',
        '--window-size=1920,1080',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];

    if (process.env.PROXY_URL) {
        console.log(`Using Proxy: ${process.env.PROXY_URL}`);
        launchArgs.push(`--proxy-server=${process.env.PROXY_URL}`);
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: launchArgs
    });

    const page = await browser.newPage();

    // Set viewport/UA/Headers
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
    });

    // Helper to log requests to debug "0 cars found"
    page.on('request', req => {
        if (['xhr', 'fetch'].includes(req.resourceType())) {
            // Only log inventory results to avoid log bloat
            if (req.url().includes('inventory-results')) {
                console.log(`[REQ] ${req.resourceType().toUpperCase()} ${req.url()}`);
            }
        }
    });

    try {
        console.log(`Navigating to: ${CONFIG.targetUrl}`);

        // Setup listener logic *before* navigation
        const apiResponsePromise = page.waitForResponse(response =>
            response.url().includes('inventory-results') && response.status() === 200 && response.request().method() === 'GET'
            , { timeout: 45000 }).catch(e => {
                console.log("Timeout waiting for specific API response.");
                return null;
            });

        // Add a random delay to seem more human
        await new Promise(r => setTimeout(r, Math.random() * 3000 + 2000));

        await page.goto(CONFIG.targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log(`Page Loaded. Title: "${await page.title()}"`);

        // Wait another bit for lazy loading
        await new Promise(r => setTimeout(r, 5000));

        const response = await apiResponsePromise;
        let allCars = [];

        if (response) {
            console.log(`[DATA] Captured API Response! Status: ${response.status()}`);
            try {
                const data = await response.json();
                if (data && data.results) {
                    allCars = data.results;
                    console.log(`[DATA] API returned ${allCars.length} total vehicles.`);
                } else {
                    console.log('[DATA] API returned empty results or unexpected format.');
                }
            } catch (e) {
                console.error("[ERROR] Failed to parse API JSON:", e);
            }
        } else {
            console.log("[DATA] NO inventory-results Captured. API call may have failed or was blocked.");
            const finalTitle = await page.title();
            console.log(`[DATA] Final Page Title: "${finalTitle}"`);
        }

        console.log(`[FILTER] Matching against: Paint=${CONFIG.filters.paint}, Trim=${CONFIG.filters.trim}, Interior=${CONFIG.filters.interior}`);

        // --- Filtering Logic ---
        const exactMatches = [];
        const alternatives = [];

        allCars.forEach(car => {
            const options = car.OptionCodeList || [];
            const trimName = car.TrimName || '';

            // Strict Check:
            const matchesTrim = options.includes(CONFIG.filters.trim) || options.includes('MTY13') || trimName.includes('REAR-WHEEL');
            const matchesPaint = options.includes('PAINT_' + CONFIG.filters.paint);
            const matchesInterior = options.includes('INTERIOR_' + CONFIG.filters.interior) || options.includes('INT_BLACK_PREMIUM') || options.includes('INPB0');

            if (matchesPaint && matchesInterior && matchesTrim) {
                exactMatches.push(car);
            } else {
                alternatives.push(car);
            }
        });

        console.log(`[FILTER] Found ${exactMatches.length} exact matches and ${alternatives.length} alternatives.`);

        if (alternatives.length > 0) {
            console.log(`[FILTER] Sorting alternatives by price...`);
            alternatives.sort((a, b) => (a.Price - b.Price));
        }

        console.log(`[NOTIFY] Preparing Discord payload for ${allCars.length} scanned vehicles.`);
        await sendDiscordNotification(exactMatches, alternatives, allCars.length, CONFIG.targetUrl);

    } catch (error) {
        console.error('Error checking inventory:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

async function checkInventoryLightweight() {
    console.log(`[MODE] Lightweight Check (ScrapingAnt) at: ${new Date().toISOString()}`);
    const apiKey = process.env.SCRAPING_API_KEY;

    // Simplified but robust query
    const query = {
        "query": {
            "model": "my",
            "condition": "new",
            "options": {
                "PAINT": ["WHITE"],
                "INTERIOR": ["PREMIUM_BLACK"]
            },
            "partition": "international",
            "region": "US",
            "zip": CONFIG.zip,
            "range": 50
        },
        "offset": 0,
        "count": 50
    };

    const apiUrl = `https://www.tesla.com/inventory/api/v4/inventory-results?query=${encodeURIComponent(JSON.stringify(query))}`;

    // Using ScrapingAnt with US residential proxies and browser rendering
    const scrapingAntUrl = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(apiUrl)}&x-api-key=${apiKey}&proxy_type=residential&proxy_country=US&browser=true`;

    try {
        console.log(`[DATA] Querying Tesla API via ScrapingAnt...`);
        const response = await fetch(scrapingAntUrl);

        if (!response.ok) {
            console.error(`[ERROR] ScrapingAnt API error: ${response.status}`);
            // If we get an error, fallback to notify Discord about the failure if status is enabled
            if (process.env.SEND_STATUS_SMS === 'true') {
                await sendDiscordNotification([], [], 0, CONFIG.targetUrl);
            }
            return;
        }

        const data = await response.json();
        let allCars = data.results || [];
        console.log(`[DATA] Successfully fetched ${allCars.length} vehicles.`);

        // --- Filtering Logic ---
        const exactMatches = [];
        const alternatives = [];

        allCars.forEach(car => {
            const options = car.OptionCodeList || [];
            const trimName = car.TrimName || '';

            const matchesTrim = options.includes(CONFIG.filters.trim) || options.includes('MTY13') || trimName.includes('REAR-WHEEL');
            const matchesPaint = options.includes('PAINT_' + CONFIG.filters.paint);
            const matchesInterior = options.includes('INTERIOR_' + CONFIG.filters.interior) || options.includes('INT_BLACK_PREMIUM') || options.includes('INPB0');

            if (matchesPaint && matchesInterior && matchesTrim) {
                exactMatches.push(car);
            } else {
                alternatives.push(car);
            }
        });

        console.log(`[FILTER] Found ${exactMatches.length} exact matches and ${alternatives.length} alternatives.`);

        if (alternatives.length > 0) {
            alternatives.sort((a, b) => (carPrice(a) - carPrice(b)));
        }

        await sendDiscordNotification(exactMatches, alternatives, allCars.length, CONFIG.targetUrl);

    } catch (error) {
        console.error('[ERROR] Lightweight check failed:', error);
    }
}

// Helper to get price safely
function carPrice(car) {
    return car.Price || 0;
}

async function main() {
    if (process.env.SCRAPING_API_KEY) {
        await checkInventoryLightweight();
    } else {
        await checkInventory();
    }
}

main();


