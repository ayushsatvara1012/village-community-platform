
// 35 Fake Villages
export const villages = Array.from({ length: 35 }, (_, i) => ({
    id: i + 1,
    name: `Village-${String.fromCharCode(65 + (i % 26))}${i + 1}`,
    district: "Community District",
    member_count: Math.floor(Math.random() * 500) + 50,
}));

// 50 Fake Members
const professions = ["Farmer", "Teacher", "Engineer", "Doctor", "Shopkeeper", "Driver", "Student", "Nurse", "Carpenter", "Electrician"];

export const members = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `Member ${i + 1}`,
    village_id: (i % 35) + 1, // Distribute among villages
    photo: `https://i.pravatar.cc/150?u=${i + 1}`,
    profession: professions[Math.floor(Math.random() * professions.length)],
    status: i < 40 ? "Active" : "Pending", // 40 Active, 10 Pending
    joined_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0],
}));

// 10 Fake Donation Records
export const donations = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    user_id: Math.floor(Math.random() * 50) + 1,
    amount: [500, 1000, 2000, 5000][Math.floor(Math.random() * 4)],
    village_id: Math.floor(Math.random() * 35) + 1,
    date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
    status: "Completed",
}));

// Mock Admin Data
export const adminStats = {
    totalCollection: donations.reduce((sum, d) => sum + d.amount, 0),
    currentBalance: donations.reduce((sum, d) => sum + d.amount, 0) * 0.8, // Assume some expenses
    highestDonor: "Member 5",
};

// Mock Donation Events
export const donationEvents = [
  {
    id: 1,
    title: "Annual Village Fair 2024",
    description: "Support the organizing of our biggest annual community gathering. Funds will go towards food, decorations, and cultural performances.",
    goal: 500000,
    raised: 350000,
    image: "https://images.unsplash.com/photo-1533230557672-04cb5d73fe91?q=80&w=2574&auto=format&fit=crop",
    category: "Event"
  },
  {
    id: 2,
    title: "Village School Renovation",
    description: "The primary school in Village-A1 needs urgent roof repairs and new furniture for the students.",
    goal: 200000,
    raised: 120000,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2664&auto=format&fit=crop",
    category: "Infrastructure"
  },
  {
    id: 3,
    title: "Community Medical Camp",
    description: "Free health checkups and medicine distribution for elderly members across all villages.",
    goal: 100000,
    raised: 45000,
    image: "https://images.unsplash.com/photo-1584515933487-98db75f637b4?q=80&w=2670&auto=format&fit=crop",
    category: "Health"
  },
  {
    id: 4,
    title: "Clean Water Initiative",
    description: "Installing water purifiers in community halls of 5 drought-prone villages.",
    goal: 300000,
    raised: 280000,
    image: "https://images.unsplash.com/photo-1538300342684-f201f2d6af46?q=80&w=2669&auto=format&fit=crop",
    category: "Environment"
  }
];
