require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('./db');
const User = require('./models/User');
const Friend = require('./models/Friend');

const users = [
  { username: 'kang', password: 'password123', name: 'Kang', memberSince: 'January 2024' },
];

const friends = [
  { name: 'Alice',   initial: 'A', status: 'Online'  },
  { name: 'Bob',     initial: 'B', status: 'Offline' },
  { name: 'Charlie', initial: 'C', status: 'Online'  },
  { name: 'Diana',   initial: 'D', status: 'Away'    },
  { name: 'Ethan',   initial: 'E', status: 'Online'  },
  { name: 'Fiona',   initial: 'F', status: 'Offline' },
];

async function seed() {
  await connectDB();

  await User.deleteMany({});
  await Friend.deleteMany({});

  await User.insertMany(users);
  await Friend.insertMany(friends);

  console.log('Seeded users and friends successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
