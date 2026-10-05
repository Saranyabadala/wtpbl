import 'dotenv/config';
import { connectDB, disconnectDB } from '../src/db.js';
import { Restaurant } from '../src/models/Restaurant.js';
import { Dish } from '../src/models/Dish.js';
import { getImageForQuery } from '../src/utils/unsplash.js';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const PLACEHOLDER_URLS = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800&h=600',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1200&h=400',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
];

function isMissingOrPlaceholder(url) {
  if (!url) return true;
  return PLACEHOLDER_URLS.some(p => url.includes('1546069901-ba9599a7e63c'));
}

async function enrichImages() {
  const dbInfo = await connectDB();
  console.log(`[enrich] connected (${dbInfo.inMemory ? 'in-memory' : 'MONGODB_URI'})`);

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.error('Error: UNSPLASH_ACCESS_KEY is not set in .env');
    return;
  }

  const usedImageUrls = new Set();
  
  // Keep track of counts for reporting
  let updatedRestaurants = 0;
  let updatedDishes = 0;

  try {
    // 1. Process Restaurants
    const restaurants = await Restaurant.find({});
    console.log(`[enrich] Processing ${restaurants.length} existing restaurants...`);
    
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      
      if (!isMissingOrPlaceholder(restaurant.image_url)) {
        usedImageUrls.add(restaurant.image_url);
        continue;
      }
      
      const query = `${restaurant.name} ${restaurant.cuisine_type} food`.toLowerCase();
      console.log(`Restaurant ${i + 1}/${restaurants.length}: Fetching for "${query}"`);
      
      const imageResults = await getImageForQuery(query);
      
      if (imageResults && imageResults.length > 0) {
        // Find first unused image
        let selected = imageResults.find(img => !usedImageUrls.has(img.url));
        if (!selected) selected = imageResults[0]; // fallback to first if all used
        
        usedImageUrls.add(selected.url);
        
        await Restaurant.findByIdAndUpdate(restaurant._id, {
          $set: {
            image_query: query,
            image_url: selected.url,
            image_author: selected.author,
            image_author_url: selected.authorUrl
          }
        });
        updatedRestaurants++;
        console.log(`  -> Saved unique image URL`);
      } else {
        console.log(`  -> No image found or error`);
      }
      
      await delay(1000); 
    }

    // 2. Process Dishes
    const dishes = await Dish.find({});
    console.log(`[enrich] Processing ${dishes.length} existing dishes...`);
    
    for (let i = 0; i < dishes.length; i++) {
      const dish = dishes[i];
      
      if (!isMissingOrPlaceholder(dish.image_url)) {
        usedImageUrls.add(dish.image_url);
        continue;
      }
      
      const query = `${dish.name} indian food`.toLowerCase();
      console.log(`Dish ${i + 1}/${dishes.length}: Fetching for "${query}"`);
      
      const imageResults = await getImageForQuery(query);
      
      if (imageResults && imageResults.length > 0) {
        let selected = imageResults.find(img => !usedImageUrls.has(img.url));
        if (!selected) selected = imageResults[0];
        
        usedImageUrls.add(selected.url);
        
        await Dish.findByIdAndUpdate(dish._id, {
          $set: {
            image_query: query,
            image_url: selected.url,
            image_author: selected.author,
            image_author_url: selected.authorUrl
          }
        });
        updatedDishes++;
        console.log(`  -> Saved unique image URL`);
      } else {
        console.log(`  -> No image found or error`);
      }
      
      await delay(1000);
    }
    
    console.log('[enrich] Enrichment complete!');
    console.log(`[enrich] ${updatedRestaurants} restaurants updated.`);
    console.log(`[enrich] ${updatedDishes} dishes updated.`);
  } catch (error) {
    if (error.message && error.message.startsWith('RATE_LIMIT')) {
      console.warn(`\n[enrich] Gracefully stopping: Rate limit reached (${error.message}).`);
    } else {
      console.error('[enrich] Unexpected error:', error);
    }
  }
}

enrichImages()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[enrich] failed:', err);
    try {
      await disconnectDB();
    } catch {
      // Already disconnected.
    }
    process.exit(1);
  });
