const mongoose = require('mongoose');
const path = require('path');

// Load .env from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Product schema (simplified for direct insertion)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  category: { type: String, required: true, lowercase: true },
  brand: { type: String, trim: true },
  images: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  versionKey: false
});

const Product = mongoose.model('Product', ProductSchema);

// Product categories
const categories = [
  'electronics', 'clothing', 'books', 'home-garden', 'sports-outdoors',
  'health-beauty', 'toys-games', 'automotive', 'food-beverages', 'other'
];

// Sample product data by category
const productTemplates = {
  electronics: [
    { base: 'iPhone', brands: ['Apple'], priceRange: [699, 1299] },
    { base: 'Samsung Galaxy', brands: ['Samsung'], priceRange: [399, 1199] },
    { base: 'MacBook', brands: ['Apple'], priceRange: [999, 2499] },
    { base: 'Dell Laptop', brands: ['Dell'], priceRange: [449, 1699] },
    { base: 'PlayStation', brands: ['Sony'], priceRange: [299, 599] },
    { base: 'Xbox', brands: ['Microsoft'], priceRange: [299, 599] },
    { base: 'iPad', brands: ['Apple'], priceRange: [329, 1099] },
    { base: 'Samsung Tablet', brands: ['Samsung'], priceRange: [199, 899] },
    { base: 'Apple Watch', brands: ['Apple'], priceRange: [199, 799] },
    { base: 'AirPods', brands: ['Apple'], priceRange: [129, 549] },
    { base: 'Bluetooth Speaker', brands: ['JBL', 'Bose', 'Sony'], priceRange: [29, 299] },
    { base: 'Wireless Headphones', brands: ['Sony', 'Bose', 'Sennheiser'], priceRange: [89, 399] },
    { base: 'Smart TV', brands: ['Samsung', 'LG', 'Sony'], priceRange: [299, 1999] },
    { base: 'Gaming Mouse', brands: ['Logitech', 'Razer'], priceRange: [25, 149] },
    { base: 'Mechanical Keyboard', brands: ['Corsair', 'Razer', 'Logitech'], priceRange: [79, 299] }
  ],
  
  clothing: [
    { base: 'T-Shirt', brands: ['Nike', 'Adidas', 'Uniqlo', 'H&M'], priceRange: [15, 89] },
    { base: 'Jeans', brands: ['Levi\'s', 'Wrangler', 'Lee'], priceRange: [39, 199] },
    { base: 'Sneakers', brands: ['Nike', 'Adidas', 'Converse'], priceRange: [59, 299] },
    { base: 'Hoodie', brands: ['Nike', 'Adidas', 'Champion'], priceRange: [45, 159] },
    { base: 'Dress Shirt', brands: ['Calvin Klein', 'Ralph Lauren'], priceRange: [29, 129] },
    { base: 'Summer Dress', brands: ['Zara', 'H&M', 'Forever 21'], priceRange: [25, 99] },
    { base: 'Winter Jacket', brands: ['North Face', 'Patagonia', 'Columbia'], priceRange: [89, 399] },
    { base: 'Running Shorts', brands: ['Nike', 'Adidas', 'Under Armour'], priceRange: [19, 79] },
    { base: 'Yoga Pants', brands: ['Lululemon', 'Athleta'], priceRange: [49, 149] },
    { base: 'Baseball Cap', brands: ['New Era', 'Nike', 'Adidas'], priceRange: [15, 59] }
  ],
  
  books: [
    { base: 'Programming Guide', brands: ['O\'Reilly', 'Packt', 'Manning'], priceRange: [29, 89] },
    { base: 'Fiction Novel', brands: ['Penguin', 'HarperCollins', 'Random House'], priceRange: [12, 35] },
    { base: 'Self-Help Book', brands: ['Hay House', 'Simon & Schuster'], priceRange: [15, 45] },
    { base: 'Cookbook', brands: ['Williams Sonoma', 'Food Network'], priceRange: [19, 59] },
    { base: 'History Book', brands: ['National Geographic', 'Smithsonian'], priceRange: [22, 65] },
    { base: 'Science Textbook', brands: ['Pearson', 'McGraw-Hill'], priceRange: [89, 299] },
    { base: 'Art Book', brands: ['Taschen', 'Phaidon'], priceRange: [35, 199] },
    { base: 'Travel Guide', brands: ['Lonely Planet', 'Fodor\'s'], priceRange: [18, 45] },
    { base: 'Children\'s Book', brands: ['Scholastic', 'Disney'], priceRange: [8, 25] },
    { base: 'Business Book', brands: ['Harvard Business Review', 'McKinsey'], priceRange: [25, 79] }
  ],
  
  'home-garden': [
    { base: 'Coffee Maker', brands: ['Keurig', 'Ninja', 'Cuisinart'], priceRange: [49, 299] },
    { base: 'Air Fryer', brands: ['Ninja', 'Cosori', 'Instant Pot'], priceRange: [59, 199] },
    { base: 'Vacuum Cleaner', brands: ['Dyson', 'Shark', 'Bissell'], priceRange: [89, 599] },
    { base: 'Garden Hose', brands: ['Craftsman', 'Flexzilla'], priceRange: [25, 89] },
    { base: 'Plant Pot', brands: ['Lechuza', 'Bloem'], priceRange: [12, 59] },
    { base: 'Throw Pillow', brands: ['West Elm', 'Pottery Barn'], priceRange: [19, 79] },
    { base: 'Candle', brands: ['Yankee Candle', 'Bath & Body Works'], priceRange: [12, 45] },
    { base: 'Kitchen Knife Set', brands: ['Wusthof', 'Henckels'], priceRange: [89, 399] },
    { base: 'Bed Sheets', brands: ['Brooklinen', 'Parachute'], priceRange: [49, 199] },
    { base: 'Garden Tools', brands: ['Fiskars', 'Corona'], priceRange: [19, 89] }
  ],
  
  'sports-outdoors': [
    { base: 'Tennis Racket', brands: ['Wilson', 'Babolat', 'Head'], priceRange: [89, 299] },
    { base: 'Basketball', brands: ['Spalding', 'Wilson'], priceRange: [25, 79] },
    { base: 'Hiking Boots', brands: ['Merrell', 'Salomon', 'Timberland'], priceRange: [89, 299] },
    { base: 'Camping Tent', brands: ['Coleman', 'REI', 'Big Agnes'], priceRange: [79, 599] },
    { base: 'Yoga Mat', brands: ['Manduka', 'Gaiam'], priceRange: [29, 149] },
    { base: 'Dumbbells', brands: ['Bowflex', 'CAP'], priceRange: [35, 199] },
    { base: 'Bicycle Helmet', brands: ['Giro', 'Bell', 'Specialized'], priceRange: [39, 199] },
    { base: 'Fishing Rod', brands: ['Shimano', 'Abu Garcia'], priceRange: [49, 299] },
    { base: 'Golf Clubs', brands: ['Callaway', 'TaylorMade'], priceRange: [199, 999] },
    { base: 'Skateboard', brands: ['Element', 'Powell Peralta'], priceRange: [89, 249] }
  ],
  
  'health-beauty': [
    { base: 'Face Cream', brands: ['Olay', 'Neutrogena', 'L\'Oreal'], priceRange: [15, 89] },
    { base: 'Shampoo', brands: ['Pantene', 'Head & Shoulders'], priceRange: [8, 35] },
    { base: 'Electric Toothbrush', brands: ['Oral-B', 'Philips'], priceRange: [39, 199] },
    { base: 'Perfume', brands: ['Chanel', 'Dior', 'Calvin Klein'], priceRange: [59, 299] },
    { base: 'Makeup Palette', brands: ['Urban Decay', 'MAC'], priceRange: [25, 129] },
    { base: 'Hair Dryer', brands: ['Dyson', 'Conair'], priceRange: [29, 399] },
    { base: 'Vitamins', brands: ['Nature Made', 'Centrum'], priceRange: [12, 49] },
    { base: 'Protein Powder', brands: ['Optimum Nutrition', 'Gold Standard'], priceRange: [29, 79] },
    { base: 'Face Mask', brands: ['Freeman', 'Origins'], priceRange: [8, 45] },
    { base: 'Sunscreen', brands: ['Neutrogena', 'Coppertone'], priceRange: [12, 35] }
  ],
  
  'toys-games': [
    { base: 'LEGO Set', brands: ['LEGO'], priceRange: [19, 299] },
    { base: 'Board Game', brands: ['Hasbro', 'Mattel'], priceRange: [15, 89] },
    { base: 'Action Figure', brands: ['Marvel', 'DC Comics'], priceRange: [12, 59] },
    { base: 'Puzzle', brands: ['Ravensburger', 'Buffalo Games'], priceRange: [9, 39] },
    { base: 'Remote Control Car', brands: ['Traxxas', 'Redcat'], priceRange: [29, 199] },
    { base: 'Doll', brands: ['Barbie', 'American Girl'], priceRange: [15, 129] },
    { base: 'Video Game', brands: ['Nintendo', 'PlayStation'], priceRange: [39, 69] },
    { base: 'Educational Toy', brands: ['LeapFrog', 'VTech'], priceRange: [19, 89] },
    { base: 'Building Blocks', brands: ['Mega Construx', 'K\'NEX'], priceRange: [15, 79] },
    { base: 'Stuffed Animal', brands: ['Build-A-Bear', 'Gund'], priceRange: [12, 49] }
  ],
  
  automotive: [
    { base: 'Car Tires', brands: ['Michelin', 'Goodyear', 'Bridgestone'], priceRange: [89, 299] },
    { base: 'Motor Oil', brands: ['Mobil 1', 'Castrol'], priceRange: [25, 79] },
    { base: 'Car Battery', brands: ['Interstate', 'DieHard'], priceRange: [89, 199] },
    { base: 'Floor Mats', brands: ['WeatherTech', 'Husky'], priceRange: [39, 149] },
    { base: 'Air Freshener', brands: ['Little Trees', 'Febreze'], priceRange: [3, 15] },
    { base: 'Jump Starter', brands: ['NOCO', 'Schumacher'], priceRange: [59, 199] },
    { base: 'Car Cover', brands: ['Budge', 'Classic Accessories'], priceRange: [49, 199] },
    { base: 'Dash Cam', brands: ['Garmin', 'Nextbase'], priceRange: [79, 299] },
    { base: 'Car Wax', brands: ['Meguiar\'s', 'Chemical Guys'], priceRange: [15, 59] },
    { base: 'Seat Covers', brands: ['FH Group', 'Covercraft'], priceRange: [29, 149] }
  ],
  
  'food-beverages': [
    { base: 'Coffee Beans', brands: ['Starbucks', 'Dunkin\''], priceRange: [8, 25] },
    { base: 'Protein Bars', brands: ['Quest', 'KIND'], priceRange: [12, 35] },
    { base: 'Olive Oil', brands: ['Bertolli', 'California Olive Ranch'], priceRange: [8, 29] },
    { base: 'Pasta', brands: ['Barilla', 'De Cecco'], priceRange: [2, 8] },
    { base: 'Tea', brands: ['Lipton', 'Twinings'], priceRange: [5, 19] },
    { base: 'Honey', brands: ['Nature Nate\'s', 'Clover'], priceRange: [6, 25] },
    { base: 'Hot Sauce', brands: ['Tabasco', 'Sriracha'], priceRange: [3, 12] },
    { base: 'Energy Drink', brands: ['Red Bull', 'Monster'], priceRange: [2, 8] },
    { base: 'Granola', brands: ['Nature Valley', 'Quaker'], priceRange: [4, 15] },
    { base: 'Spices', brands: ['McCormick', 'Simply Organic'], priceRange: [3, 12] }
  ],
  
  other: [
    { base: 'Office Chair', brands: ['Herman Miller', 'Steelcase'], priceRange: [149, 899] },
    { base: 'Desk Lamp', brands: ['Philips', 'IKEA'], priceRange: [19, 129] },
    { base: 'Phone Case', brands: ['OtterBox', 'Spigen'], priceRange: [15, 59] },
    { base: 'Power Bank', brands: ['Anker', 'RAVPower'], priceRange: [19, 89] },
    { base: 'Notebook', brands: ['Moleskine', 'Leuchtturm'], priceRange: [12, 45] },
    { base: 'Pen Set', brands: ['Pilot', 'Uni-ball'], priceRange: [8, 39] },
    { base: 'Backpack', brands: ['Jansport', 'Herschel'], priceRange: [35, 149] },
    { base: 'Water Bottle', brands: ['Hydro Flask', 'Yeti'], priceRange: [25, 79] },
    { base: 'Wall Clock', brands: ['Seiko', 'Howard Miller'], priceRange: [29, 199] },
    { base: 'Picture Frame', brands: ['Ikea', 'Umbra'], priceRange: [8, 49] }
  ]
};

