// Tesla Inventory Monitor for iOS (Scriptable)
// Copy this script into the "Scriptable" app on your iPhone.

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1455437285960192043/Q9JhE03jfIOCONO9ogNEP9q8IgSsTJ9PAB_coUkaG93oITVlWvzKNejE3M2140dt0QlQ";
const ZIP_CODE = "95112";
const MODEL = "my"; // Model Y
const SEARCH_RANGE = 50;

// Filters
const TARGET_PAINT = "WHITE";
const TARGET_TRIM = "PRRWD"; // Model Y RWD
const TARGET_INTERIOR = "PREMIUM_BLACK";

async function checkTesla() {
    console.log("Checking Tesla Inventory...");

    const query = {
        "query": {
            "model": MODEL,
            "condition": "new",
            "options": {},
            "partition": "international",
            "region": "US"
        },
        "offset": 0,
        "count": 50,
        "zip": ZIP_CODE,
        "range": SEARCH_RANGE
    };

    const url = `https://www.tesla.com/inventory/api/v4/inventory-results?query=${encodeURIComponent(JSON.stringify(query))}`;

    let req = new Request(url);
    req.method = "GET";
    req.headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    };

    try {
        let response = await req.loadJSON();
        let cars = response.results || [];
        console.log(`Found ${cars.length} total cars.`);

        let exactMatches = [];
        let alternatives = [];

        cars.forEach(car => {
            const options = car.OptionCodeList || [];
            const trimName = car.TrimName || "";

            const matchesTrim = options.includes(TARGET_TRIM) || options.includes("MTY13") || trimName.includes("REAR-WHEEL");
            const matchesPaint = options.includes("PAINT_" + TARGET_PAINT);
            const matchesInterior = options.includes("INTERIOR_" + TARGET_INTERIOR) || options.includes("INT_BLACK_PREMIUM") || options.includes("INPB0");

            if (matchesPaint && matchesInterior && matchesTrim) {
                exactMatches.push(car);
            } else {
                alternatives.push(car);
            }
        });

        if (exactMatches.length > 0 || alternatives.length > 0) {
            await sendDiscord(exactMatches, alternatives, cars.length);
        } else {
            console.log("No cars found in this scan.");
        }
    } catch (e) {
        console.error("Error fetching Tesla data: " + e);
    }
}

async function sendDiscord(exact, alts, total) {
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL === "YOUR_DISCORD_WEBHOOK_HERE") {
        console.log("No Discord Webhook configured. Use native notification instead.");
        let n = new Notification();
        n.title = exact.length > 0 ? "🚀 Tesla Found!" : "⚠️ Tesla Alternatives";
        n.body = `${exact.length} Exact Matches, ${alts.length} Alts found out of ${total} results.`;
        n.schedule();
        return;
    }

    let embed = {
        title: exact.length > 0 ? "🚀 TESLA MATCH FOUND!" : "⚠️ Tesla Inventory Update",
        color: exact.length > 0 ? 5763719 : 15844367,
        description: `Scanned **${total}** vehicles at ZIP **${ZIP_CODE}**.\n\n` +
            `**Exact Matches**: ${exact.length}\n` +
            `**Alternatives**: ${alts.length}`,
        timestamp: new Date().toISOString()
    };

    let req = new Request(DISCORD_WEBHOOK_URL);
    req.method = "POST";
    req.headers = { "Content-Type": "application/json" };
    req.body = JSON.stringify({
        content: exact.length > 0 ? "@everyone Match Found!" : null,
        embeds: [embed]
    });
    await req.load();
}

await checkTesla();
Script.complete();
