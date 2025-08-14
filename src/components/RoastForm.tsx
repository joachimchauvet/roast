import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { DatePicker } from "./ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RateLimitBanner } from "./RateLimitBanner";

const COMMON_NATIONALITIES = [
  "American", "British", "Canadian", "Australian", "German", "French", 
  "Italian", "Spanish", "Japanese", "Chinese", "Korean", "Indian", 
  "Brazilian", "Mexican", "Russian", "Dutch", "Swedish", "Norwegian",
  "Danish", "Finnish", "Polish", "Portuguese", "Irish", "Scottish",
  "South African", "New Zealander", "Swiss", "Austrian", "Belgian",
  "Greek", "Turkish", "Egyptian", "Nigerian", "Kenyan", "Other"
];

export function RoastForm() {
  const navigate = useNavigate();
  const createRoast = useMutation(api.roasts.createRoast);
  const rateLimitInfo = useQuery(api.roasts.checkRateLimit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    birthdate: undefined as Date | undefined,
    hobbies: "",
    nationality: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.birthdate || !formData.hobbies || !formData.nationality) {
      toast.error("Please fill in all fields!");
      return;
    }

    setIsSubmitting(true);
    try {
      const roastId = await createRoast({
        name: formData.name,
        birthdate: formData.birthdate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        hobbies: formData.hobbies,
        nationality: formData.nationality,
      });
      navigate(`/roast/${roastId}`);
    } catch (error) {
      console.error("Error creating roast:", error);
      
      if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
        toast.error("Rate limit exceeded! Please try again in a few hours or run locally.");
      } else {
        toast.error("Failed to create roast. Please try again!");
      }
      
      setIsSubmitting(false);
    }
  };

  const canSubmit = rateLimitInfo?.canCreate !== false && !isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
      <div className="w-full max-w-lg mx-auto">
        <RateLimitBanner />
        
        <Card className="w-full shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            🔥 The Roaster 🔥
          </CardTitle>
          <CardDescription className="text-lg">
            Enter your details and prepare to be roasted!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={isSubmitting}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Birth Date
              </Label>
              <DatePicker
                date={formData.birthdate}
                setDate={(date) => setFormData(prev => ({ ...prev, birthdate: date }))}
                placeholder="Select your birth date"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Nationality
              </Label>
              <Select 
                value={formData.nationality} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your nationality" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_NATIONALITIES.map((nationality) => (
                    <SelectItem key={nationality} value={nationality}>
                      {nationality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hobbies" className="text-sm font-medium">
                Hobbies & Interests
              </Label>
              <Textarea
                id="hobbies"
                placeholder="e.g., Gaming, cooking, hiking, reading sci-fi, collecting vintage stamps..."
                value={formData.hobbies}
                onChange={(e) => setFormData(prev => ({ ...prev, hobbies: e.target.value }))}
                disabled={isSubmitting}
                required
                rows={3}
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Preparing your roast...
                </>
              ) : rateLimitInfo?.canCreate === false ? (
                "Rate Limit Reached 🚫"
              ) : (
                "Get Roasted! 🔥"
              )}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate("/leaderboard")}
              disabled={isSubmitting}
              className="w-full"
            >
              View Hall of Fame →
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}