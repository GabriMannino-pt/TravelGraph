const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

async function findRealDeal() {
  console.log("Cerco un'offerta reale su Flights Scraper Sky...");
  
  try {
     const res = await fetch(`https://flights-sky.p.rapidapi.com/flights/auto-complete?query=Tenerife`, {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'flights-sky.p.rapidapi.com'
        }
      });
      const data = await res.json();
      console.log("Dati API completi:", JSON.stringify(data, null, 2));
  } catch(e) {
      console.error(e);
  }
}

findRealDeal();
