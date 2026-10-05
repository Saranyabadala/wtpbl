import 'dotenv/config';
import { connectDB, disconnectDB } from '../src/db.js';
import { Dish } from '../src/models/Dish.js';

const dishImages = {
  "Raita": "https://media.istockphoto.com/id/1056787708/photo/sauce-of-yogurt-with-herbs-spices-and-cucumber-close-up-on-the-table-raita-horizontal-top-view.webp?a=1&b=1&s=612x612&w=0&k=20&c=SflOXrv1hHLOpJ5_s2Qv2_eEiWkQBPKTe2R_3JIE-Pw=",
  "kubani raita": "https://media.istockphoto.com/id/881384148/photo/onion-raita-or-salad-or-pyaj-or-kanda-koshimbir.webp?a=1&b=1&s=612x612&w=0&k=20&c=A3vLgT1SaNn9OuPQZjiPlFeiZi_-sg_9eRYgyXTYv2g=",
  "veg dum biriyani": "https://images.unsplash.com/photo-1596560520688-e1ecc9da2099?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "chicken 65": "https://images.unsplash.com/photo-1727280376746-b89107a5b0df?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "chicken biriyani": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMGJpcml5YW5pfGVufDB8fDB8fHww",
  "mirchi ka salan": "https://media.istockphoto.com/id/1459639785/photo/mirchi-or-mirch-ka-salan-green-chilly-sabzi-it-is-a-popular-indian-chili-and-peanut-curry.webp?a=1&b=1&s=612x612&w=0&k=20&c=7YXAawFaBGAilWk9VBt4oZCIceaUT1T9W95VuQDJuI0=",
  "grilled chicken burger": "https://plus.unsplash.com/premium_photo-1695758787947-0aff87c1f93a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z3JpbGxlZCUyMGNoaWNrZW4lMjBidXJnZXJ8ZW58MHx8MHx8fDA%3D",
  "bakes sweet potato fries": "https://images.unsplash.com/photo-1598679253544-2c97992403ea?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3dlZXQlMjBwb3RhdG8lMjBmcmllc3xlbnwwfHwwfHx8MA%3D%3D",
  "french fries": "https://images.unsplash.com/photo-1664337873087-ac64b3f1e454?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHN3ZWV0JTIwcG90YXRvJTIwZnJpZXN8ZW58MHx8MHx8fDA%3D",
  "onion rings": "https://images.unsplash.com/photo-1766589152198-38630c391dfb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8b25pb24lMjByaW5nfGVufDB8fDB8fHww",
  "peri peri chicken wings": "https://images.unsplash.com/photo-1650939986300-ce9609921fa7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVyaSUyMHBlcmklMjBjaGlja2VuJTIwd2luZ3xlbnwwfHwwfHx8MA%3D%3D",
  "veg burger": "https://plus.unsplash.com/premium_photo-1695758787947-0aff87c1f93a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHZlZyUyMGJ1cmdlcnxlbnwwfHwwfHx8MA%3D%3D",
  "jain dal": "https://media.istockphoto.com/id/1130228942/photo/indian-dal-traditional-indian-soup-lentils-indian-dhal-spicy-curry-in-bowl-spices-herbs.webp?a=1&b=1&s=612x612&w=0&k=20&c=eFoLQ1ohrxR6brCwPGDdyvXN3t5lRCtSPhbcJH10yb4=",
  "jain panner tikka": "https://media.istockphoto.com/id/1085158128/photo/malai-or-achari-paneer-in-a-gravy-made-using-red-gravy-and-green-capsicum-served-in-a-bowl.webp?a=1&b=1&s=612x612&w=0&k=20&c=H5vUcgcoA8ZmYehaStBB-De3KnM-pgHYQrPuYCYwASw=",
  "jain kichadi": "https://images.unsplash.com/photo-1789991184412-c29c9dfa2b39?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8a2ljaGFkaSUyMHJlY2lwZXxlbnwwfHwwfHx8MA%3D%3D",
  "jain rotli": "https://media.istockphoto.com/id/1660906222/photo/silver-tray-with-chapati-dal-and-sabji-puree-free-food-for-pilgrims-in-langar-at-gurudwara.webp?a=1&b=1&s=612x612&w=0&k=20&c=llv6dVlls5ZzHhLEZVuykJsKFB47NhWDxuxV5_iDXWU=",
  "jain vadapav": "https://images.unsplash.com/photo-1769030905851-c0e0a4fe5c51?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8JTNEdmFkYSUyMHBhdnxlbnwwfHwwfHx8MA%3D%3D",
  "boiled egg burji": "https://media.istockphoto.com/id/1368188228/photo/classic-indian-breakfast-egg-bhurji-is-a-spicy-mouth-watering-spin-on-scrambled-eggs-closeup.webp?a=1&b=1&s=612x612&w=0&k=20&c=bl-M886MOURjFARpWNu872r1eSV4rhimhZiH3-RqcAM=",
  "egg curry": "https://images.unsplash.com/photo-1764315197254-94385571df22?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWdnJTIwY3Vycnl8ZW58MHx8MHx8fDA%3D",
  "masala raita": "https://media.istockphoto.com/id/1338918012/photo/beetroot-pachadi-a-yogurt-based-beetroot-side-dish.webp?a=1&b=1&s=612x612&w=0&k=20&c=1bXO_Rk8s2Dpl1JuviqJj9mYnihUUSMRYBZW9hwmA2g=",
  "tandoori chicken": "https://plus.unsplash.com/premium_photo-1695931841253-1e17e7ed59b5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGFuZG9vcmklMjBjaGlja2VufGVufDB8fDB8fHww",
  "murgh malai tikka": "https://plus.unsplash.com/premium_photo-1723708871094-2c02cf5f5394?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bXVyZ2glMjBtYWxhaSUyMHRpa2thfGVufDB8fDB8fHww",
  "chicken seekh kebab": "https://plus.unsplash.com/premium_photo-1731512475641-191f7841512e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2hpY2tlbiUyMGtlYmFifGVufDB8fDB8fHww",
  "garlic naan": "https://images.unsplash.com/photo-1559561724-4ea348cd867f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z2FybGljJTIwbmFhbnxlbnwwfHwwfHx8MA%3D%3D",
  "gujarathi dal": "https://media.istockphoto.com/id/1317288287/photo/indian-popular-food-dal-fry-or-traditional-dal-tadka-curry-served-in-pan.webp?a=1&b=1&s=612x612&w=0&k=20&c=oJgMnYZ7e4LW9yT_giko9t0iyeaoGQ0fZFf690oSfm8=",
  "patra": "https://images.unsplash.com/photo-1518393074848-dbe5f641a735?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGF0cmF8ZW58MHx8MHx8fDA%3D",
  "ghee roast muthi": "https://plus.unsplash.com/premium_photo-1695297516794-8bc77890e35c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Z2hlZSUyMHJvYXN0JTIwbXV0aGl8ZW58MHx8MHx8fDA%3D",
  "undhiyu": "https://images.unsplash.com/photo-1645432524571-0e469b22e43f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dW5kaGl5dXxlbnwwfHwwfHx8MA%3D%3D",
  "kaman dhokla": "https://media.istockphoto.com/id/1219181275/photo/savory-item-gujarati-khaman-dhokla-a-all-day-sync-delicacy-home-cooked-kalyan.webp?a=1&b=1&s=612x612&w=0&k=20&c=kM5Jkxv1yZf-5BH1ToVkssyUuXdehO-FpDN8MSQMqL0=",
  "methi tephla": "https://media.istockphoto.com/id/2293984681/photo/gujarati-dhepla-served-with-pickle.webp?a=1&b=1&s=612x612&w=0&k=20&c=EcSrR-fL7irgEyD4kjpyFfck5K63GE3ZUlcqSG469dU=",
  "handvo": "https://media.istockphoto.com/id/2154971942/photo/gujrati-food-handvo-decorated-with-mint-chutney-curry-leaves-lemons-and-tomato-sauce.webp?a=1&b=1&s=612x612&w=0&k=20&c=QJXsNVqKAa7VRQP_0cEnIgzlbLV4T11JvncKnGwXrbs=",
  "rotli": "https://images.unsplash.com/photo-1600935926387-12d9b03066f0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cm90aXxlbnwwfHwwfHx8MA%3D%3D",
  "fafda jalebi": "https://images.unsplash.com/photo-1588027781880-2c213c365001?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFmZGElMjBqYWxlYml8ZW58MHx8MHx8fDA%3D",
  "gf margarita": "https://images.unsplash.com/photo-1671106681075-5a7233268cbd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFyZ2FyaXRhJTIwcGl6emF8ZW58MHx8MHx8fDA%3D",
  "grilled veg pizza": "https://images.unsplash.com/photo-1552539618-7eec9b4d1796?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JpbGxlZCUyMHZlZyUyMHBpenphfGVufDB8fDB8fHww",
  "margarita": "https://images.unsplash.com/photo-1627626775846-122b778965ae?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFyZ2FyaXRhJTIwcGl6emF8ZW58MHx8MHx8fDA%3D",
  "garlic bread sticks": "https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FybGljJTIwYnJlYWQlMjBzdGlja3xlbnwwfHwwfHx8MA%3D%3D",
  "grilled salmon": "https://plus.unsplash.com/premium_photo-1726768907990-d3cbc8efdee5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z3JpbGxlZCUyMHNhbG1vbnxlbnwwfHwwfHx8MA%3D%3D",
  "grileld chicken breast": "https://media.istockphoto.com/id/928823336/photo/grilled-chicken-breast-fried-chicken-fillet-and-fresh-vegetable-salad-of-tomatoes-cucumbers.webp?a=1&b=1&s=612x612&w=0&k=20&c=wZjhND_BlqBhbilaVkNrzIEmi9Yl0SEDg16Wu6yu5zQ=",
  "steak with rosemary": "https://plus.unsplash.com/premium_photo-1723672929404-36ba6ed8ab50?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3RlYWt8ZW58MHx8MHx8fDA%3D",
  "mushroom risoto": "https://plus.unsplash.com/premium_photo-1694850980302-f568e6de0f6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bXVzaHJvb20lMjByaXNvdG98ZW58MHx8MHx8fDA%3D",
  "grilled fish": "https://images.unsplash.com/photo-1556814901-18c866c057da?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JpbGxlZCUyMGZpc2h8ZW58MHx8MHx8fDA%3D",
  "sol kadhi": "https://media.istockphoto.com/id/878084786/photo/solkadhi-or-sol-kadhi-a-famous-drink-from-goa-or-maharashtras-konkan-region.webp?a=1&b=1&s=612x612&w=0&k=20&c=b7Lu1xBy0f95wFsMnFBRRnE6ov3w7x6s4DBkEc21OrA=",
  "fish curry rawa": "https://images.unsplash.com/photo-1708782345549-7285b1c977d6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmlzaCUyMGN1cnJ5JTIwcmF3YXxlbnwwfHwwfHx8MA%3D%3D",
  "rice and fish curry combo": "https://plus.unsplash.com/premium_photo-1695456065048-52a053ce9dd2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZmlzaCUyMGN1cnJ5JTIwcmF3YXxlbnwwfHwwfHx8MA%3D%3D",
  "pork vindalo": "https://images.unsplash.com/photo-1681586745894-a049bcf07499?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cG9yayUyMHZpbmRhbG98ZW58MHx8MHx8fDA%3D",
  "fresh lime soda": "https://plus.unsplash.com/premium_photo-1723489246850-1b45575bd036?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bGltZSUyMHNvZGF8ZW58MHx8MHx8fDA%3D",
  "steamed moong dal chilla": "https://media.istockphoto.com/id/2224994537/photo/moong-dal-chilla-is-a-savory-indian-pancake-made-from-ground-moong-lentils-spiced-with-herbs.webp?a=1&b=1&s=612x612&w=0&k=20&c=MetGBkrfiY_xOQjp2oX52nP1NAUfScGby5KTtKRLIDI=",
  "quinwa veg bowl": "https://media.istockphoto.com/id/1622421036/photo/food-in-display-for-the-photo-shoot.webp?a=1&b=1&s=612x612&w=0&k=20&c=Kr2crRxG-g4YFhSefq1qNqkaqEVVtfF185GviyM4p6U=",
  "pani puri": "https://images.unsplash.com/photo-1708782340355-78977df48202?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGFuaSUyMHB1cml8ZW58MHx8MHx8fDA%3D",
  "behl puri": "https://media.istockphoto.com/id/1477525518/photo/image-of-unrecognisable-person-holding-blue-plastic-bucket-displaying-paper-cones-full-of.webp?a=1&b=1&s=612x612&w=0&k=20&c=AnfAJH7XYsAaBKcYFbar5ggK45BVLu9Ygija_gpHPvI=",
  "dahi puri": "https://media.istockphoto.com/id/2234618163/photo/dahi-puri-chat-indian-snack-dahi-batata-puri.webp?a=1&b=1&s=612x612&w=0&k=20&c=3_8Kjwi2_Nkn4SKYVDB4VnG1u5jl7ZkdehuGC0aNaxk=",
  "chapathi": "https://media.istockphoto.com/id/516359240/photo/bhendi-masala-or-bhindi-masala-ladies-finger-curry-with-chapati.webp?a=1&b=1&s=612x612&w=0&k=20&c=3ULZ1ByzF6yEEbXplNV3rzvH5XE0Q3YDv5_gIbYXzIo=",
  "dal kolhapuri": "https://media.istockphoto.com/id/1226250249/photo/indian-food-dishes-on-the-table.webp?a=1&b=1&s=612x612&w=0&k=20&c=xi0M_RhH8VMicDEQFiu83JH7kNZ98fEZFFAdCTTKj1M=",
  "techa rice": "https://media.istockphoto.com/id/1319788114/photo/sweet-pongal-indian-festival-food-stock-image.webp?a=1&b=1&s=612x612&w=0&k=20&c=hu5HUODjYB27xm6F7PULiZr_QQuyNscBye6V3RESv9k=",
  "batata bhaji": "https://media.istockphoto.com/id/1318014662/photo/indian-style-spring-onion-stir-fry-in-bowl.webp?a=1&b=1&s=612x612&w=0&k=20&c=sKWKIAgLuRyvnC3sG6hjy148UXj7oeKFPvr7LvMxlt4=",
  "misal pav": "https://plus.unsplash.com/premium_photo-1695293743906-24238c47cd91?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fG1pc2FsJTIwcGF2fGVufDB8fDB8fHww",
  "sabudana vada": "https://images.unsplash.com/photo-1603554593710-89285666b691?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FidWRhbmElMjB2YWRhfGVufDB8fDB8fHww",
  "gulab jamun": "https://media.istockphoto.com/id/163064596/photo/gulab-jamun.webp?a=1&b=1&s=612x612&w=0&k=20&c=F_5_AgCdrsecO13W-wiuCZAwYZPBpN3UETTyYtQQlLM=",
  "strong filter coffee": "https://media.istockphoto.com/id/1207655316/photo/view-of-filter-coffee-in-a-stainless-steel-tumbler-chennai-is-famous-for-authentic-filter.webp?a=1&b=1&s=612x612&w=0&k=20&c=c3nrcxNWC0IQEzE6oiA2if0kynCd-M6Elo4vblW9_aY=",
  "clear soup": "https://images.unsplash.com/photo-1652088079703-38f4a8d6b981?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2xlYXIlMjBzb3VwfGVufDB8fDB8fHww",
  "hakka chilli vegetables": "https://images.unsplash.com/photo-1617622141675-d3005b9067c5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aGFra2ElMjBjaGlsbGklMjB2ZWdldGFibGVzfGVufDB8fDB8fHww",
  "teamed idly manchurian": "https://images.unsplash.com/photo-1572363644253-3daacc7acd0d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aWRseSUyMG1hbmNodXJpYW58ZW58MHx8MHx8fDA%3D",
  "steamed momos": "https://plus.unsplash.com/premium_photo-1673769108070-580fe90b8de7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3RlYW1lZCUyMG1vbW9zfGVufDB8fDB8fHww",
  "chilli garlic noodles": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpbGxpJTIwZ2FybGljJTIwbm9vZGxlc3xlbnwwfHwwfHx8MA%3D%3D",
  "veg spring rolls": "https://images.unsplash.com/photo-1633945488007-0d579b145361?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnJTIwc3ByaW5nJTIwcm9vbHN8ZW58MHx8MHx8fDA%3D",
  "vadapav": "https://media.istockphoto.com/id/2168834306/photo/selective-focus-of-mumbais-famous-street-food-delicious-vada-pav-with-coriander-leave-chutney.webp?a=1&b=1&s=612x612&w=0&k=20&c=uITRUZVM-l6F1FgjENixVQ6Zgu3qM1FXCxsa36E5IeM=",
  "dabeli": "https://media.istockphoto.com/id/1206457944/photo/dabeli-is-a-popular-snack-food-of-india.webp?a=1&b=1&s=612x612&w=0&k=20&c=qhuGtA7306O5-qnQC_s1sicni5LJU5FT_KKEQuwe-oY=",
  "kichadi": "https://th.bing.com/th/id/OIP.5_ixf-p5hsbmeI5SGHfyAQHaGA?w=228&h=185&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
  "palin roti": "https://images.unsplash.com/photo-1586524068358-77d2196875e7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cm90aXxlbnwwfHwwfHx8MA%3D%3D",
  "plain curd": "https://media.istockphoto.com/id/1218711576/photo/home-made-curd-in-a-earthen-bowl.webp?a=1&b=1&s=612x612&w=0&k=20&c=2KQlJ-S1zX2aXcjMM1UIqSwG7imDk6WohqvjuAj-Cn8=",
  "steamed rice": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3RlYW1lZCUyMHJpY2V8ZW58MHx8MHx8fDA%3D",
  "ghee dal tadka": "https://images.unsplash.com/photo-1736680056444-02b10f16a245?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZGFsJTIwdGFka2F8ZW58MHx8MHx8fDA%3D",
  "aloo parata": "https://media.istockphoto.com/id/1279134709/photo/image-of-metal-tray-with-aloo-paratha-pile-topped-with-red-onion-rings-and-sprinkle-of.webp?a=1&b=1&s=612x612&w=0&k=20&c=BqI3olbZz2Ljg3LaEiLWYq2vQ8wfORCYdPrwKmJ2WbU=",
  "dal batti": "https://th.bing.com/th/id/OIP.3sweQRdyjLUSXcvrg9d9lgHaJ3?w=135&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
  "jain idly sambar": "https://images.unsplash.com/photo-1680359873197-c3eb21ec05c0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aWRseSUyMHNhbWJhcnxlbnwwfHwwfHx8MA%3D%3D",
  "jain dokhla": "https://plus.unsplash.com/premium_photo-1691030658477-1c8decbdfb18?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZG9raGxhJTIwcmVjaXBlfGVufDB8fDB8fHww",
  "jain thali": "https://images.unsplash.com/photo-1742281257687-092746ad6021?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGhhbGl8ZW58MHx8MHx8fDA%3D",
  "jain upma": "https://images.unsplash.com/photo-1630409349197-b733a524b24e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXBtYXxlbnwwfHwwfHx8MA%3D%3D",
  "masala chass": "https://media.istockphoto.com/id/1159362126/photo/spiced-buttermilk.webp?a=1&b=1&s=612x612&w=0&k=20&c=ziGdjFvR__4mNGHhR9J3o_eBbor-LWBt-2oGorhpcU0=",
  "ker sangri": "https://media.istockphoto.com/id/508668707/photo/fried-bird-spiders.webp?a=1&b=1&s=612x612&w=0&k=20&c=NCGTa9T0Q8ueph-n-h7aURkSmGmiBnSNvDp_gO1VAcc=",
  "dal baati churma": "https://media.istockphoto.com/id/1337466915/photo/rajasthani-traditional-cuisine-dal-baati-also-know-as-dal-bati-or-daal-baati-churma-on-wooden.webp?a=1&b=1&s=612x612&w=0&k=20&c=EAK9axsQSaolcd6TwyakNLtDeJv6LCWnFtK-bB_q0fs=",
  "gatte ki sabzi": "https://images.unsplash.com/photo-1652545296893-ff9227b3512e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2F0dGUlMjBraSUyMHNhYnppfGVufDB8fDB8fHww",
  "jaggrey churma": "https://media.istockphoto.com/id/503402487/photo/panjeeri-in-clay-pot.webp?a=1&b=1&s=612x612&w=0&k=20&c=qvlyKJP8npYpE4H9PnCC63in-511GGjG49cLA0_VkW0=",
  "pyaaz kachori": "https://media.istockphoto.com/id/1442438407/photo/shegaon-kachori-or-aloo-pyaz-ki-kachodi-served-with-green-and-red-chutney-fried-green-chilies.webp?a=1&b=1&s=612x612&w=0&k=20&c=wBfPmIon8lt8zKL_4dr_CM38hNjBvFQ94E4y6URpYQ8=",
  "sugar free ladoo": "https://images.unsplash.com/photo-1605276277265-84f97980a425?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bGFkb298ZW58MHx8MHx8fDA%3D",
  "jain suger free barfi": "https://media.istockphoto.com/id/1454920347/photo/chana-badam-burfi-roasted-gram-flour-and-almonds-sweet-dessert.webp?a=1&b=1&s=612x612&w=0&k=20&c=bq534exbRltgfPsD_f_JTEsZht4RNPoUr6Ku5VT_MxQ=",
  "sugar free kaju katli": "https://media.istockphoto.com/id/1283207206/photo/cashew-katli.webp?a=1&b=1&s=612x612&w=0&k=20&c=yi2jOyRm6W7VBJTeBYuTbH4QW3tk1M3Ow9JegUcGaEk=",
  "sugar free halwa": "https://media.istockphoto.com/id/1352483057/photo/moong-dal-halwa.webp?a=1&b=1&s=612x612&w=0&k=20&c=0FiX6JDlRUf9ZCS1DmsIGCsiL4ryllAT9Dx9y_dNCQU=",
  "chicken manchurian": "https://media.istockphoto.com/id/1072951524/photo/indian-chilli-chicken-dry-served-in-a-plate-over-moody-background-selective-focus.webp?a=1&b=1&s=612x612&w=0&k=20&c=uevLlv5O-y_aXwm4EAbmrttsWST7aTKxXriod8c2Dc0=",
  "burnt garlic rice": "https://images.unsplash.com/photo-1664717698774-84f62382613b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnVybnQlMjBnYXJsaWMlMjByaWNlfGVufDB8fDB8fHww",
  "shezwan chicken rice": "https://images.unsplash.com/photo-1789990653630-921eda98b866?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2NoZXp3YW4lMjBjaGlja2VuJTIwcmljZXxlbnwwfHwwfHx8MA%3D%3D",
  "dal shorba": "https://media.istockphoto.com/id/886538724/photo/delicious-lentil-soup.webp?a=1&b=1&s=612x612&w=0&k=20&c=KQpnrizkcaOFMyggFVhESBhQFc6QquUidIx0sDFvmiI=",
  "grilled panner tikka": "https://images.unsplash.com/photo-1680359870402-5cc2954e50c6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGdyaWxsZWQlMjBwYW5uZXIlMjB0aWtrYXxlbnwwfHwwfHx8MA%3D%3D",
  "mushroom galouti": "https://media.istockphoto.com/id/1437951082/photo/mushroom-pickle.webp?a=1&b=1&s=612x612&w=0&k=20&c=eiYXe3byRZSbyEc9uco-F0F9vlGUedb-iSQces-Y7yg=",
  "coconut chutney": "https://media.istockphoto.com/id/1083235604/photo/nariyal-or-coconut-chutney-served-in-a-bowl-isolated-over-moody-background-selective-focus.webp?a=1&b=1&s=612x612&w=0&k=20&c=PDeoeXOPEI5AA53LqA7yryRISf7RiKS5lJ2ikLYrzk0=",
  "appam with veg stew": "https://media.istockphoto.com/id/1399646554/photo/traditional-south-indian-breakfast-appam-with-beef-stew-kerala-food.webp?a=1&b=1&s=612x612&w=0&k=20&c=vBwHMEcCIv0tllQGzclav2wnVYDKmBSlE4vP3y6VzzU=",
  "idly fry": "https://media.istockphoto.com/id/1088701148/photo/masala-fried-idlies-south-indian-snack-made-using-with-leftover-idly-served-with-tomato.webp?a=1&b=1&s=612x612&w=0&k=20&c=WH-0nTOOFo_xbAC5K89wbFIP9xJzn8bkthQLNWarGhU=",
  "chettinad chicken curry": "https://images.unsplash.com/photo-1710091691802-7dedb8af9a77?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2hldHRpbmFkJTIwY2hpY2tlbiUyMGN1cnJ5fGVufDB8fDB8fHww",
  "vada curry": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGN1cnJ5fGVufDB8fDB8fHww",
  "rajma chawal": "https://media.istockphoto.com/id/669635320/photo/kidney-bean-curry-or-rajma-or-rajmah-chawal-and-roti-typical-north-indian-main-course.webp?a=1&b=1&s=612x612&w=0&k=20&c=fQvk0ylYuRflBkPZ8aTUHwtcNkdeNqofVH9VjT4C2a0=",
  "kadhi pakora": "https://images.unsplash.com/photo-1765360024331-25b63e85272e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a2FkaSUyMHBha29yYXxlbnwwfHwwfHx8MA%3D%3D",
  "zucchini noodles": "https://images.unsplash.com/photo-1651400374481-555d7e8106d8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8enVjY2hpbmklMjBub29kbGVzfGVufDB8fDB8fHww",
  "Penne Arrabbiata": "https://plus.unsplash.com/premium_photo-1664478288635-b9703a502393?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8UGVubmUlMjBBcnJhYmJpYXRhfGVufDB8fDB8fHww",
  "Grilled Chicken Pasta": "https://plus.unsplash.com/premium_photo-1664472655781-3a2abd8caad8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Z3JpbGxlZCUyMGNoaWNrZW4lMjBwYXN0YXxlbnwwfHwwfHx8MA%3D%3D"
};

