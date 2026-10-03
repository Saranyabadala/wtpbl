/**
 * Demo seed data for HealthPlate.
 *
 * 30 restaurants around Andheri West, Mumbai plus ~150 dishes with realistic
 * health tags and allergens, so the app is fully demoable without the Google
 * Places API or any manual data entry.
 *
 * Run:  npm run seed          (upserts, keeps existing data)
 *       npm run seed:fresh    (drops collections first)
 */

export const RESTAURANTS = [
  { name: 'Saffron Leaf', cuisine: 'North Indian', price: '$$$', area: 'Andheri West', rating: 4.5 },
  { name: 'Tandoori Nights', cuisine: 'North Indian', price: '$$', area: 'Andheri West', rating: 4.2 },
  { name: 'Dosa Corner', cuisine: 'South Indian', price: '$', area: 'Andheri East', rating: 4.4 },
  { name: 'Idli Sambar House', cuisine: 'South Indian', price: '$', area: 'Andheri East', rating: 4.1 },
  { name: 'Filter Kaapi', cuisine: 'South Indian', price: '$', area: 'Bandra West', rating: 4.3 },
  { name: 'Misal Pavilion', cuisine: 'Maharashtrian', price: '$', area: 'Andheri West', rating: 4.6 },
  { name: 'Wada Bhatti Centre', cuisine: 'Maharashtrian', price: '$', area: 'Dadar', rating: 4.0 },
  { name: 'Gujarati Bhojan', cuisine: 'Gujarati', price: '$$', area: 'Andheri West', rating: 4.2 },
  { name: 'Rajasthan Bikaner', cuisine: 'Rajasthani', price: '$$', area: 'Khar', rating: 4.1 },
  { name: 'Hyderabadi Dum Biryani', cuisine: 'Biryani', price: '$$', area: 'Andheri East', rating: 4.5 },
  { name: 'Lucknowi Kebab House', cuisine: 'North Indian', price: '$$', area: 'Bandra East', rating: 4.3 },
  { name: 'Shanghai Tadka', cuisine: 'Chinese', price: '$$', area: 'Andheri West', rating: 4.0 },
  { name: 'Wok Box', cuisine: 'Chinese', price: '$$', area: 'Khar', rating: 3.9 },
  { name: 'The Grill Room', cuisine: 'Continental', price: '$$$$', area: 'Bandra West', rating: 4.7 },
  { name: 'Salad Bowl', cuisine: 'Continental', price: '$$', area: 'Andheri West', rating: 4.2 },
  { name: 'Brew & Grill', cuisine: 'Continental', price: '$$$', area: 'BKC', rating: 4.4 },
  { name: 'Burger Junction', cuisine: 'Fast Food', price: '$', area: 'Andheri East', rating: 3.8 },
  { name: 'Pizza Planet', cuisine: 'Italian', price: '$$', area: 'Andheri West', rating: 4.1 },
  { name: 'Pasta Napoli', cuisine: 'Italian', price: '$$', area: 'Juhu', rating: 4.2 },
  { name: 'Jain Bhojan Sudhar', cuisine: 'Jain', price: '$', area: 'Andheri East', rating: 4.3 },
  { name: 'Shree Nath Upadhyay', cuisine: 'Jain', price: '$', area: 'Dadar East', rating: 4.0 },
  { name: 'Punjabi Tadka', cuisine: 'North Indian', price: '$', area: 'Kurla', rating: 3.9 },
  { name: 'Chole Bhature Junction', cuisine: 'North Indian', price: '$', area: 'Andheri East', rating: 3.8 },
  { name: 'Goan Fish House', cuisine: 'Coastal', price: '$$$', area: 'Bandra West', rating: 4.5 },
  { name: 'Chettinad Spice', cuisine: 'South Indian', price: '$$', area: 'BKC', rating: 4.4 },
  { name: 'Vada Pav Corner', cuisine: 'Street Food', price: '$', area: 'Andheri West', rating: 3.7 },
  { name: 'Pani Puri Junction', cuisine: 'Street Food', price: '$', area: 'Bandra West', rating: 3.8 },
  { name: 'Healthfare Kitchen', cuisine: 'Continental', price: '$$', area: 'Andheri West', rating: 4.6 },
  { name: 'Dal & Roti Adda', cuisine: 'North Indian', price: '$', area: 'Dadar', rating: 4.1 },
  { name: 'Sugar Free Sweets', cuisine: 'Jain', price: '$$', area: 'Khar', rating: 4.4 },
];

