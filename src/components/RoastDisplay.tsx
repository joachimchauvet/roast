import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Loader2, Home, Trophy, Calendar, MapPin, Heart, Share, Copy, Check } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";
import { format } from "date-fns";
import { toast } from "sonner";

export function RoastDisplay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);
  
  const roast = useQuery(api.roasts.getRoast, 
    id ? { id: id as Id<"roasts"> } : "skip"
  );

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Invalid roast ID</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!roast) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
          <CardContent className="pt-8">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              <div className="space-y-2 text-center">
                <Skeleton className="h-4 w-48 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isGenerating = roast.roastText === "Generating your roast...";
  const birthDate = new Date(roast.birthdate);

  const handleShare = async () => {
    const url = window.location.href;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Main Roast Card */}
        <Card className="shadow-xl border-2 border-orange-200 dark:border-orange-800">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {roast.zodiacSign}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {roast.nationality}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                🔥 {roast.name} Got Roasted! 🔥
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription className="flex items-center justify-center text-base">
              <Calendar className="w-4 h-4 mr-2" />
              Born {format(birthDate, "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Roast Image */}
            {roast.imageUrl && (
              <div className="flex justify-center">
                <div className="relative group">
                  <img 
                    src={roast.imageUrl} 
                    alt={`${roast.name}'s caricature`}
                    className="rounded-xl shadow-lg max-w-full h-auto transition-transform group-hover:scale-105"
                    style={{ maxHeight: "400px" }}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            )}
            
            {/* Roast Text */}
            <Card className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 border-orange-200 dark:border-orange-700">
              <CardContent className="p-6">
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-3 py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                ) : (
                  <blockquote className="text-lg md:text-xl leading-relaxed font-medium text-center italic">
                    "{roast.roastText}"
                  </blockquote>
                )}
              </CardContent>
            </Card>

            {/* User Details */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <Heart className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground mb-1">
                      Hobbies & Interests:
                    </p>
                    <p className="text-sm">
                      {roast.hobbies}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate("/")}
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Home className="mr-2 h-5 w-5" />
            Get Another Roast
          </Button>
          <Button 
            onClick={handleShare}
            variant="outline"
            className="flex-1 h-12 border-2 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-green-950 dark:hover:to-blue-950"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-5 w-5 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Share className="mr-2 h-5 w-5 text-blue-600" />
                Share Link
              </>
            )}
          </Button>
          <Button 
            onClick={() => navigate("/leaderboard")}
            variant="outline"
            className="flex-1 h-12 border-2 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-950 dark:hover:to-orange-950"
          >
            <Trophy className="mr-2 h-5 w-5 text-yellow-600" />
            Hall of Fame
          </Button>
        </div>
      </div>
    </div>
  );
}