async function updateDishImages() {
  const dbInfo = await connectDB();
  console.log(`[update] connected (${dbInfo.inMemory ? 'in-memory' : 'MONGODB_URI'})`);

  let updatedCount = 0;
  let notFoundCount = 0;
  let totalProvided = Object.keys(dishImages).length;

  try {
    const allDishes = await Dish.find({});
    
    // Create a normalized map of all DB dishes for fuzzy matching
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const [name, url] of Object.entries(dishImages)) {
      const normName = normalize(name);
      
      // Try exact or case-insensitive match first
      let matchingDishes = allDishes.filter(
        (dish) => dish.name.toLowerCase() === name.toLowerCase().trim()
      );
      
      // If none, try fuzzy match
      if (matchingDishes.length === 0) {
        matchingDishes = allDishes.filter(
          (dish) => normalize(dish.name) === normName || normalize(dish.name).includes(normName)
        );
      }
      
      if (matchingDishes.length > 0) {
        for (const dish of matchingDishes) {
          await Dish.findByIdAndUpdate(dish._id, {
            $set: { image_url: url }
          });
          updatedCount++;
        }
      } else {
        notFoundCount++;
        console.warn(`[update] Warning: Dish not found - "${name}"`);
      }
    }

    console.log('\n--- SUMMARY ---');
    console.log(`Updated: ${updatedCount}`);
    console.log(`Not found: ${notFoundCount}`);
    console.log(`Total URLs provided: ${totalProvided}`);
    console.log('------------------\n');

  } catch (error) {
    console.error('[update] Unexpected error:', error);
  }
}

updateDishImages()
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