/**
 * Dish templates per restaurant.
 * `tags` must be valid HEALTH_TAGS values, `allergens` valid ALLERGENS values.
 */
export const DISHES = {
  'Saffron Leaf': [
    { name: 'Dal Makhani', tags: ['low_oil', 'kidney_friendly'], allergens: ['dairy'], tip: 'Skip the cream swirl on top to cut fat.' },
    { name: 'Butter Chicken', tags: ['low_sodium'], allergens: ['dairy'], tip: 'Ask for less butter and no added sugar in the gravy.' },
    { name: 'Paneer Tikka Masala', tags: ['low_oil'], allergens: ['dairy'], tip: 'Grilled paneer skewers are the lower-oil option.' },
    { name: 'Tandoori Roti', tags: ['diabetic_friendly', 'heart_healthy'], allergens: ['gluten'], tip: 'Choose multigrain roti to reduce the carb spike.' },
    { name: 'Jeera Rice', tags: ['diabetic_friendly', 'gluten_free', 'low_oil', 'kidney_friendly'], allergens: [], tip: 'Brown rice is a better glucose choice than white.' },
    { name: 'Palak Paneer', tags: ['heart_healthy', 'kidney_friendly'], allergens: ['dairy'], tip: 'Blanched spinach keeps oxalate lower.' },
    { name: 'Kachumber Salad', tags: ['low_oil', 'gluten_free', 'kidney_friendly', 'diabetic_friendly'], allergens: [], tip: 'Cucumber and tomato, low calorie and hydrating.' },
    { name: 'Tamarind Rice', tags: ['kidney_friendly', 'low_oil'], allergens: [], tip: 'Tangy and light, no oil-heavy tempering.' },
    { name: 'Moong Dal Halwa', tags: [], allergens: ['dairy'], tip: 'Ghee and sugar heavy, avoid for diabetes.' },
  ],
  'Tandoori Nights': [
    { name: 'Tandoori Chicken (Half)', tags: ['low_oil', 'heart_healthy'], allergens: [], tip: 'Lean breast without the sugary marinade is lowest fat.' },
    { name: 'Chicken Seekh Kebab', tags: ['low_oil'], allergens: [], tip: 'Grill instead of deep fry to keep oil down.' },
    { name: 'Garlic Naan', tags: [], allergens: ['gluten', 'dairy'], tip: 'Ask for a missi roti instead - no gluten, less oil.' },
    { name: 'Murgh Malai Tikka', tags: ['low_oil'], allergens: ['dairy'], tip: 'Creamy marinade is high in saturated fat.' },
    { name: 'Egg Curry', tags: ['low_sodium', 'kidney_friendly'], allergens: [], tip: 'Lower potassium than potato-heavy gravies.' },
    { name: 'Boiled Egg Bhurji', tags: ['low_oil', 'gluten_free', 'kidney_friendly', 'heart_healthy'], allergens: [], tip: 'Minimal oil makes this the heartiest tandoor option.' },
    { name: 'Masala Raita', tags: ['low_oil', 'kidney_friendly'], allergens: ['dairy'], tip: 'Use sparingly, raita is salted to mask the heat.' },
  ],
  'Dosa Corner': [
    { name: 'Plain Dosa', tags: ['diabetic_friendly', 'gluten_free', 'low_oil', 'kidney_friendly', 'heart_healthy'], allergens: [], tip: 'Best pick for diabetes - no rice flour sugar load.' },
    { name: 'Masala Dosa', tags: ['diabetic_friendly', 'gluten_free', 'low_oil', 'heart_healthy'], allergens: [], tip: 'Skip the potato masala to keep carbs down.' },
    { name: 'Ghee Dosa', tags: ['gluten_free'], allergens: ['dairy'], tip: 'Ghee-heavy - avoid for heart or kidney patients.' },
    { name: 'Steamed Idli (2 pcs)', tags: ['diabetic_friendly', 'low_oil', 'kidney_friendly', 'heart_healthy'], allergens: [], tip: 'Steamed with no oil, a solid low-sodium breakfast.' },
    { name: 'Sambar', tags: ['kidney_friendly', 'low_oil'], allergens: [], tip: 'Watch the salt - it is loaded for flavour.' },
    { name: 'Medu Vada', tags: [], allergens: ['gluten'], tip: 'Deep fried, so high oil. One only if tracking carbs.' },
    { name: 'Filter Coffee', tags: [], allergens: ['dairy'], tip: 'Low sugar, but high caffeine - fine before noon.' },
    { name: 'Podi Idli', tags: ['low_oil', 'gluten_free'], allergens: [], tip: 'Chutney adds salt, so ask for less.' },
  ],
  'Idli Sambar House': [
    { name: 'Idli Vada Combo', tags: [], allergens: ['gluten'], tip: 'Vada is fried; keep it to one for oil intake.' },
    { name: 'Steamed Idli (4 pcs)', tags: ['diabetic_friendly', 'low_oil', 'kidney_friendly', 'heart_healthy'], allergens: [], tip: 'Pair with sambar for protein, skip the papad.' },
    { name: 'Rava Dosa', tags: ['gluten_free'], allergens: [], tip: 'Gluten free but higher GI than rice dosa.' },
    { name: 'Sambar', tags: ['kidney_friendly', 'low_oil'], allergens: [], tip: 'Ask for sambar on the side to control portions.' },
    { name: 'Lemon Rice', tags: ['low_oil', 'kidney_friendly'], allergens: [], tip: 'Simple tempered rice, minimal oil.' },
  ],
  'Filter Kaapi': [
    { name: 'Strong Filter Coffee', tags: [], allergens: ['dairy'], tip: 'No sugar by default - good, but not for GERD.' },
    { name: 'Gulab Jamun (2 pcs)', tags: [], allergens: ['dairy'], tip: 'Very high sugar. Avoid with diabetes.' },
    { name: 'Idli Vada', tags: [], allergens: ['gluten'], tip: 'Fried lentil fritter, high oil.' },
  ],
  'Misal Pavilion': [
    { name: 'Misal Pav', tags: [], allergens: ['gluten', 'soy'], tip: 'Very high sodium from the usal. Request less salt.' },
    { name: 'Dal Kolhapuri', tags: ['low_oil', 'kidney_friendly'], allergens: [], tip: 'Ask them to hold the ghee on top.' },
    { name: 'Batata Bhaji', tags: [], allergens: [], tip: 'Deep fried potato - high oil and high carb.' },
    { name: 'Sabudana Vada', tags: [], allergens: [], tip: 'Very high oil from deep frying.' },
    { name: 'Thecha Rice', tags: ['kidney_friendly'], allergens: ['gluten', 'nuts'], tip: 'Peanut thecha adds healthy fats but watch portion size.' },
    { name: 'Chapati (2 pcs)', tags: ['diabetic_friendly', 'heart_healthy', 'low_oil'], allergens: ['gluten'], tip: 'Whole wheat chapati beats buttered pav for glucose.' },
  ],
  'Wada Bhatti Centre': [
    { name: 'Vada Pav', tags: [], allergens: ['gluten'], tip: 'Street fried, high sodium. An occasional food only.' },
    { name: 'Dabeli', tags: [], allergens: ['gluten', 'nuts'], tip: 'Sweet and oily - not a diabetic-friendly choice.' },
    { name: 'Masala Chaas', tags: ['low_sodium', 'low_oil'], allergens: ['dairy'], tip: 'Ask for no salt and no sugar.' },
  ],
  'Gujarati Bhojan': [
    { name: 'Gujarati Dal', tags: ['low_oil', 'kidney_friendly', 'heart_healthy'], allergens: [], tip: 'Mildly sweet, so watch the seasoning sugar.' },
    { name: 'Rotli (2 pcs)', tags: ['diabetic_friendly'], allergens: ['gluten'], tip: 'Whole wheat rotli instead of ghee-heavy phulka.' },
    { name: 'Undhiyu', tags: ['low_oil', 'heart_healthy'], allergens: [], tip: 'Baked, not fried - a good winter option.' },
    { name: 'Fafda Jalebi', tags: [], allergens: ['gluten'], tip: 'Sweet and fried. Skip with diabetes.' },
    { name: 'Methi Thepla', tags: ['heart_healthy', 'low_oil'], allergens: ['gluten'], tip: 'Fenugreek helps glucose but it is fried here.' },
    { name: 'Khaman Dhokla', tags: ['diabetic_friendly', 'heart_healthy'], allergens: [], tip: 'Steamed dhokla is a solid protein snack.' },
    { name: 'Handvo', tags: ['diabetic_friendly'], allergens: [], tip: 'Steamed but made with oil; watch the portion.' },
    { name: 'Ghee Roast Muthi', tags: ['kidney_friendly', 'gluten_free'], allergens: [], tip: 'Light breakfast, ask for less ghee.' },
    { name: 'Patra', tags: ['low_oil', 'kidney_friendly'], allergens: [], tip: 'Savoury leaf rolls, light on oil when steamed.' },
  ],
  'Rajasthan Bikaner': [
    { name: 'Dal Baati Churma', tags: [], allergens: ['dairy'], tip: 'Baked baati soaked in ghee - high fat and oil.' },
    { name: 'Gatte Ki Sabzi', tags: [], allergens: ['dairy'], tip: 'Rajasthani gravies are typically very salty.' },
    { name: 'Ker Sangri', tags: ['kidney_friendly'], allergens: [], tip: 'Low oil desert bean dish, but salty.' },
    { name: 'Pyaaz Kachori', tags: [], allergens: ['gluten'], tip: 'Deep fried and high sodium - an occasional indulgence.' },
    { name: 'Moong Dal Halwa', tags: [], allergens: ['dairy'], tip: 'Sugar and ghee heavy, skip with diabetes.' },
    { name: 'Jaggery Churma', tags: [], allergens: ['gluten', 'dairy'], tip: 'Jaggery is still sugar. Not a diabetic option.' },
  ],
  'Hyderabadi Dum Biryani': [
    { name: 'Veg Dum Biryani', tags: [], allergens: ['dairy'], tip: 'White rice, ghee and fried onion - high carb and oil.' },
    { name: 'Chicken Dum Biryani', tags: [], allergens: ['dairy'], tip: 'Avoid with diabetes, the portion is large and salty.' },
    { name: 'Raita', tags: ['low_oil', 'kidney_friendly'], allergens: ['dairy'], tip: 'Good cooling side, but adds salt.' },
    { name: 'Mirchi Ka Salan', tags: [], allergens: [], tip: 'Usually no oil or sugar, a lighter accompaniment.' },
    { name: 'Khubani Raita', tags: ['low_oil', 'kidney_friendly'], allergens: ['dairy'], tip: 'Watch the salt, raita is generously salted.' },
    { name: 'Chicken 65', tags: [], allergens: ['gluten'], tip: 'Deep fried with a cornflour crust.' },
  ],
  'Lucknowi Kebab House': [
    { name: 'Galouti Kebab (2 pcs)', tags: [], allergens: [], tip: 'Raw papaya marinade, deep fried - high oil.' },
    { name: 'Mutton Awadhi Korma', tags: ['low_oil'], allergens: ['dairy'], tip: 'Rich and creamy, not heart friendly.' },
    { name: 'Ulte Tawe Ka Paratha', tags: [], allergens: ['gluten', 'dairy'], tip: 'Stuffed paratha is oily and high sodium.' },
    { name: 'Sheermal', tags: [], allergens: ['gluten', 'dairy'], tip: 'Sweet bread, best skipped for diabetes.' },
    { name: 'Tandoori Roti', tags: ['diabetic_friendly', 'heart_healthy', 'low_oil'], allergens: ['gluten'], tip: 'A safe swap for the paratha here.' },
  ],
  'Shanghai Tadka': [
    { name: 'Steamed Idli Manchurian', tags: ['diabetic_friendly'], allergens: ['gluten', 'soy'], tip: 'Batter is fried and the sauce is sugary.' },
    { name: 'Hakka Chilli Vegetables', tags: ['low_oil', 'gluten_free', 'heart_healthy'], allergens: ['soy'], tip: 'Ask for less oil and no cornflour thickening.' },
    { name: 'Chilli Garlic Noodles', tags: [], allergens: ['gluten', 'soy'], tip: 'High sodium from soy sauce. Ask for light soy.' },
    { name: 'Veg Spring Roll', tags: [], allergens: ['gluten', 'soy'], tip: 'Fried roll, high oil.' },
    { name: 'Steamed Momos', tags: ['low_oil'], allergens: ['gluten'], tip: 'Steamed, not fried - the lighter pick.' },
    { name: 'Clear Soup', tags: ['low_sodium', 'low_oil', 'gluten_free'], allergens: ['soy'], tip: 'Ask for no added salt; lowest sodium option here.' },
  ],
  'Wok Box': [
    { name: 'Burnt Garlic Rice', tags: [], allergens: ['soy'], tip: 'Fried rice, high oil and sodium.' },
    { name: 'Chicken Manchurian', tags: [], allergens: ['gluten', 'soy'], tip: 'Battered and deep fried.' },
    { name: 'Schezwan Chicken', tags: [], allergens: ['gluten', 'soy'], tip: 'Spicy, oily and salty.' },
  ],
  'The Grill Room': [
    { name: 'Grilled Chicken Breast', tags: ['low_oil', 'heart_healthy', 'diabetic_friendly', 'kidney_friendly'], allergens: [], tip: 'Best match on the menu for most conditions.' },
    { name: 'Grilled Salmon', tags: ['low_oil', 'heart_healthy', 'diabetic_friendly', 'kidney_friendly'], allergens: ['shellfish'], tip: 'Omega-3 fats are excellent for heart health.' },
    { name: 'Caesar Salad (no croutons)', tags: ['low_oil', 'heart_healthy'], allergens: ['dairy'], tip: 'Ask for dressing on the side to control fat.' },
    { name: 'Mushroom Risotto', tags: ['kidney_friendly', 'gluten_free'], allergens: ['dairy'], tip: 'Rice based but often heavy in butter and parmesan.' },
    { name: 'Steak with Rosemary', tags: ['low_oil', 'heart_healthy', 'diabetic_friendly'], allergens: [], tip: 'Skip the pepper sauce to limit sodium.' },
  ],
  'Salad Bowl': [
    { name: 'Keto Greek Salad', tags: ['low_oil', 'gluten_free', 'heart_healthy', 'diabetic_friendly'], allergens: ['dairy'], tip: 'Feta adds sodium; ask for less.' },
    { name: 'Quinoa Power Bowl', tags: ['gluten_free', 'heart_healthy', 'kidney_friendly'], allergens: [], tip: 'Quinoa is a low GI whole grain.' },
    { name: 'Paneer Tikka Salad', tags: ['low_oil', 'gluten_free', 'diabetic_friendly'], allergens: ['dairy'], tip: 'Grilled, not fried. Ask for dressing on the side.' },
    { name: 'Tuna Nicoise', tags: ['low_oil', 'gluten_free', 'heart_healthy'], allergens: ['shellfish'], tip: 'Skip the potato to keep carbs lower.' },
    { name: 'Green Detox Juice', tags: ['low_sodium', 'low_oil', 'gluten_free', 'kidney_friendly'], allergens: [], tip: 'No sugar added, kidney friendly.' },
  ],
  'Brew & Grill': [
    { name: 'Grilled Paneer Tikka', tags: ['low_oil', 'gluten_free', 'diabetic_friendly'], allergens: ['dairy'], tip: 'Good protein pick, ask for less marinade oil.' },
    { name: 'Mushroom Galouti', tags: ['low_oil'], allergens: [], tip: 'Vegetarian version, grilled not fried.' },
    { name: 'Dal Shorba', tags: ['low_oil', 'kidney_friendly', 'heart_healthy'], allergens: [], tip: 'Light, low-sodium broth option.' },
    { name: 'Tandoori Roti', tags: ['diabetic_friendly', 'heart_healthy'], allergens: ['gluten'], tip: 'Ask for no butter.' },
  ],
  'Burger Junction': [
    { name: 'Veg Burger', tags: [], allergens: ['gluten', 'dairy', 'soy'], tip: 'Refined flour bun and a fried patty.' },
    { name: 'Grilled Chicken Burger (no bun)', tags: ['low_oil', 'gluten_free', 'diabetic_friendly', 'heart_healthy'], allergens: [], tip: 'Lettuce wrap instead of a bun keeps it low carb.' },
    { name: 'French Fries', tags: [], allergens: [], tip: 'Deep fried, high oil. Skip for kidney or heart patients.' },
    { name: 'Onion Rings', tags: [], allergens: ['gluten'], tip: 'Fried and battered.' },
    { name: 'Baked Sweet Potato Fries', tags: ['low_oil', 'gluten_free', 'diabetic_friendly'], allergens: [], tip: 'Baked not fried - the healthier fry swap.' },
    { name: 'Peri Peri Chicken Wings', tags: [], allergens: [], tip: 'Fried and very high in sodium.' },
  ],
  'Pizza Planet': [
    { name: 'Margherita Pizza', tags: ['kidney_friendly'], allergens: ['gluten', 'dairy'], tip: 'Thin crust with less cheese is lower in sodium.' },
    { name: 'GF Margherita (gluten free base)', tags: ['gluten_free', 'low_oil'], allergens: ['dairy'], tip: 'Ask them to confirm the base is truly gluten free.' },
    { name: 'Grilled Veg Pizza', tags: ['low_oil'], allergens: ['gluten', 'dairy'], tip: 'Skip processed meat toppings for heart health.' },
    { name: 'Garlic Breadsticks', tags: [], allergens: ['gluten', 'dairy'], tip: 'Butter heavy.' },
  ],
  'Pasta Napoli': [
    { name: 'Grilled Chicken Pasta', tags: [], allergens: ['gluten', 'dairy'], tip: 'Cream based and high in refined carbs.' },
    { name: 'Penne Arrabbiata', tags: ['gluten_free', 'low_oil', 'kidney_friendly'], allergens: [], tip: 'Tomato based, no cream - the lighter option.' },
    { name: 'Zucchini Noodles', tags: ['gluten_free', 'diabetic_friendly', 'low_oil', 'kidney_friendly'], allergens: ['dairy'], tip: 'Lowest carb pasta option here.' },
  ],
  'Jain Bhojan Sudhar': [
    { name: 'Jain Dal', tags: ['low_oil', 'kidney_friendly', 'gluten_free', 'heart_healthy'], allergens: [], tip: 'No onion or garlic, mild and light.' },
    { name: 'Jain Khichdi', tags: ['gluten_free', 'kidney_friendly'], allergens: [], tip: 'Easily digestible and light on oil.' },
    { name: 'Jain Rotli', tags: ['diabetic_friendly'], allergens: ['gluten'], tip: 'Whole wheat, good for diabetic portions.' },
    { name: 'Jain Paneer Tikka', tags: ['low_oil', 'gluten_free'], allergens: ['dairy'], tip: 'No meat, no root vegetables. Grilled not fried.' },
    { name: 'Jain Vada Pav', tags: [], allergens: ['gluten'], tip: 'Fried patty, high oil.' },
  ],
  'Shree Nath Upadhyay': [
    { name: 'Jain Sambhar Idli', tags: ['diabetic_friendly', 'low_oil', 'kidney_friendly'], allergens: [], tip: 'Steamed, minimal oil. Great breakfast pick.' },
    { name: 'Jain Thali (small)', tags: ['kidney_friendly', 'low_oil'], allergens: ['dairy'], tip: 'Smaller portion keeps the sodium and carb load down.' },
    { name: 'Jain Upma', tags: ['low_oil'], allergens: ['gluten'], tip: 'Semolina based, watch the portion for carbs.' },
    { name: 'Jain Dhokla', tags: ['diabetic_friendly', 'heart_healthy'], allergens: [], tip: 'Steamed, a good low-oil snack.' },
  ],
  'Punjabi Tadka': [
    { name: 'Chole Bhature', tags: [], allergens: ['gluten'], tip: 'Bhature is deep fried, so very high oil.' },
    { name: 'Rajma Chawal', tags: ['kidney_friendly', 'low_oil', 'heart_healthy'], allergens: [], tip: 'Light on oil, but rajma is higher in potassium.' },
    { name: 'Kadhi Pakora', tags: [], allergens: ['gluten'], tip: 'Pakora is fried and kadhi is sour and salty.' },
    { name: 'Tandoori Roti', tags: ['diabetic_friendly', 'heart_healthy'], allergens: ['gluten'], tip: 'Swap for the bhature to cut the oil.' },
  ],
  'Chole Bhature Junction': [
    { name: 'Chole Bhature', tags: [], allergens: ['gluten'], tip: 'Street food, deep fried and heavily salted.' },
    { name: 'Chole Chawal', tags: ['kidney_friendly', 'low_oil', 'heart_healthy'], allergens: [], tip: 'Lighter version with no fried bread.' },
  ],
  'Goan Fish House': [
    { name: 'Grilled Fish (Kingfisher)', tags: ['low_oil', 'heart_healthy', 'diabetic_friendly', 'kidney_friendly'], allergens: ['shellfish'], tip: 'Excellent omega-3 source. Best grill pick.' },
    { name: 'Fish Curry Rawa', tags: ['low_oil'], allergens: ['shellfish'], tip: 'Rawa coating is fried, so oil goes up.' },
    { name: 'Pork Vindaloo', tags: [], allergens: [], tip: 'Very spicy and oily, high sodium.' },
    { name: 'Sol Kadhi', tags: ['low_oil', 'kidney_friendly'], allergens: ['dairy'], tip: 'Light, coconut and curd based.' },
    { name: 'Rice and Fish Curry Combo', tags: ['gluten_free'], allergens: ['shellfish'], tip: 'Gluten free; watch the portion for diabetes.' },
  ],
  'Chettinad Spice': [
    { name: 'Chettinad Chicken Curry', tags: [], allergens: ['dairy'], tip: 'Coconut and spice heavy, high sodium.' },
    { name: 'Idli Fry', tags: ['gluten_free', 'kidney_friendly'], allergens: [], tip: 'Not fried despite the name, just pan seared lightly.' },
    { name: 'Appam with Veg Stew', tags: ['gluten_free', 'low_oil', 'kidney_friendly'], allergens: [], tip: 'Fermented appam is a good low GI choice.' },
    { name: 'Lemon Rice', tags: ['low_oil', 'kidney_friendly', 'gluten_free'], allergens: [], tip: 'Simple and light.' },
    { name: 'Coconut Chutney', tags: ['gluten_free', 'low_oil', 'kidney_friendly'], allergens: [], tip: 'No sugar or salt added by default.' },
    { name: 'Vada Curry', tags: [], allergens: ['gluten'], tip: 'Donut fritters simmered in curry, high oil.' },
  ],
  'Vada Pav Corner': [
    { name: 'Vada Pav', tags: [], allergens: ['gluten'], tip: 'Deep fried, high sodium - a street food treat.' },
    { name: 'Dabeli', tags: [], allergens: ['gluten', 'nuts'], tip: 'Sweet, oily and salted.' },
  ],
  'Pani Puri Junction': [
    { name: 'Pani Puri (6 pcs)', tags: [], allergens: ['gluten'], tip: 'Tiny fried shells, high sodium from the pani.' },
    { name: 'Dahi Puri', tags: [], allergens: ['dairy'], tip: 'Tangy and salted, not suitable for most conditions.' },
    { name: 'Bhel Puri', tags: [], allergens: ['gluten', 'nuts', 'soy'], tip: 'Salty street snack, high sodium.' },
  ],
  'Healthfare Kitchen': [
    { name: 'Quinoa Veg Bowl', tags: ['gluten_free', 'low_oil', 'heart_healthy', 'diabetic_friendly', 'kidney_friendly'], allergens: [], tip: 'Designed for diabetic and kidney friendly diets.' },
    { name: 'Grilled Chicken Multigrain Bowl', tags: ['low_oil', 'heart_healthy', 'diabetic_friendly'], allergens: [], tip: 'Best all round option for heart and glucose.' },
    { name: 'Steamed Moong Dal Chilla', tags: ['gluten_free', 'low_oil', 'kidney_friendly', 'diabetic_friendly'], allergens: [], tip: 'High protein, low GI, no gluten.' },
    { name: 'Fresh Lime Soda (no sugar)', tags: ['low_sodium', 'low_oil', 'gluten_free', 'kidney_friendly'], allergens: [], tip: 'No added sugar, hydrating and low calorie.' },
    { name: 'Roasted Salad with Olive Oil', tags: ['low_oil', 'gluten_free', 'heart_healthy'], allergens: ['nuts'], tip: 'Light dressing on the side.' },
  ],
  'Dal & Roti Adda': [
    { name: 'Ghee Dal Tadka', tags: ['kidney_friendly', 'gluten_free'], allergens: ['dairy'], tip: 'Ask for no ghee on top to cut the fat.' },
    { name: 'Dal Baati', tags: [], allergens: ['gluten', 'dairy'], tip: 'Baked and soaked in ghee, so high fat.' },
    { name: 'Plain Roti (2 pcs)', tags: ['diabetic_friendly', 'low_oil', 'heart_healthy'], allergens: ['gluten'], tip: 'Whole wheat, no ghee - best for glucose control.' },
    { name: 'Steamed Rice', tags: ['gluten_free', 'kidney_friendly'], allergens: [], tip: 'Low GI compared to biryani, watch portion size.' },
    { name: 'Plain Curd', tags: ['low_oil', 'gluten_free', 'heart_healthy'], allergens: ['dairy'], tip: 'Probiotic, but check for added salt.' },
    { name: 'Khichdi', tags: ['gluten_free', 'low_oil', 'kidney_friendly', 'heart_healthy'], allergens: [], tip: 'Light, easily digestible meal.' },
    { name: 'Aloo Paratha', tags: [], allergens: ['gluten'], tip: 'Ghee brushed and pan fried, high fat.' },
  ],
  'Sugar Free Sweets': [
    { name: 'Sugar Free Ladoo', tags: ['low_oil', 'gluten_free', 'diabetic_friendly'], allergens: ['nuts'], tip: 'Uses stevia - good for diabetes, mind the ghee.' },
    { name: 'Sugar Free Kaju Katli', tags: ['gluten_free', 'diabetic_friendly'], allergens: ['nuts'], tip: 'Cashew heavy, so high protein and calories.' },
    { name: 'Sugar Free Halwa', tags: ['diabetic_friendly', 'gluten_free'], allergens: ['dairy', 'nuts'], tip: 'No sugar, but ghee is still high. Small portion only.' },
    { name: 'Jain Sugar Free Barfi', tags: ['diabetic_friendly', 'gluten_free', 'low_oil'], allergens: ['dairy', 'nuts'], tip: 'Milk free and sugar free, good for Jain diets too.' },
  ],
};

/** Spreads coordinates around Andheri West so distances vary realistically. */
const AREA_OFFSETS = {
  'Andheri West': [0, 0],
  'Andheri East': [0.012, 0.031],
  'Bandra West': [-0.021, -0.018],
  'Bandra East': [-0.014, 0.009],
  Dadar: [0.038, 0.012],
  'Dadar East': [0.04, 0.016],
  Khar: [-0.018, -0.048],
  BKC: [-0.008, -0.062],
  Juhu: [-0.006, -0.09],
  Kurla: [0.075, -0.006],
};

export function coordsFor(index, area) {
  const [dLat, dLng] = AREA_OFFSETS[area] || [0, 0];
  const jitter = (n) => ((Math.abs(n) % 7) - 3) * 0.0015;
  return {
    lat: Number((19.1197 + dLat + jitter(index)).toFixed(6)),
    lng: Number((72.8464 + dLng + jitter(index * 3)).toFixed(6)),
  };
}
