import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Env-driven URL (matches prismaClient.ts + prisma.config.ts) so the seed can
// target an isolated DB — e.g. the e2e suite seeds file:prisma/e2e.db, never dev.db.
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();

  // 1. Bella Napoli — Italian
  await prisma.restaurant.create({
    data: {
      name: "Bella Napoli",
      cuisine: "Italian",
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
      ratingAvg: 4.7,
      ratingCount: 320,
      deliveryMinutes: 30,
      deliveryFeeCents: 199,
      priceLevel: 2,
      description: "Authentic Neapolitan pizza and handmade pasta, straight from the wood-fired oven.",
      menuItems: {
        create: [
          {
            name: "Margherita Pizza",
            description: "San Marzano tomato, fior di latte mozzarella, fresh basil, extra-virgin olive oil",
            priceCents: 1290,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Pasta Carbonara",
            description: "Rigatoni, guanciale, egg yolk, aged pecorino romano, cracked black pepper",
            priceCents: 1490,
            dietaryTags: "",
            imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Caprese Salad",
            description: "Buffalo mozzarella, heirloom tomatoes, basil pesto, aged balsamic",
            priceCents: 950,
            dietaryTags: "vegetarian,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600",
            category: "Starters",
            popular: false,
          },
          {
            name: "Bruschetta al Pomodoro",
            description: "Grilled sourdough, crushed tomatoes, garlic, basil oil",
            priceCents: 750,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1600289031464-74d374b64991?w=600",
            category: "Starters",
            popular: false,
          },
          {
            name: "Tiramisu",
            description: "Espresso-soaked ladyfingers, mascarpone cream, cocoa dust",
            priceCents: 690,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600",
            category: "Desserts",
            popular: false,
          },
          {
            name: "Sparkling Water",
            description: "San Pellegrino 500 ml",
            priceCents: 290,
            dietaryTags: "vegan,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600",
            category: "Drinks",
            popular: false,
          },
        ],
      },
    },
  });

  // 2. Green Bowl — Healthy
  await prisma.restaurant.create({
    data: {
      name: "Green Bowl",
      cuisine: "Healthy",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
      ratingAvg: 4.5,
      ratingCount: 185,
      deliveryMinutes: 20,
      deliveryFeeCents: 0,
      priceLevel: 2,
      description: "Nourishing bowls, vibrant salads, and cold-pressed juices to fuel your day.",
      menuItems: {
        create: [
          {
            name: "Buddha Bowl",
            description: "Quinoa, roasted chickpeas, avocado, edamame, tahini dressing",
            priceCents: 1250,
            dietaryTags: "vegan,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Caesar Salad",
            description: "Crisp romaine, shaved parmesan, sourdough croutons, anchovy-free dressing",
            priceCents: 1050,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600",
            category: "Mains",
            popular: false,
          },
          {
            name: "Falafel Wrap",
            description: "Crispy falafel, hummus, pickled red cabbage, cucumber, tahini",
            priceCents: 990,
            dietaryTags: "vegan",
            imageUrl: "https://images.unsplash.com/photo-1533007716222-4b465613a984?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Acai Starter Pot",
            description: "Frozen acai, banana, granola, fresh strawberries, honey drizzle",
            priceCents: 890,
            dietaryTags: "vegan",
            imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600",
            category: "Starters",
            popular: false,
          },
          {
            name: "Berry Smoothie",
            description: "Blueberries, raspberries, banana, oat milk, chia seeds",
            priceCents: 650,
            dietaryTags: "vegan,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600",
            category: "Drinks",
            popular: false,
          },
        ],
      },
    },
  });

  // 3. Sushi Zen — Japanese
  await prisma.restaurant.create({
    data: {
      name: "Sushi Zen",
      cuisine: "Japanese",
      imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600",
      ratingAvg: 4.8,
      ratingCount: 412,
      deliveryMinutes: 35,
      deliveryFeeCents: 299,
      priceLevel: 3,
      description: "Omakase-inspired sushi and traditional Japanese small plates, crafted with daily-fresh fish.",
      menuItems: {
        create: [
          {
            name: "Salmon Nigiri (4 pc)",
            description: "Wild Atlantic salmon, sushi rice, wasabi, pickled ginger",
            priceCents: 1150,
            dietaryTags: "gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Dragon Roll (8 pc)",
            description: "Prawn tempura, avocado top, tobiko, unagi sauce",
            priceCents: 1690,
            dietaryTags: "",
            imageUrl: "https://images.unsplash.com/photo-1617196034738-26c5f7c977ce?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Veggie Roll (6 pc)",
            description: "Cucumber, avocado, pickled carrot, sesame seeds",
            priceCents: 890,
            dietaryTags: "vegan",
            imageUrl: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=600",
            category: "Mains",
            popular: false,
          },
          {
            name: "Edamame",
            description: "Steamed soy beans, flaked sea salt",
            priceCents: 490,
            dietaryTags: "vegan,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1582450871972-ab5ca641643d?w=600",
            category: "Starters",
            popular: false,
          },
          {
            name: "Miso Soup",
            description: "White miso, silken tofu, wakame seaweed, spring onion",
            priceCents: 390,
            dietaryTags: "vegetarian,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600",
            category: "Starters",
            popular: false,
          },
          {
            name: "Matcha Ice Cream",
            description: "House-made ceremonial-grade matcha ice cream",
            priceCents: 590,
            dietaryTags: "vegetarian,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600",
            category: "Desserts",
            popular: false,
          },
          {
            name: "Iced Yuzu Lemonade",
            description: "Fresh yuzu juice, sparkling water, honey, mint",
            priceCents: 450,
            dietaryTags: "vegan,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=600",
            category: "Drinks",
            popular: false,
          },
        ],
      },
    },
  });

  // 4. Smoke & Bun — Burgers
  await prisma.restaurant.create({
    data: {
      name: "Smoke & Bun",
      cuisine: "Burgers",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
      ratingAvg: 4.6,
      ratingCount: 298,
      deliveryMinutes: 25,
      deliveryFeeCents: 0,
      priceLevel: 1,
      description: "Smash-patty burgers, crispy fries, and loaded milkshakes — unapologetically indulgent.",
      menuItems: {
        create: [
          {
            name: "Classic Smash Burger",
            description: "Double smash patty, American cheese, dill pickles, burger sauce, brioche bun",
            priceCents: 1290,
            dietaryTags: "",
            imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Crispy Chicken Burger",
            description: "Buttermilk-fried chicken thigh, slaw, sriracha mayo, toasted sesame bun",
            priceCents: 1390,
            dietaryTags: "",
            imageUrl: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Portobello Veggie Burger",
            description: "Grilled portobello, beetroot hummus, rocket, halloumi, brioche bun",
            priceCents: 1190,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600",
            category: "Mains",
            popular: false,
          },
          {
            name: "Loaded Fries",
            description: "Skin-on fries, smoked cheddar sauce, crispy onions, jalapenos",
            priceCents: 690,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
            category: "Starters",
            popular: false,
          },
          {
            name: "Onion Rings",
            description: "Beer-battered rings, chipotle dip",
            priceCents: 590,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600",
            category: "Starters",
            popular: false,
          },
          {
            name: "Vanilla Milkshake",
            description: "Thick hand-spun vanilla milkshake with whipped cream",
            priceCents: 590,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600",
            category: "Drinks",
            popular: false,
          },
        ],
      },
    },
  });

  // 5. Taco Libre — Mexican
  await prisma.restaurant.create({
    data: {
      name: "Taco Libre",
      cuisine: "Mexican",
      imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600",
      ratingAvg: 4.4,
      ratingCount: 156,
      deliveryMinutes: 25,
      deliveryFeeCents: 149,
      priceLevel: 1,
      description: "Street-style tacos, smoky burritos, and fresh guac — bold flavours from Mexico City.",
      menuItems: {
        create: [
          {
            name: "Al Pastor Tacos (3)",
            description: "Marinated pork, pineapple salsa, cilantro, white onion, corn tortillas",
            priceCents: 1090,
            dietaryTags: "gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Veggie Burrito",
            description: "Black beans, roasted peppers, guac, salsa verde, sour cream, flour tortilla",
            priceCents: 1190,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600",
            category: "Mains",
            popular: false,
          },
          {
            name: "Chicken Quesadilla",
            description: "Chargrilled chicken, Oaxacan cheese, chipotle crema, pico de gallo",
            priceCents: 1150,
            dietaryTags: "",
            imageUrl: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Fresh Guacamole & Chips",
            description: "Hand-mashed Hass avocado, lime, jalapeno, red onion, tortilla chips",
            priceCents: 790,
            dietaryTags: "vegan,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=600",
            category: "Starters",
            popular: false,
          },
          {
            name: "Churros with Chocolate",
            description: "Cinnamon-sugar churros, warm dark chocolate dip",
            priceCents: 650,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600",
            category: "Desserts",
            popular: false,
          },
          {
            name: "Horchata",
            description: "Traditional rice water with cinnamon and vanilla",
            priceCents: 390,
            dietaryTags: "vegan,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600",
            category: "Drinks",
            popular: false,
          },
        ],
      },
    },
  });

  // 6. Spice Route — Indian
  await prisma.restaurant.create({
    data: {
      name: "Spice Route",
      cuisine: "Indian",
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600",
      ratingAvg: 4.9,
      ratingCount: 387,
      deliveryMinutes: 40,
      deliveryFeeCents: 249,
      priceLevel: 2,
      description: "Slow-cooked curries, charcoal tandoor breads, and fragrant biryanis from across the subcontinent.",
      menuItems: {
        create: [
          {
            name: "Butter Chicken",
            description: "Tandoor-roasted chicken in a rich tomato-cream masala, fragrant with cardamom and fenugreek",
            priceCents: 1490,
            dietaryTags: "gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Lamb Biryani",
            description: "Slow-cooked lamb, saffron basmati, crispy onions, raita, mint",
            priceCents: 1690,
            dietaryTags: "gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Paneer Tikka Masala",
            description: "Chargrilled paneer cubes in a smoky spiced tomato gravy",
            priceCents: 1390,
            dietaryTags: "vegetarian,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
            category: "Mains",
            popular: false,
          },
          {
            name: "Samosa Chaat (2 pc)",
            description: "Crispy samosas, chickpea curry, tamarind chutney, yoghurt, pomegranate",
            priceCents: 890,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
            category: "Starters",
            popular: false,
          },
          {
            name: "Garlic Naan",
            description: "Tandoor-baked leavened bread with garlic butter and fresh coriander",
            priceCents: 390,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600",
            category: "Starters",
            popular: false,
          },
          {
            name: "Mango Lassi",
            description: "Chilled Alphonso mango, strained yoghurt, cardamom",
            priceCents: 490,
            dietaryTags: "vegetarian,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600",
            category: "Drinks",
            popular: false,
          },
          {
            name: "Gulab Jamun",
            description: "Soft milk-solids dumplings in rose-water sugar syrup, cardamom ice cream",
            priceCents: 590,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=600",
            category: "Desserts",
            popular: false,
          },
        ],
      },
    },
  });

  // 7. Petit Four — Bakery & Desserts
  await prisma.restaurant.create({
    data: {
      name: "Petit Four",
      cuisine: "Bakery",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
      ratingAvg: 4.6,
      ratingCount: 94,
      deliveryMinutes: 20,
      deliveryFeeCents: 0,
      priceLevel: 2,
      description: "French-inspired patisserie and all-day brunch — croissants, eclairs, and creamy quiches.",
      menuItems: {
        create: [
          {
            name: "Butter Croissant",
            description: "72-hour laminated dough, pure Normandy butter, flaky and honeyed",
            priceCents: 390,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
            category: "Starters",
            popular: true,
          },
          {
            name: "Quiche Lorraine",
            description: "Shortcrust pastry, smoked bacon lardons, gruyere, silky egg custard",
            priceCents: 990,
            dietaryTags: "",
            imageUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600",
            category: "Mains",
            popular: true,
          },
          {
            name: "Croque Monsieur",
            description: "Thick sourdough, bechamel, smoked ham, melted comte",
            priceCents: 1090,
            dietaryTags: "",
            imageUrl: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600",
            category: "Mains",
            popular: false,
          },
          {
            name: "Chocolate Eclair",
            description: "Choux pastry, dark chocolate ganache glaze, vanilla diplomat cream",
            priceCents: 490,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600",
            category: "Desserts",
            popular: false,
          },
          {
            name: "Lemon Tart",
            description: "Pate sucree shell, silky lemon curd, Italian meringue kisses",
            priceCents: 490,
            dietaryTags: "vegetarian",
            imageUrl: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=600",
            category: "Desserts",
            popular: false,
          },
          {
            name: "Cafe au Lait",
            description: "Double espresso with steamed whole milk",
            priceCents: 350,
            dietaryTags: "vegetarian,gluten-free",
            imageUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600",
            category: "Drinks",
            popular: false,
          },
        ],
      },
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
