require("dotenv").config({ path: ".env.local" });

async function main() {
  const keys = process.env.GROQ_API_KEY.split(',');
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: {
      "Authorization": `Bearer ${keys[0]}`
    }
  });
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

main();
