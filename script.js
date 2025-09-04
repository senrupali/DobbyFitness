const PROXY_URL = "/.netlify/functions/dobby"; // Netlify function endpoint

function mdToHtml(s) {
  return s
    .replace(/^###### (.*)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.*)$/gm, "• $1")
    .replace(/\n/g, "<br>");
}

async function generatePlans() {
  const userInput = document.getElementById("userInput");
  const resultEl = document.getElementById("result");
  const planContent = document.getElementById("plan-content");
  const timestampEl = document.getElementById("timestamp");

  if (!userInput || !resultEl || !planContent || !timestampEl) {
    console.error("Missing required elements");
    return;
  }

  planContent.innerHTML = "<p>Generating roast + plan...</p>";
  resultEl.classList.add("loading");

  try {
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `User request: ${userInput.value}. Roast me and then give me a full workout + diet plan.`,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "No details");
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    const reply = (data.reply || "").trim() || "No response generated.";
    planContent.innerHTML = mdToHtml(reply);

    // Set the timestamp
    const now = new Date();
    const options = {
      timeZone: "Asia/Kolkata", // IST
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    const istTime = now.toLocaleString("en-US", options).replace(",", "");
    timestampEl.textContent = `Generated at: ${istTime} IST`;
  } catch (e) {
    console.error("Error:", e);
    planContent.innerHTML = `<p style="color: #e53e3e;">Failed: ${e.message}</p>`;
  } finally {
    resultEl.classList.remove("loading");
  }
}

document.getElementById("generateBtn").onclick = generatePlans;
