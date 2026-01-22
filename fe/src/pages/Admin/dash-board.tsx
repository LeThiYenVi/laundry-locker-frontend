import { Settings, Plus, TrendingUp, Database, ChevronDown, Users, BookOpen, HelpCircle, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Organization');
  const [selectedYear, setSelectedYear] = useState('2025');

  const tabs = ['Organization', 'Teams', 'Users', 'Subscription', 'Payment', 'Installed apps', 'Variables'];

  // Sample data for chart
  const chartData = [
    { month: 'Jan', value1: 65, value2: 45 },
    { month: 'Feb', value1: 75, value2: 55 },
    { month: 'Mar', value1: 85, value2: 65 },
    { month: 'Apr', value1: 70, value2: 50 },
    { month: 'May', value1: 90, value2: 70 },
    { month: 'Jun', value1: 80, value2: 60 },
  ];

  const recommendations = [
    { icon: Users, label: 'Community', color: 'from-purple-400 to-pink-400' },
    { icon: BookOpen, label: 'Academy', color: 'from-blue-400 to-cyan-400' },
    { icon: HelpCircle, label: 'Help center', color: 'from-green-400 to-emerald-400' },
    { icon: Briefcase, label: 'Partner directory', color: 'from-orange-400 to-red-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold text-gray-900">My Organization</h1>

          <div className="flex gap-3">
            <Button variant="outline" size="default" className="flex items-center gap-2">
              <Settings size={18} />
              Settings
            </Button>
            <Button size="default" className="flex items-center gap-2 bg-pink-200 text-gray-900 hover:bg-pink-300">
              <Plus size={18} />
              Create a new scenario
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Tabs defaultValue={activeTab} onValueChange={(v) => setActiveTab(v)}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab} value={tab} className="rounded-full px-5 py-2.5">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Operations Card */}
        <Card className="bg-linear-to-br from-blue-100 to-blue-50 rounded-3xl p-6 border border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white rounded-xl">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <span className="px-3 py-1 bg-black text-white text-sm font-medium rounded-full">
              72% Used
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Operations</h3>
          <p className="text-sm text-gray-600 mb-4">10,000 / 13,889</p>
          {/* Progress Bar */}
          <div className="flex gap-1 h-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full ${
                  i < 7 ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </Card>

        {/* Data Transfer Card */}
        <Card className="bg-linear-to-br from-cyan-100 to-cyan-50 rounded-3xl p-6 border border-cyan-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white rounded-xl">
              <Database className="text-cyan-600" size={24} />
            </div>
            <span className="px-3 py-1 bg-black text-white text-sm font-medium rounded-full">
              32% Used
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Data transfer</h3>
          <p className="text-sm text-gray-600 mb-4">3.2 GB / 10 GB</p>
          {/* Progress Bar */}
          <div className="flex gap-1 h-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full ${
                  i < 3 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </Card>

        {/* Promo Card */}
        <Card className="bg-linear-to-br from-gray-900 to-black rounded-3xl p-6 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Take Your Automation to the Next Level</h3>
            <p className="text-gray-400 text-sm mb-6">
              Unlock advanced features and unlimited operations
            </p>
          </div>
          <Button className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors">Upgrade</Button>
        </Card>
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-3xl p-8 mb-8 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Statistics</h2>
          <div className="relative w-40">
            <Select value={selectedYear} onValueChange={(v) => setSelectedYear(v)}>
              <SelectTrigger>
                <SelectValue placeholder={selectedYear} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 14 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 14 }}
              />
              <Bar dataKey="value1" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#EC4899" opacity={0.8} />
                ))}
              </Bar>
              <Bar dataKey="value2" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3B82F6" opacity={0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for you</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg cursor-pointer group"
              >
                <div className={`w-16 h-16 bg-linear-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Avatar className="!bg-transparent shadow-none p-0">
                    <AvatarFallback className="!bg-transparent">
                      <Icon className="text-white" size={28} />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
