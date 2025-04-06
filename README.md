# UMD Dining Hall Menu

A simple Node.js module to fetch the UMD dining hall menu and provide AI meal recommendations based on your fitness goals.

## Features

- **Real-time Menu Data**: Fetches and parses current menus from UMD dining halls
- **AI Recommendations**: Uses Google's Gemini AI to suggest optimal meal choices
- **Personalized Nutrition**: Customizable to your specific fitness goals, calorie targets, and dietary preferences
- **Multiple Dining Halls**: Support for all UMD dining halls
- **Easy CLI Interface**: Simple commands for fetching menus and generating recommendations


## Setup

### API Key Configuration

To use the meal recommendation feature, you'll need a Gemini API key:

1. Get an API key from [Google AI Studio](https://ai.google.dev/)
2. Create a `.env` file in the project root
3. Add your API key to the `.env` file

## Usage

### Command Line

The project includes several convenient npm scripts for common operations:

```bash
# Show help information
npm start

# Fetch menu from dining halls
npm run menu        # Default (Yahentamitsi)
npm run menu:y      # Yahentamitsi
npm run menu:south  # South Campus
npm run menu:251    # 251 North

# Get AI-powered meal recommendations
npm run recommend        # Default (Yahentamitsi)
npm run recommend:y      # Yahentamitsi
npm run recommend:south  # South Campus
npm run recommend:251    # 251 North

# Update your personal fitness parameters
npm run update-params
```

### Sample Output

When you run `npm run recommend`, you'll receive personalized meal recommendations like this:

```
=== MEAL RECOMMENDATIONS ===

- Lunch: [Grilled Chipotle Lime Chicken, Fresh Steamed Broccoli, Mixed Greens salad with vegetables] – 
  High-protein, low-carb option with plenty of vegetables for fiber and nutrients.

- Dinner: [Asian Chicken Mongolian Grill with Brown Rice, extra vegetables] – 
  Balanced meal with lean protein, complex carbs, and vegetables to hit remaining protein targets.
```

## Dining Hall Locations

| Location Number | Dining Hall Name         |
|-----------------|--------------------------|
| 19              | Yahentamitsi Dining Hall |
| 16              | South Campus Dining Hall |
| 38              | 251 North Dining Hall    |

## Environment Variables

### Sample `.env` File

```
# Gemini API Key
GEMINI_API_KEY=your_api_key_here

# Personal Fitness Parameters
USER_WEIGHT=165-170
USER_CALORIE_TARGET=1800-2000
USER_PROTEIN_TARGET=130
USER_BREAKFAST_CALORIES=600
USER_BREAKFAST_PROTEIN=23
USER_TRAINING_FREQUENCY=4-5
USER_FITNESS_GOALS=Lose fat,Maintain muscle,Minimize refined carbs and excess fat

# Breakfast Details
USER_BREAKFAST_ITEMS=Jimmy Dean breakfast sandwich (approx. 350 calories 14g protein),1 Clif Bar (250 calories 9g protein)
```

| Environment Variable    | Description                                    | Default Value                                      |
|-------------------------|------------------------------------------------|---------------------------------------------------|
| USER_WEIGHT             | Your weight in pounds                          | "165-170"                                          |
| USER_CALORIE_TARGET     | Daily calorie target                           | "1800-2000"                                        |
| USER_PROTEIN_TARGET     | Daily protein target in grams                  | "130"                                              |
| USER_BREAKFAST_CALORIES | Breakfast calories already consumed            | "600"                                              |
| USER_BREAKFAST_PROTEIN  | Breakfast protein already consumed in grams    | "23"                                               |
| USER_TRAINING_FREQUENCY | Weekly resistance training frequency           | "4-5"                                              |
| USER_FITNESS_GOALS      | Comma-separated list of fitness goals          | "Lose fat,Maintain muscle,Minimize refined carbs"  |
| USER_BREAKFAST_ITEMS    | Comma-separated list of breakfast items eaten  | "Jimmy Dean breakfast sandwich,1 Clif Bar"         |
