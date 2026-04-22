import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, CloudSun, Truck, ArrowLeft, Send, Bot, MapPin, Ruler, Leaf } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const apps = [
  {
    id: "credit-scoring",
    title: "Credit Scoring",
    description: "Check your credit score and loan eligibility based on your farm data and financial history.",
    icon: CreditCard,
    color: "bg-primary/10 text-primary",
    badge: "Finance",
  },
  {
    id: "forecasting",
    title: "Crop Forecasting",
    description: "Get AI-powered recommendations on crops to plant based on your farm size, location, and time of year.",
    icon: CloudSun,
    color: "bg-accent/20 text-accent-foreground",
    badge: "AI Powered",
  },
  {
    id: "input-distribution",
    title: "Input Distribution",
    description: "Track farm supplies, deliveries, and input inventory across your operations.",
    icon: Truck,
    color: "bg-secondary/50 text-secondary-foreground",
    badge: "Logistics",
  },
];

const CreditScoringApp = ({ onBack }: { onBack: () => void }) => {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateScore = () => {
    setLoading(true);
    setTimeout(() => {
      setScore(Math.floor(Math.random() * 300) + 500);
      setLoading(false);
    }, 1500);
  };

  const getScoreColor = (s: number) => {
    if (s >= 700) return "text-primary";
    if (s >= 600) return "text-accent-foreground";
    return "text-destructive";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 700) return "Excellent";
    if (s >= 600) return "Good";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Apps
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Credit Scoring</h1>
        <p className="text-muted-foreground">Assess your loan eligibility</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Farm Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Annual Farm Revenue (GHS)</Label>
              <Input type="number" placeholder="e.g. 50000" />
            </div>
            <div className="space-y-2">
              <Label>Years of Farming Experience</Label>
              <Input type="number" placeholder="e.g. 5" />
            </div>
            <div className="space-y-2">
              <Label>Farm Size (Acres)</Label>
              <Input type="number" placeholder="e.g. 10" />
            </div>
            <div className="space-y-2">
              <Label>Outstanding Loans (GHS)</Label>
              <Input type="number" placeholder="e.g. 0" />
            </div>
            <Button onClick={calculateScore} disabled={loading} className="w-full">
              {loading ? "Calculating..." : "Check Credit Score"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[250px]">
            {score !== null ? (
              <div className="text-center space-y-4">
                <div className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}</div>
                <Badge variant={score >= 700 ? "default" : score >= 600 ? "secondary" : "destructive"}>
                  {getScoreLabel(score)}
                </Badge>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Based on the information provided, you {score >= 600 ? "are eligible" : "may not yet qualify"} for agricultural loans.</p>
                  {score >= 700 && <p className="text-primary font-medium">You qualify for premium loan rates!</p>}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">Fill in your farm details and click "Check Credit Score" to see your result.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ForecastingApp = ({ onBack }: { onBack: () => void }) => {
  const [recommendations, setRecommendations] = useState<string[] | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your farm advisor. Tell me about your farm and I can suggest what crops to plant this season." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [location, setLocation] = useState("");
  const [season, setSeason] = useState("");

  const getRecommendations = () => {
    if (!farmSize || !location || !season) {
      toast.error("Please fill in all fields");
      return;
    }

    const seasonCrops: Record<string, string[]> = {
      "major-rainy": ["Maize", "Rice", "Cassava", "Yam", "Plantain"],
      "minor-rainy": ["Vegetables", "Tomatoes", "Peppers", "Okra", "Garden Eggs"],
      "dry": ["Onions", "Watermelon", "Mango (harvest)", "Shallots"],
      "harmattan": ["Cowpea", "Soybean", "Groundnut", "Millet"],
    };

    setRecommendations(seasonCrops[season] || ["Maize", "Cassava"]);
    toast.success("Recommendations generated!");
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg: Message = { role: "user", content: chatInput };
    const responses = [
      "Based on your location, I'd recommend focusing on drought-resistant crops this season. Consider maize varieties like Obatanpa which perform well in the Guinea Savanna zone.",
      "For a farm your size, diversifying with both staple crops and cash crops would maximize your income. Consider allocating 60% to maize and 40% to vegetables.",
      "The current season is ideal for planting early-maturing varieties. This will help you harvest before the dry season begins.",
      "I'd suggest investing in drip irrigation if you're in a drier region. This can increase yields by up to 30% while reducing water usage.",
      "Consider intercropping maize with cowpea. This improves soil fertility and gives you two income streams from the same land.",
    ];
    const assistantMsg: Message = {
      role: "assistant",
      content: responses[Math.floor(Math.random() * responses.length)],
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setChatInput("");
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Apps
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Crop Forecasting</h1>
        <p className="text-muted-foreground">AI-powered crop recommendations</p>
      </div>

      <Tabs defaultValue="recommend">
        <TabsList>
          <TabsTrigger value="recommend">Recommendations</TabsTrigger>
          <TabsTrigger value="chat">AI Advisor</TabsTrigger>
        </TabsList>

        <TabsContent value="recommend" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Farm Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Ruler className="h-3 w-3" /> Farm Size (Acres)</Label>
                  <Input type="number" placeholder="e.g. 10" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Location / Region</Label>
                  <Input placeholder="e.g. Ashanti Region" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Leaf className="h-3 w-3" /> Season</Label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="major-rainy">Major Rainy (Mar-Jul)</SelectItem>
                      <SelectItem value="minor-rainy">Minor Rainy (Sep-Nov)</SelectItem>
                      <SelectItem value="dry">Dry Season (Dec-Feb)</SelectItem>
                      <SelectItem value="harmattan">Harmattan (Nov-Mar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={getRecommendations} className="w-full">Get Recommendations</Button>
            </CardContent>
          </Card>

          {recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommended Crops</CardTitle>
                <CardDescription>Based on your farm profile and the current season</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((crop) => (
                    <div key={crop} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Leaf className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{crop}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chat">
          <Card className="flex flex-col" style={{ height: "500px" }}>
            <CardHeader className="border-b pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-primary" /> Farm AI Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="border-t p-3 flex gap-2">
              <Input
                placeholder="Ask about crops, seasons, or farming advice..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button size="icon" onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const InputDistributionApp = ({ onBack }: { onBack: () => void }) => {
  const [supplies, setSupplies] = useState([
    { id: "1", name: "NPK Fertilizer", quantity: 50, unit: "bags", status: "delivered" as const, date: "2026-03-10", supplier: "AgriChem Ltd" },
    { id: "2", name: "Hybrid Maize Seeds", quantity: 20, unit: "kg", status: "delivered" as const, date: "2026-03-05", supplier: "SeedCo Ghana" },
    { id: "3", name: "Pesticide (Lambda)", quantity: 10, unit: "litres", status: "in-transit" as const, date: "2026-04-12", supplier: "CropGuard" },
    { id: "4", name: "Urea Fertilizer", quantity: 30, unit: "bags", status: "ordered" as const, date: "2026-04-20", supplier: "AgriChem Ltd" },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", unit: "bags", supplier: "" });

  const statusColors: Record<string, string> = {
    delivered: "bg-primary/10 text-primary",
    "in-transit": "bg-accent/20 text-accent-foreground",
    ordered: "bg-muted text-muted-foreground",
  };

  const addSupply = () => {
    if (!newItem.name || !newItem.quantity) {
      toast.error("Please fill in name and quantity");
      return;
    }
    setSupplies((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newItem.name,
        quantity: parseInt(newItem.quantity),
        unit: newItem.unit,
        status: "ordered" as const,
        date: new Date().toISOString().split("T")[0],
        supplier: newItem.supplier || "Unknown",
      },
    ]);
    setNewItem({ name: "", quantity: "", unit: "bags", supplier: "" });
    setShowAdd(false);
    toast.success("Supply added!");
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Apps
      </Button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Input Distribution</h1>
          <p className="text-muted-foreground">Track supplies and deliveries</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>Add Supply</Button>
      </div>

      <div className="grid gap-4">
        {supplies.map((supply) => (
          <Card key={supply.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/30">
                  <Truck className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{supply.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {supply.quantity} {supply.unit} · {supply.supplier}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{supply.date}</span>
                <Badge className={statusColors[supply.status]}>
                  {supply.status === "in-transit" ? "In Transit" : supply.status.charAt(0).toUpperCase() + supply.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supply</DialogTitle>
            <DialogDescription>Track a new supply or delivery</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Supply Name</Label>
              <Input placeholder="e.g. NPK Fertilizer" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" placeholder="e.g. 50" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={newItem.unit} onValueChange={(v) => setNewItem({ ...newItem, unit: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="litres">Litres</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input placeholder="e.g. AgriChem Ltd" value={newItem.supplier} onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })} />
            </div>
            <Button onClick={addSupply} className="w-full">Add Supply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Apps = () => {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  if (activeApp === "credit-scoring") return <CreditScoringApp onBack={() => setActiveApp(null)} />;
  if (activeApp === "forecasting") return <ForecastingApp onBack={() => setActiveApp(null)} />;
  if (activeApp === "input-distribution") return <InputDistributionApp onBack={() => setActiveApp(null)} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Farm Apps</h1>
        <p className="text-muted-foreground">Explore tools to grow your farming business</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <Card key={app.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setActiveApp(app.id)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${app.color}`}>
                  <app.icon className="h-6 w-6" />
                </div>
                <Badge variant="secondary">{app.badge}</Badge>
              </div>
              <CardTitle className="text-lg">{app.title}</CardTitle>
              <CardDescription>{app.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Open App</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Apps;
