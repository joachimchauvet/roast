import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Github, ExternalLink, AlertTriangle, Zap } from "lucide-react";
import { Button } from "./ui/button";

export function RateLimitBanner() {
  const rateLimitInfo = useQuery(api.roasts.checkRateLimit);

  if (!rateLimitInfo) {
    return null;
  }

  const { canCreate, recentCount, resetTime } = rateLimitInfo;

  // Calculate time until reset
  const timeUntilReset = resetTime ? Math.max(0, resetTime - Date.now()) : 0;
  const hoursUntilReset = Math.ceil(timeUntilReset / (1000 * 60 * 60));
  const minutesUntilReset = Math.ceil(timeUntilReset / (1000 * 60));

  if (canCreate) {
    // Show usage counter when under limit
    const remaining = 20 - recentCount;
    return (
      <Card className="mb-4 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Server Usage
              </span>
            </div>
            <Badge variant="outline" className="text-xs bg-white/50">
              {remaining} roasts remaining
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show rate limit exceeded message
  return (
    <Card className="mb-6 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950">
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Server Limit Reached! 🔥
            </h3>
          </div>
          
          <p className="text-sm text-red-700 dark:text-red-300 max-w-md">
            Our AI roasting service has generated <strong>20 roasts</strong> in the past 3 hours 
            to keep costs manageable. 
          </p>

          <div className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
            <Clock className="h-4 w-4" />
            <span>
              Try again in{" "}
              {hoursUntilReset > 1 
                ? `~${hoursUntilReset} hours` 
                : `~${minutesUntilReset} minutes`
              }
            </span>
          </div>

          <div className="pt-2 border-t border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400 mb-3">
              Want unlimited roasting? Run it locally:
            </p>
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
              onClick={() => window.open('https://github.com/joachimchauvet/roast', '_blank')}
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub Repository
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}