// Helper functions
const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;

const generateTags = (name, category, brand) => {
  const baseTags = [category];
  if (brand) baseTags.push(brand.toLowerCase());
  
  // Add descriptive tags based on name
  const nameWords = name.toLowerCase().split(' ');
  baseTags.push(...nameWords.slice(0, 3));
  
  // Add category-specific tags
  const categoryTags = {
    electronics: ['tech', 'gadget', 'device'],
    clothing: ['fashion', 'apparel', 'style'],
    books: ['reading', 'literature', 'education'],
    'home-garden': ['home', 'house', 'garden'],
    'sports-outdoors': ['sport', 'outdoor', 'fitness'],
    'health-beauty': ['beauty', 'health', 'care'],
    'toys-games': ['toy', 'game', 'play'],
    automotive: ['car', 'auto', 'vehicle'],
    'food-beverages': ['food', 'beverage', 'kitchen'],
    other: ['misc', 'general', 'utility']
  };
  
  if (categoryTags[category]) {
    baseTags.push(randomChoice(categoryTags[category]));
  }
  
  return [...new Set(baseTags)]; // Remove duplicates
};

const generateImages = (productName, category) => {
  const imageCount = randomInt(1, 4);
  const images = [];
  
  for (let i = 0; i < imageCount; i++) {
    const imageId = randomInt(1, 1000);
    images.push(`https://picsum.photos/600/600?random=${imageId}&category=${category}`);
  }
  
  return images;
};

