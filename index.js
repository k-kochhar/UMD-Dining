import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import readline from "readline";

// Load environment variables
dotenv.config();

/**
 * Fetches and parses the UMD dining hall menu
 * @param {string} locationNum - UMD location number (e.g. 19 for Yahentamitsi)
 * @param {string} date - Date in MM/DD/YYYY format
 * @returns {Promise<Array>} Array of meals with type and items
 */
async function getDiningHallMenu(locationNum = "19") {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const url = `https://nutrition.umd.edu/?locationNum=${locationNum}&dtdate=${currentDate}`;

  console.log(currentDate);
  console.log(url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const cards = document.querySelectorAll(".card");
    const meals = [];

    cards.forEach((card) => {
      const mealType = card.querySelector("h5.card-title")?.textContent?.trim();
      if (!mealType) return;

      const items = Array.from(card.querySelectorAll(".menu-item-name")).map((el) =>
        el.textContent.trim()
      );

      if (items.length > 0) {
        meals.push({ mealType, items });
      }
    });

    return meals;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

/**
 * Generates meal recommendations based on dining hall menu and fitness goals
 * @param {Array} menuData - Menu data from getDiningHallMenu
 * @returns {Promise<string>} AI-generated meal recommendations
 */
async function getMealRecommendations(menuData) {
  // Check if API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key not configured. Please add it to your .env file.");
  }

  console.log("\nFetching meal recommendations from Gemini AI...");
  
  // Get personal fitness parameters from environment variables
  // Sample inputs:
  // USER_WEIGHT=165-170
  // USER_CALORIE_TARGET=1800-2000
  // USER_PROTEIN_TARGET=130
  // USER_BREAKFAST_CALORIES=600
  // USER_BREAKFAST_PROTEIN=23
  // USER_TRAINING_FREQUENCY=4-5
  const weight = process.env.USER_WEIGHT;
  const calorieTarget = process.env.USER_CALORIE_TARGET;
  const proteinTarget = process.env.USER_PROTEIN_TARGET;
  const breakfastCalories = process.env.USER_BREAKFAST_CALORIES;
  const breakfastProtein = process.env.USER_BREAKFAST_PROTEIN;
  const trainingFrequency = process.env.USER_TRAINING_FREQUENCY;
  
  // Parse fitness goals from environment variable
  const fitnessGoalsString = process.env.USER_FITNESS_GOALS;
  const fitnessGoals = fitnessGoalsString.split(',').map(goal => `- ${goal.trim()}`).join('\n');
  
  // Parse breakfast items from environment variable
  const breakfastItemsString = process.env.USER_BREAKFAST_ITEMS;
  const breakfastItems = breakfastItemsString.split(',').map(item => `- ${item.trim()}`).join('\n');
  
  // Calculate remaining protein and calories
  const remainingProtein = parseInt(proteinTarget) - parseInt(breakfastProtein);
  const remainingCalories = parseInt(calorieTarget.split('-')[1] || calorieTarget) - parseInt(breakfastCalories);
  
  // Initialize the Google AI API
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  // Prepare the prompt with dynamic variables
  const prompt = `
    I'm a college student eating at the dining hall for lunch and dinner today.

    My fitness goals are to:
    ${fitnessGoals}
    - Stay in a ~${calorieTarget} calorie range
    - Prioritize ~${proteinTarget}g of protein per day

    My current stats:
    - ${weight} lbs
    - Creatine supplementation
    - Resistance training ${trainingFrequency}x/week

    **Breakfast already consumed**:
    ${breakfastItems}

    **Total so far**: ~${breakfastCalories} calories, ~${breakfastProtein}g protein

    Here is today's dining hall menu:

    ${JSON.stringify(menuData, null, 2)}

    Please recommend what I should eat at:
    - **Lunch**
    - **Dinner**

    Return in this format:
    - Lunch: [item list] – explanation
    - Dinner: [item list] – explanation

    Recommendations should:
    - Hit remaining protein targets (~${remainingProtein}g+ from lunch/dinner)
    - Stay under ${remainingCalories} calories for both meals combined
    - Favor grilled/lean proteins, fiber-rich veggies, and whole carbs
`;

  try {
    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw error;
  }
}

// For CLI testing
if (process.argv[1] === new URL(import.meta.url).pathname) {
  // When using npm scripts like "npm run menu", the actual command will be in process.argv[2]
  // When running directly with node, the command will be in process.argv[2] as well
  let args = process.argv.slice(2);
  const command = args[0] || "help";
  const locationNum = args[1] || "19";
  
  switch (command) {
    case "menu":
      console.log(`\nFetching dining hall menu for location ${locationNum}...\n`);
      getDiningHallMenu(locationNum)
        .then((data) => {
          console.log(JSON.stringify(data, null, 2));
          console.log(`\nData fetched successfully for ${data.length} meal categories.`);
        })
        .catch((err) => {
          console.error("Fetch failed:", err);
          process.exit(1);
        });
      break;
      
    case "recommend":
      console.log(`\nFetching dining hall menu for location ${locationNum}...\n`);
      getDiningHallMenu(locationNum)
        .then((menuData) => getMealRecommendations(menuData))
        .then((recommendations) => {
          console.log("\n=== MEAL RECOMMENDATIONS ===\n");
          console.log(recommendations);
        })
        .catch((err) => {
          console.error("\nError:", err.message);
          process.exit(1);
        });
      break;
      
    case "update-params":
      updatePersonalParameters()
        .catch(err => {
          console.error("\nError:", err.message);
          process.exit(1);
        });
      break;
      
    case "help":
    default:
      console.log(`
Usage:
  npm start                      - Show help information
  npm start menu [locationNum]   - Fetch dining hall menu (default location: 19)
  npm start recommend [locationNum] - Get meal recommendations based on menu
  npm start update-params        - Update personal fitness parameters
  
Common Location Numbers:
  19 - Yahentamitsi Dining Hall
  16 - South Campus Dining Hall
  38 - 251 North Dining Hall
      `);
      break;
  }
}

export { getDiningHallMenu, getMealRecommendations };
