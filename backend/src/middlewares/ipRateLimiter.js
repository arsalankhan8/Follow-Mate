import { RateLimiterMemory } from "rate-limiter-flexible";

// Configure IP-based limiter
const ipLimiter = new RateLimiterMemory({
  points: 500, // max 5 requests
  duration: 900, // per 15 minutes
});

export const ipRateLimiter = (message = "Too many requests from this IP, please try later.") => {
  return async (req, res, next) => {
    try {
      await ipLimiter.consume(req.ip);
      const info = await ipLimiter.get(req.ip);
      console.log(`IP: ${req.ip} | Remaining points: ${info?.remainingPoints || 5}`);
      next();
    } catch {
      res.status(429).json({ msg: message });
    }
  };
};