const generateProductVariations = () => {
  const variations = [
    'Pro', 'Plus', 'Max', 'Mini', 'Lite', 'Premium', 'Standard', 'Basic',
    'Deluxe', 'Ultimate', 'Advanced', 'Classic', 'Modern', 'Vintage',
    'XL', 'Large', 'Medium', 'Small', 'Extra', 'Super', 'Ultra'
  ];
  
  const colors = [
    'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange',
    'Pink', 'Gray', 'Silver', 'Gold', 'Brown', 'Navy', 'Maroon'
  ];
  
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '32GB', '64GB', '128GB', '256GB'];
  
  return {
    variation: Math.random() > 0.7 ? randomChoice(variations) : null,
    color: Math.random() > 0.6 ? randomChoice(colors) : null,
    size: Math.random() > 0.8 ? randomChoice(sizes) : null
  };
};

const generateRandomProduct = (index) => {
  const category = randomChoice(categories);
  const templates = productTemplates[category];
  const template = randomChoice(templates);
  const brand = randomChoice(template.brands);
  
  // Generate product variations
  const variations = generateProductVariations();
  
  // Build product name
  let productName = `${brand} ${template.base}`;
  if (variations.variation) productName += ` ${variations.variation}`;
  if (variations.color) productName += ` ${variations.color}`;
  if (variations.size) productName += ` ${variations.size}`;
  
  // Generate price within range
  const [minPrice, maxPrice] = template.priceRange;
  const basePrice = randomFloat(minPrice, maxPrice);
  const price = Math.round(basePrice * 100) / 100; // Round to 2 decimals
  
  // Generate stock (weighted toward having stock)
  const stockWeights = [
    { range: [0, 0], weight: 0.05 },     // 5% out of stock
    { range: [1, 5], weight: 0.1 },      // 10% low stock
    { range: [6, 20], weight: 0.25 },    // 25% medium stock
    { range: [21, 100], weight: 0.6 }    // 60% good stock
  ];
  
  const randomWeight = Math.random();
  let cumulativeWeight = 0;
  let stockRange;
  
  for (const { range, weight } of stockWeights) {
    cumulativeWeight += weight;
    if (randomWeight <= cumulativeWeight) {
      stockRange = range;
      break;
    }
  }
  
  const stock = randomInt(stockRange[0], stockRange[1]);
  
  // Generate description
  const qualityAdjectives = ['premium', 'high-quality', 'durable', 'reliable', 'innovative', 'comfortable', 'stylish', 'efficient'];
  const featureWords = ['advanced', 'cutting-edge', 'user-friendly', 'versatile', 'compact', 'lightweight', 'powerful'];
  
  const description = `${randomChoice(qualityAdjectives.map(adj => adj.charAt(0).toUpperCase() + adj.slice(1)))} ${template.base.toLowerCase()} from ${brand}. Features ${randomChoice(featureWords)} design with exceptional performance and reliability. Perfect for ${category.replace('-', ' and ')} enthusiasts. Includes manufacturer warranty and customer support.`;
  
  return {
    name: productName,
    description: description,
    price: price,
    stock: stock,
    category: category,
    brand: brand,
    images: generateImages(productName, category),
    tags: generateTags(productName, category, brand),
    isActive: Math.random() > 0.05, // 95% of products are active
  };
};

