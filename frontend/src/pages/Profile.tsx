import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon, MapPin, Phone, Mail, Tractor } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: "+233 24 000 0000",
    location: "Ashanti Region",
    town: "Ejisu",
    farmType: "Crop Farming",
    farmSize: "15",
    yearsExperience: "8",
    mainCrops: "Maize, Cassava",
    bio: "Experienced farmer specializing in maize and cassava production in the Ashanti Region.",
  });

  const handleSave = () => {
    toast.success("Profile updated locally! (Backend update coming soon)");
  };

  const update = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your farm profile information</p>
      </div>

      <Card className="border-white/5 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold shadow-xl overflow-hidden border border-white/20">
              {profile.firstName?.[0] || ""}
              {profile.lastName?.[0] || "U"}
            </div>
            <div>
              <CardTitle className="text-xl">{profile.firstName} {profile.lastName}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {profile.location}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-white/5 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><UserIcon className="h-4 w-4" /> Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={profile.firstName} onChange={(e) => update("firstName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={profile.lastName} onChange={(e) => update("lastName", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
              <Input type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label>
              <Input value={profile.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Region</Label>
              <Input value={profile.location} onChange={(e) => update("location", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Town / District</Label>
              <Input value={profile.town} onChange={(e) => update("town", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Tractor className="h-4 w-4" /> Farm Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Farm Type</Label>
              <Select value={profile.farmType} onValueChange={(v) => update("farmType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crop Farming">Crop Farming</SelectItem>
                  <SelectItem value="Livestock">Livestock</SelectItem>
                  <SelectItem value="Mixed Farming">Mixed Farming</SelectItem>
                  <SelectItem value="Poultry">Poultry</SelectItem>
                  <SelectItem value="Aquaculture">Aquaculture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Farm Size (Acres)</Label>
              <Input type="number" value={profile.farmSize} onChange={(e) => update("farmSize", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input type="number" value={profile.yearsExperience} onChange={(e) => update("yearsExperience", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Main Crops / Livestock</Label>
              <Input value={profile.mainCrops} onChange={(e) => update("mainCrops", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea rows={3} value={profile.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>
          <Button onClick={handleSave} className="w-full">Save Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
