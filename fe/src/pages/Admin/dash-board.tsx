import { Settings, Plus, TrendingUp, Database, ChevronDown, Users, BookOpen, HelpCircle, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

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
            <button className="px-6 py-2.5 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Settings size={18} />
              Settings
            </button>
            <button className="px-6 py-2.5 bg-pink-200 rounded-xl font-medium text-gray-900 hover:bg-pink-300 transition-colors flex items-center gap-2">
              <Plus size={18} />
              Create a new scenario
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Operations Card */}
        <div className="bg-linear-to-br from-blue-100 to-blue-50 rounded-3xl p-6 border border-blue-200">
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
        </div>

        {/* Data Transfer Card */}
        <div className="bg-linear-to-br from-cyan-100 to-cyan-50 rounded-3xl p-6 border border-cyan-200">
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
        </div>

        {/* Promo Card */}
        <div className="bg-linear-to-br from-gray-900 to-black rounded-3xl p-6 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Take Your Automation to the Next Level</h3>
            <p className="text-gray-400 text-sm mb-6">
              Unlock advanced features and unlimited operations
            </p>
          </div>
          <button className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors">
            Upgrade
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white rounded-3xl p-8 mb-8 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Statistics</h2>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 bg-gray-100 rounded-xl font-medium text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={20} />
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
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg cursor-pointer group"
              >
                <div className={`w-16 h-16 bg-linear-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
