import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Home, Loader2, Trophy, Clock, MapPin, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Leaderboard() {
  const navigate = useNavigate();
  const roasts = useQuery(api.roasts.listRoasts);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950 dark:via-orange-950 dark:to-red-950">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-xl border-2 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              🏆 Hall of Fame 🏆
            </CardTitle>
            <CardDescription className="text-lg">
              The most epic roasts in history
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Content */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {!roasts ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex gap-4">
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : roasts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No roasts yet!</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first brave soul to get roasted and claim your spot in the Hall of Fame!
                  </p>
                </div>
                <Button 
                  onClick={() => navigate("/")}
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  Be the First!
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {roasts.map((roast, index) => {
                  const isGenerating = roast.roastText === "Generating your roast...";
                  const rank = index + 1;
                  const isTopThree = rank <= 3;
                  
                  return (
                    <Card 
                      key={roast._id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                        isTopThree ? 'ring-2 ring-yellow-300 dark:ring-yellow-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => navigate(`/roast/${roast._id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Rank & Avatar */}
                          <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                              rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                              rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                            </div>
                            
                            <Avatar className="w-12 h-12 border-2 border-muted">
                              <AvatarImage src={roast.imageUrl} />
                              <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 text-orange-700 dark:text-orange-300 font-semibold">
                                {roast.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-lg truncate">
                                  {roast.name}
                                  {isTopThree && <span className="ml-2">✨</span>}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {roast.zodiacSign}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {roast.nationality}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex flex-col items-end text-xs text-muted-foreground ml-4">
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatDistanceToNow(new Date(roast.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                            
                            {/* Roast Preview */}
                            <div className="bg-muted/30 rounded-lg p-3">
                              {isGenerating ? (
                                <div className="flex items-center space-x-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                                  <span className="text-sm text-muted-foreground italic">
                                    AI is crafting this masterpiece...
                                  </span>
                                </div>
                              ) : (
                                <p className="text-sm line-clamp-2 italic">
                                  "{roast.roastText}"
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => navigate("/")}
            size="lg"
            className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-semibold"
          >
            <Home className="mr-2 h-5 w-5" />
            Get Your Own Roast
          </Button>
        </div>
      </div>
    </div>
  );
}