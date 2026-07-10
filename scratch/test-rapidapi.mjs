const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

async function testSkyscanner() {
  console.log("Test Flights Sky API...");
  // Test endpoint generico di ricerca o details
  const res = await fetch(`https://flights-sky.p.rapidapi.com/flights/auto-complete?query=MXP`, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'flights-sky.p.rapidapi.com'
    }
  });
  console.log("Flights Sky Status:", res.status);
  if (!res.ok) {
    const text = await res.text();
    console.log("Flights Sky Error:", text);
  } else {
    console.log("Flights Sky Success! Data received.");
  }
}

async function run() {
  await testSkyscanner();
}

run();
