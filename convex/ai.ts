"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

// Action to generate roast content using LLM
export const generateRoastContent = internalAction({
  args: {
    roastId: v.id("roasts"),
    name: v.string(),
    birthdate: v.string(),
    hobbies: v.string(),
    nationality: v.string(),
    zodiacSign: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("OPENAI_API_KEY not configured");
      await ctx.runMutation(internal.roasts.updateRoastContent, {
        roastId: args.roastId,
        roastText: "Sorry, I couldn't generate a roast. The comedy AI is on a coffee break! ☕",
      });
      return null;
    }

    try {
      // Generate the roast using OpenAI
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system: "You are a witty comedian creating humorous, satirical roasts. Be funny and slightly edgy but not mean-spirited or offensive.",
        prompt: `Create a funny roast for someone with these characteristics:
        
Name: ${args.name}
Zodiac Sign: ${args.zodiacSign}
Nationality: ${args.nationality}
Hobbies: ${args.hobbies}

Create a short, punchy roast (2-3 sentences) that playfully stereotypes and exaggerates based on their zodiac sign, nationality, and hobbies. Include some emojis for fun.

Example style: "Oh great, another ${args.zodiacSign} from ${args.nationality} who thinks ${args.hobbies} makes them interesting! 🙄"`,
        temperature: 0.8,
        maxRetries: 2,
      });

      // Update the roast with the generated content
      await ctx.runMutation(internal.roasts.updateRoastContent, {
        roastId: args.roastId,
        roastText: text,
      });

      // Schedule image generation
      await ctx.scheduler.runAfter(0, internal.ai.generateRoastImage, {
        roastId: args.roastId,
        name: args.name,
        nationality: args.nationality,
        hobbies: args.hobbies,
        zodiacSign: args.zodiacSign,
        roastText: text,
      });
    } catch (error) {
      console.error("Error generating roast:", error);
      await ctx.runMutation(internal.roasts.updateRoastContent, {
        roastId: args.roastId,
        roastText: "The roast generator is experiencing technical difficulties. Even AI needs a moment sometimes! 🤖💔",
      });
    }

    return null;
  },
});

// Action to generate caricature image
export const generateRoastImage = internalAction({
  args: {
    roastId: v.id("roasts"),
    name: v.string(),
    nationality: v.string(),
    hobbies: v.string(),
    zodiacSign: v.string(),
    roastText: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const replicateKey = process.env.REPLICATE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    // Try to generate image with available service
    if (openaiKey) {
      try {
        // Generate with DALL-E 3
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: `A funny, exaggerated cartoon caricature portrait of a person. Style: colorful, humorous editorial cartoon. The person appears to be from ${args.nationality}, enjoys ${args.hobbies}, and has ${args.zodiacSign} personality traits. Make it playful and satirical but respectful. Digital art style.`,
            n: 1,
            size: "1024x1024",
            quality: "standard",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.data[0].url;
          
          // Download and store the image
          const imageResponse = await fetch(imageUrl);
          const imageBlob = await imageResponse.blob();
          
          // Store in Convex storage
          const storageId = await ctx.storage.store(imageBlob);
          
          // Update roast with image
          await ctx.runMutation(internal.roasts.updateRoastImage, {
            roastId: args.roastId,
            imageStorageId: storageId,
          });
        }
      } catch (error) {
        console.error("Error generating image:", error);
        // Image generation is optional, so we don't fail the whole process
      }
    } else if (replicateKey) {
      // Alternative: Use Replicate for image generation
      try {
        const response = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Token ${replicateKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e88e8f1b03e5e1410dc9e5a7f7b8e3d51d5e5c5c5c5c5",
            input: {
              prompt: `A funny cartoon caricature portrait, ${args.nationality} person who loves ${args.hobbies}, ${args.zodiacSign} personality, colorful editorial cartoon style`,
              negative_prompt: "realistic, photo, offensive, inappropriate",
            },
          }),
        });

        if (response.ok) {
          const prediction = await response.json();
          // Poll for completion
          let imageUrl = null;
          for (let i = 0; i < 30; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const statusResponse = await fetch(
              `https://api.replicate.com/v1/predictions/${prediction.id}`,
              {
                headers: {
                  "Authorization": `Token ${replicateKey}`,
                },
              }
            );
            const status = await statusResponse.json();
            if (status.status === "succeeded") {
              imageUrl = status.output[0];
              break;
            }
          }

          if (imageUrl) {
            const imageResponse = await fetch(imageUrl);
            const imageBlob = await imageResponse.blob();
            const storageId = await ctx.storage.store(imageBlob);
            
            await ctx.runMutation(internal.roasts.updateRoastImage, {
              roastId: args.roastId,
              imageStorageId: storageId,
            });
          }
        }
      } catch (error) {
        console.error("Error with Replicate:", error);
      }
    }

    return null;
  },
});