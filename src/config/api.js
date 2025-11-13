export const API_CONFIG = {
  key: import.meta.env.VITE_AGENT_ROUTER_API_KEY || import.meta.env.AGENT_ROUTER_API_KEY || "",
  retryAttempts: 3,
  retryDelay: 1000,
  sampleCount: 4, // Generate 4 logo variations
  modelName: "dall-e-3", // GPT DALL-E model for text-to-image
  baseUrl: "https://agentrouter.org",
  endpoint: "/v1/images/generations",
};
