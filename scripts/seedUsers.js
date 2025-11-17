const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const path = require('path');

// Load .env from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// User schema (simplified for direct insertion)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number },
  address: { type: String },
  mobileNumber: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  refreshTokens: { type: [String], default: [] },
}, {
  timestamps: true,
  versionKey: false
});

const User = mongoose.model('User', UserSchema);

// Data generators using Faker
const generateRandomUser = async (index) => {
  const gender = faker.person.sexType();
  const firstName = faker.person.firstName(gender);
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  
  // Generate a unique email with index to avoid duplicates
  const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  const emailDomain = faker.internet.domainName();
  const email = `${emailPrefix}${index}@${emailDomain}`;
  
  // Generate other fields
  const age = faker.number.int({ min: 18, max: 75 });
  const address = faker.location.streetAddress({ useFullAddress: true });
  
  // Generate mobile number in various formats
  const mobileFormats = [
    () => faker.phone.number('+1-###-###-####'),
    () => faker.phone.number('(###) ###-####'),
    () => faker.phone.number('###-###-####'),
    () => faker.phone.number('+44-####-######'),
    () => faker.phone.number('+91-#####-#####'),
  ];
  const mobileNumber = faker.helpers.arrayElement(mobileFormats)();
  
  // Hash password (using same password for all users for simplicity)
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  // Assign roles (95% users, 5% admins)
  const role = faker.number.float() < 0.05 ? 'admin' : 'user';
  
  return {
    email,
    password: hashedPassword,
    name,
    age,
    address,
    mobileNumber,
    role,
    refreshTokens: []
  };
};

const generateBatchUsers = async (batchSize, startIndex) => {
  console.log(`🔄 Generating batch of ${batchSize} users...`);
  const users = [];
  
  for (let i = 0; i < batchSize; i++) {
    try {
      const user = await generateRandomUser(startIndex + i);
      users.push(user);
    } catch (error) {
      console.error(`Error generating user ${i + 1}:`, error.message);
    }
  }
  
  return users;
};

const seedUsers = async () => {
  const TOTAL_USERS = 3000;
  const BATCH_SIZE = 100; // Insert in batches for better performance
  const totalBatches = Math.ceil(TOTAL_USERS / BATCH_SIZE);
  
  console.log('🌱 Starting user seeding process...');
  console.log(`📊 Target: ${TOTAL_USERS} users in ${totalBatches} batches of ${BATCH_SIZE}`);
  
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/crowdera');
    console.log('✅ Connected to MongoDB');
    
    // Check if users already exist
    const existingCount = await User.countDocuments();
    console.log(`📈 Existing users in database: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log('⚠️  Warning: Database already contains users');
      console.log('🗑️  Clearing existing users to avoid conflicts...');
      await User.deleteMany({});
      console.log('✅ Existing users cleared');
    }
    
    let totalInserted = 0;
    let totalSkipped = 0;
    
    // Create batches
    for (let batch = 1; batch <= totalBatches; batch++) {
      const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_USERS - totalInserted);
      const startIndex = totalInserted + 1;
      
      console.log(`\n📦 Processing batch ${batch}/${totalBatches} (${currentBatchSize} users)...`);
      
      try {
        // Generate users for this batch
        const users = await generateBatchUsers(currentBatchSize, startIndex);
        
        // Insert batch with error handling
        const insertResult = await User.insertMany(users, { 
          ordered: false, // Continue inserting even if some fail
          rawResult: true 
        });
        
        const inserted = insertResult.insertedCount || users.length;
        totalInserted += inserted;
        
        console.log(`✅ Batch ${batch} completed: ${inserted} users inserted`);
        
        // Progress indicator
        const progress = ((totalInserted / TOTAL_USERS) * 100).toFixed(1);
        console.log(`📈 Overall progress: ${totalInserted}/${TOTAL_USERS} (${progress}%)`);
        
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
      
      // Small delay between batches to prevent overwhelming the database
      if (batch < totalBatches) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Final statistics
    console.log('\n🎉 Seeding process completed!');
    console.log('📊 Final Statistics:');
    console.log(`   ✅ Total users inserted: ${totalInserted}`);
    console.log(`   ⚠️  Total users skipped: ${totalSkipped}`);
    console.log(`   📈 Success rate: ${((totalInserted / TOTAL_USERS) * 100).toFixed(1)}%`);
    
    // Verify final count
    const finalCount = await User.countDocuments();
    console.log(`   🔍 Database verification: ${finalCount} users in database`);
    
    // Show some sample data
    console.log('\n👥 Sample users created:');
    const sampleUsers = await User.find({}).limit(5).select('-password -refreshTokens');
    sampleUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - Age: ${user.age}, Role: ${user.role}`);
    });
    
    // Show role distribution
    const userCount = await User.countDocuments({ role: 'user' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log('\n👑 Role Distribution:');
    console.log(`   👤 Users: ${userCount} (${((userCount / finalCount) * 100).toFixed(1)}%)`);
    console.log(`   👑 Admins: ${adminCount} (${((adminCount / finalCount) * 100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    console.log('✅ Seeding script completed successfully!');
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
  seedUsers().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { seedUsers, generateRandomUser };