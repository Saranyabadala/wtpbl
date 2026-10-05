import 'dotenv/config';
import { connectDB, disconnectDB } from '../src/db.js';
import { Restaurant } from '../src/models/Restaurant.js';

const restaurantImages = {
  "Chole Bhature Junction": "https://media.istockphoto.com/id/2235673517/photo/chole-bhature-is-a-north-indian-famous-food-dish.jpg?s=1024x1024&w=is&k=20&c=ycwef5keeGBqymY-UBJJUfSokJkAOaDHdVQJwEGDI9w=",
  "Lucknowi Kebab House": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Idli Sambar House": "https://media.istockphoto.com/id/2223331687/photo/delicious-south-indian-breakfast-food-idli-and-vada.jpg?s=1024x1024&w=is&k=20&c=nWRdU5GM_7Hs92O_xIuDuCffvIJd85nHWsfDN0oTySU=",
  "Dosa Corner": "https://images.unsplash.com/photo-1694849789325-914b71ab4075?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Hyderabadi Dum Biryani": "https://media.istockphoto.com/id/1292440006/photo/traditional-hyderabadi-chicken-dum-biryani-made-of-basmati-rice-cooked-with-masala-spices.jpg?s=1024x1024&w=is&k=20&c=NirH2mzhG98O604ey5IBe1DQ2eC3nnNV7Qq8Snc5Cbk=",
  "Saffron Leaf": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Tandoori Nights": "https://images.unsplash.com/photo-1764955193589-f5db4261e02c?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Filter Kaapi": "https://media.istockphoto.com/id/1589593378/photo/filter-coffee.jpg?s=1024x1024&w=is&k=20&c=bsnRd194V6hK160gOoElY7fpq-QqidfEZgGlyowrR0g=",
  "Misal Pavilion": "https://images.unsplash.com/photo-1665156958464-90a8b463e1e6?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Wada Bhatti Centre": "https://images.unsplash.com/photo-1769030905851-c0e0a4fe5c51?q=80&w=726&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Gujarati Bhojan": "https://media.istockphoto.com/id/469160387/photo/gujarati-thali.jpg?s=1024x1024&w=is&k=20&c=wZ6NgcOzRjoVkpTc_LQLwRMn08be2aeG9xr8EurBAew=",
  "Rajasthan Bikaner": "https://media.istockphoto.com/id/843617378/photo/makki-ki-roti-with-rajma-soya-kebab-saag-and-paneer-indian-food.jpg?s=1024x1024&w=is&k=20&c=5NG8g9VwXadBfhjHOIs9cQFVg0BjP7l8FOB5vEddASQ=",
  "Shanghai Tadka": "https://images.unsplash.com/flagged/photo-1556742524-750f2ab99913?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Wok Box": "https://plus.unsplash.com/premium_photo-1731953242910-7abd519e9740?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "The Grill Room": "https://images.unsplash.com/photo-1634408926602-b1d8894a2844?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Salad Bowl": "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Brew & Grill": "https://plus.unsplash.com/premium_photo-1661690640790-9da3c04f90af?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Burger Junction": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Pizza Planet": " https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=781&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Pasta Napoli": "https://images.unsplash.com/photo-1611270629569-8b357cb88da9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Jain Bhojan Sudhar": "https://images.unsplash.com/photo-1630764942866-c353453d927a?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Shree Nath Upadhyay": "https://images.unsplash.com/photo-1723388800779-5699cc142f18?q=80&w=787&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Punjabi Tadka": "https://images.unsplash.com/photo-1755090154817-58d9d36ec988?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Goan Fish House": "https://images.unsplash.com/photo-1654863404432-cac67587e25d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Chettinad Spice": "https://images.unsplash.com/photo-1676436293945-a613dde9c3b6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGNoZXR0aW5hZCUyMGJpcml5YW5pfGVufDB8fDB8fHww",
  "Vada Pav Corner": "https://media.istockphoto.com/id/1329213718/photo/vada-pav.webp?a=1&b=1&s=612x612&w=0&k=20&c=nFSSNL37Rtl6brmMOMiBfaZy0itNgBEO2dnK5I1FlGU=",
  "Pani Puri Junction": "https://images.unsplash.com/photo-1586357507341-3fbe59f2a5d9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFuaSUyMHB1cml8ZW58MHx8MHx8fDA%3D",
  "Dal & Roti Adda": "https://media.istockphoto.com/id/2148780131/photo/bengalis-most-popular-meal-dal-and-roti-in-a-dish-traditional-food-from-bangladesh-and-india.webp?a=1&b=1&s=612x612&w=0&k=20&c=FfmNiaAsDqd1SCjCp_JxRAz9AcuQh74X8Vrb6OGpBTQ=",
  "Sugar Free Sweets": "https://images.unsplash.com/photo-1543773495-2cd9248a5bda?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3dlZXRzfGVufDB8fDB8fHww"
};

async function updateRestaurantImages() {
  const dbInfo = await connectDB();
  console.log(`[update] connected (${dbInfo.inMemory ? 'in-memory' : 'MONGODB_URI'})`);

  let updatedCount = 0;
  let notFoundCount = 0;

  try {
    for (const [name, url] of Object.entries(restaurantImages)) {
      const restaurant = await Restaurant.findOne({ name });
      
      if (restaurant) {
        await Restaurant.findByIdAndUpdate(restaurant._id, {
          $set: {
            image_url: url
          }
        });
        updatedCount++;
      } else {
        notFoundCount++;
        console.warn(`[update] Warning: Restaurant not found - "${name}"`);
      }
    }

    console.log('\n--- VERIFICATION ---');
    const allRestaurants = await Restaurant.find({});
    console.log(`Total restaurants in DB: ${allRestaurants.length}`);
    
    console.log('\nMapped URLs for provided restaurants:');
    for (const r of allRestaurants) {
      console.log(`  ${r.name} -> ${r.image_url}`);
    }

    console.log('\n--- SUMMARY ---');
    console.log(`Restaurants successfully updated: ${updatedCount}`);
    console.log(`Restaurants not found: ${notFoundCount}`);
    console.log('------------------\n');

  } catch (error) {
    console.error('[update] Unexpected error:', error);
  }
}

updateRestaurantImages()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[update] failed:', err);
    try {
      await disconnectDB();
    } catch {
      // Already disconnected.
    }
    process.exit(1);
  });
