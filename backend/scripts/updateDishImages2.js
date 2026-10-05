import 'dotenv/config';
import { connectDB, disconnectDB } from '../src/db.js';
import { Dish } from '../src/models/Dish.js';

const manualFixes = {
  "Khubani Raita": "https://media.istockphoto.com/id/881384148/photo/onion-raita-or-salad-or-pyaj-or-kanda-koshimbir.webp?a=1&b=1&s=612x612&w=0&k=20&c=A3vLgT1SaNn9OuPQZjiPlFeiZi_-sg_9eRYgyXTYv2g=",
  "Veg Dum Biryani": "https://images.unsplash.com/photo-1596560520688-e1ecc9da2099?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "Chicken Dum Biryani": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMGJpcml5YW5pfGVufDB8fDB8fHww",
  "Baked Sweet Potato Fries": "https://images.unsplash.com/photo-1598679253544-2c97992403ea?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3dlZXQlMjBwb3RhdG8lMjBmcmllc3xlbnwwfHwwfHx8MA%3D%3D",
  "Jain Paneer Tikka": "https://media.istockphoto.com/id/1085158128/photo/malai-or-achari-paneer-in-a-gravy-made-using-red-gravy-and-green-capsicum-served-in-a-bowl.webp?a=1&b=1&s=612x612&w=0&k=20&c=H5vUcgcoA8ZmYehaStBB-De3KnM-pgHYQrPuYCYwASw=",
  "Jain Khichdi": "https://images.unsplash.com/photo-1789991184412-c29c9dfa2b39?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8a2ljaGFkaSUyMHJlY2lwZXxlbnwwfHwwfHx8MA%3D%3D",
  "Boiled Egg Bhurji": "https://media.istockphoto.com/id/1368188228/photo/classic-indian-breakfast-egg-bhurji-is-a-spicy-mouth-watering-spin-on-scrambled-eggs-closeup.webp?a=1&b=1&s=612x612&w=0&k=20&c=bl-M886MOURjFARpWNu872r1eSV4rhimhZiH3-RqcAM=",
  "Gujarati Dal": "https://media.istockphoto.com/id/1317288287/photo/indian-popular-food-dal-fry-or-traditional-dal-tadka-curry-served-in-pan.webp?a=1&b=1&s=612x612&w=0&k=20&c=oJgMnYZ7e4LW9yT_giko9t0iyeaoGQ0fZFf690oSfm8=",
  "Khaman Dhokla": "https://media.istockphoto.com/id/1219181275/photo/savory-item-gujarati-khaman-dhokla-a-all-day-sync-delicacy-home-cooked-kalyan.webp?a=1&b=1&s=612x612&w=0&k=20&c=kM5Jkxv1yZf-5BH1ToVkssyUuXdehO-FpDN8MSQMqL0=",
  "Methi Thepla": "https://media.istockphoto.com/id/2293984681/photo/gujarati-dhepla-served-with-pickle.webp?a=1&b=1&s=612x612&w=0&k=20&c=EcSrR-fL7irgEyD4kjpyFfck5K63GE3ZUlcqSG469dU=",
  "GF Margherita (gluten free base)": "https://images.unsplash.com/photo-1671106681075-5a7233268cbd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFyZ2FyaXRhJTIwcGl6emF8ZW58MHx8MHx8fDA%3D",
  "Margherita Pizza": "https://images.unsplash.com/photo-1627626775846-122b778965ae?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFyZ2FyaXRhJTIwcGl6emF8ZW58MHx8MHx8fDA%3D",
  "Grilled Chicken Breast": "https://media.istockphoto.com/id/928823336/photo/grilled-chicken-breast-fried-chicken-fillet-and-fresh-vegetable-salad-of-tomatoes-cucumbers.webp?a=1&b=1&s=612x612&w=0&k=20&c=wZjhND_BlqBhbilaVkNrzIEmi9Yl0SEDg16Wu6yu5zQ=",
  "Mushroom Risotto": "https://plus.unsplash.com/premium_photo-1694850980302-f568e6de0f6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bXVzaHJvb20lMjByaXNvdG98ZW58MHx8MHx8fDA%3D",
  "Quinoa Veg Bowl": "https://media.istockphoto.com/id/1622421036/photo/food-in-display-for-the-photo-shoot.webp?a=1&b=1&s=612x612&w=0&k=20&c=Kr2crRxG-g4YFhSefq1qNqkaqEVVtfF185GviyM4p6U=",
  "Bhel Puri": "https://media.istockphoto.com/id/1477525518/photo/image-of-unrecognisable-person-holding-blue-plastic-bucket-displaying-paper-cones-full-of.webp?a=1&b=1&s=612x612&w=0&k=20&c=AnfAJH7XYsAaBKcYFbar5ggK45BVLu9Ygija_gpHPvI=",
  "Chapati (2 pcs)": "https://media.istockphoto.com/id/516359240/photo/bhendi-masala-or-bhindi-masala-ladies-finger-curry-with-chapati.webp?a=1&b=1&s=612x612&w=0&k=20&c=3ULZ1ByzF6yEEbXplNV3rzvH5XE0Q3YDv5_gIbYXzIo=",
  "Thecha Rice": "https://media.istockphoto.com/id/1319788114/photo/sweet-pongal-indian-festival-food-stock-image.webp?a=1&b=1&s=612x612&w=0&k=20&c=hu5HUODjYB27xm6F7PULiZr_QQuyNscBye6V3RESv9k=",
  "Steamed Idli Manchurian": "https://images.unsplash.com/photo-1572363644253-3daacc7acd0d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aWRseSUyMG1hbmNodXJpYW58ZW58MHx8MHx8fDA%3D",
  "Veg Spring Roll": "https://images.unsplash.com/photo-1633945488007-0d579b145361?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwc3ByaW5nJTIwcm9vbHN8ZW58MHx8MHx8fDA%3D",
  "Khichdi": "https://th.bing.com/th/id/OIP.5_ixf-p5hsbmeI5SGHfyAQHaGA?w=228&h=185&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
  "Plain Roti (2 pcs)": "https://images.unsplash.com/photo-1586524068358-77d2196875e7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cm90aXxlbnwwfHwwfHx8MA%3D",
  "Aloo Paratha": "https://media.istockphoto.com/id/1279134709/photo/image-of-metal-tray-with-aloo-paratha-pile-topped-with-red-onion-rings-and-sprinkle-of.webp?a=1&b=1&s=612x612&w=0&k=20&c=BqI3olbZz2Ljg3LaEiLWYq2vQ8wfORCYdPrwKmJ2WbU=",
  "Dal Baati": "https://th.bing.com/th/id/OIP.3sweQRdyjLUSXcvrg9d9lgHaJ3?w=135&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
  "Jain Sambhar Idli": "https://images.unsplash.com/photo-1680359873197-c3eb21ec05c0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aWRseSUyMHNhbWJhcnxlbnwwfHwwfHx8MA%3D%3D",
  "Jain Dhokla": "https://plus.unsplash.com/premium_photo-1691030658477-1c8decbdfb18?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZG9raGxhJTIwcmVjaXBlfGVufDB8fDB8fHww",
  "Masala Chaas": "https://media.istockphoto.com/id/1159362126/photo/spiced-buttermilk.webp?a=1&b=1&s=612x612&w=0&k=20&c=ziGdjFvR__4mNGHhR9J3o_eBbor-LWBt-2oGorhpcU0=",
  "Jaggery Churma": "https://media.istockphoto.com/id/503402487/photo/panjeeri-in-clay-pot.webp?a=1&b=1&s=612x612&w=0&k=20&c=qvlyKJP8npYpE4H9PnCC63in-511GGjG49cLA0_VkW0=",
  "Jain Sugar Free Barfi": "https://media.istockphoto.com/id/1454920347/photo/chana-badam-burfi-roasted-gram-flour-and-almonds-sweet-dessert.webp?a=1&b=1&s=612x612&w=0&k=20&c=bq534exbRltgfPsD_f_JTEsZht4RNPoUr6Ku5VT_MxQ=",
  "Schezwan Chicken": "https://images.unsplash.com/photo-1789990653630-921eda98b866?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2NoZXp3YW4lMjBjaGlja2VuJTIwcmljZXxlbnwwfHwwfHx8MA%3D%3D",
  "Grilled Paneer Tikka": "https://images.unsplash.com/photo-1680359870402-5cc2954e50c6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGdyaWxsZWQlMjBwYW5uZXIlMjB0aWtrYXxlbnwwfHwwfHx8MA%3D%3D",
  "Idli Fry": "https://media.istockphoto.com/id/1088701148/photo/masala-fried-idlies-south-indian-snack-made-using-with-leftover-idly-served-with-tomato.webp?a=1&b=1&s=612x612&w=0&k=20&c=WH-0nTOOFo_xbAC5K89wbFIP9xJzn8bkthQLNWarGhU="
};

async function fixDishImages() {
  const dbInfo = await connectDB();
  console.log(`[update] connected (${dbInfo.inMemory ? 'in-memory' : 'MONGODB_URI'})`);

  let updatedCount = 0;
  let totalProvided = Object.keys(manualFixes).length;

  try {
    const allDishes = await Dish.find({});
    
    for (const [name, url] of Object.entries(manualFixes)) {
      const match = allDishes.find((dish) => dish.name === name);
      
      if (match) {
        await Dish.findByIdAndUpdate(match._id, { $set: { image_url: url } });
        updatedCount++;
      } else {
        console.warn(`[update] Warning: Still not found - "${name}"`);
      }
    }

    console.log('\n--- SUMMARY ---');
    console.log(`Updated: ${updatedCount}`);
    console.log(`Total Fixes: ${totalProvided}`);
    console.log('------------------\n');

  } catch (error) {
    console.error('[update] Unexpected error:', error);
  }
}

fixDishImages()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[update] failed:', err);
    try {
      await disconnectDB();
    } catch { }
    process.exit(1);
  });
