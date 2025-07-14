import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Your AI Health Coach
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Get personalized health advice and guidance from your AI-powered wellness coach.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chat with AI</h3>
            <p className="text-gray-600">Ask questions about your health and get instant, personalized advice.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Health Insights</h3>
            <p className="text-gray-600">Receive evidence-based recommendations for your wellness journey.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Activity className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">Monitor your health metrics and see your improvement over time.</p>
          </div>
        </div>
        
        <Link
          to="/chat"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Start Chatting
          <MessageCircle className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}