const generateBatchProducts = (batchSize, startIndex) => {
  console.log(`🔄 Generating batch of ${batchSize} products...`);
  const products = [];
  
  for (let i = 0; i < batchSize; i++) {
    try {
      const product = generateRandomProduct(startIndex + i);
      products.push(product);
    } catch (error) {
      console.error(`Error generating product ${i + 1}:`, error.message);
    }
  }
  
  return products;
};

const seedProducts = async () => {
  const TOTAL_PRODUCTS = 1000;
  const BATCH_SIZE = 50; // Insert in batches for better performance
  const totalBatches = Math.ceil(TOTAL_PRODUCTS / BATCH_SIZE);
  
  console.log('🛍️ Starting product seeding process...');
  console.log(`📊 Target: ${TOTAL_PRODUCTS} products in ${totalBatches} batches of ${BATCH_SIZE}`);
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if products already exist
    const existingCount = await Product.countDocuments();
    console.log(`📈 Existing products in database: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log('⚠️  Warning: Database already contains products');
      console.log('🗑️  Clearing existing products to avoid conflicts...');
      await Product.deleteMany({});
      console.log('✅ Existing products cleared');
    }
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    // Create batches
    for (let batch = 1; batch <= totalBatches; batch++) {
      const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_PRODUCTS - totalInserted);
      const startIndex = totalInserted + 1;
      
      console.log(`\n📦 Processing batch ${batch}/${totalBatches} (${currentBatchSize} products)...`);
      
      try {
        // Generate products for this batch
        const products = generateBatchProducts(currentBatchSize, startIndex);
        
        // Insert batch with error handling
        const insertResult = await Product.insertMany(products, { 
          ordered: false, // Continue inserting even if some fail
          rawResult: true 
        });
        
        const inserted = insertResult.insertedCount || products.length;
        totalInserted += inserted;
        
        console.log(`✅ Batch ${batch} completed: ${inserted} products inserted`);
        
        // Progress indicator
        const progress = ((totalInserted / TOTAL_PRODUCTS) * 100).toFixed(1);
        console.log(`📈 Overall progress: ${totalInserted}/${TOTAL_PRODUCTS} (${progress}%)`);
        
      } catch (error) {
        console.error(`❌ Error in batch ${batch}:`, error.message);
        
        // Handle duplicate key errors (E11000)
        if (error.code === 11000) {
          const duplicateCount = error.result ? error.result.insertedCount : 0;
          const skippedCount = currentBatchSize - duplicateCount;
          totalInserted += duplicateCount;
          totalSkipped += skippedCount;
          console.log(`⚠️  Batch ${batch}: ${duplicateCount} inserted, ${skippedCount} skipped (duplicates)`);
        }
      }
      
      // Small delay between batches
      if (batch < totalBatches) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Final statistics
    console.log('\n🎉 Product seeding completed!');
    console.log('📊 Final Statistics:');
    console.log(`   ✅ Total products inserted: ${totalInserted}`);
    console.log(`   ⚠️  Total products skipped: ${totalSkipped}`);
    console.log(`   📈 Success rate: ${((totalInserted / TOTAL_PRODUCTS) * 100).toFixed(1)}%`);
    
    // Verify final count
    const finalCount = await Product.countDocuments();
    console.log(`   🔍 Database verification: ${finalCount} products in database`);
    
    // Show category distribution
    console.log('\n🏷️ Category Distribution:');
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    categoryStats.forEach(stat => {
      const percentage = ((stat.count / finalCount) * 100).toFixed(1);
      console.log(`   📂 ${stat._id}: ${stat.count} (${percentage}%)`);
    });
    
    // Show some sample products
    console.log('\n🛍️ Sample products created:');
    const sampleProducts = await Product.find({}).limit(5).select('name price category brand stock');
    sampleProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price} (${product.category}) - Stock: ${product.stock}`);
    });
    
    // Show price statistics
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);
    
    if (priceStats.length > 0) {
      const stats = priceStats[0];
      console.log('\n💰 Price Statistics:');
      console.log(`   📊 Average Price: $${stats.avgPrice.toFixed(2)}`);
      console.log(`   📉 Minimum Price: $${stats.minPrice.toFixed(2)}`);
      console.log(`   📈 Maximum Price: $${stats.maxPrice.toFixed(2)}`);
      console.log(`   💎 Total Inventory Value: $${stats.totalValue.toFixed(2)}`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error during product seeding:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    console.log('✅ Product seeding script completed successfully!');
  }
};

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n⚠️  Script interrupted by user');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Run the seeding
if (require.main === module) {
  seedProducts().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { seedProducts, generateRandomProduct };