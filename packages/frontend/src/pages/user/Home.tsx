import React from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../components/common/layout/UserLayout';
import Button from '../../components/common/ui/Button';
import Card from '../../components/common/ui/Card';

const Home: React.FC = () => {
  return (
    <UserLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 mb-12 rounded-b-3xl">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Gemstone Valuation System
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Evaluate, manage, and track your gemstone collection with precision and ease
          </p>
          <div className="space-x-4">
            <Link to="/valuation">
              <Button size="lg" variant="secondary">
                Start Valuation
              </Button>
            </Link>
            <Link to="/profile/collection">
              <Button size="lg" variant="outline" className="bg-white text-primary-700 border-white hover:bg-primary-50">
                My Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-10">System Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            title="Gemstone Valuation"
            subtitle="Comprehensive evaluation tool"
            hoverable
          >
            <p className="text-gray-600">
              Our step-by-step wizard helps you properly categorize and value your gemstones based on standard industry criteria.
            </p>
          </Card>
          
          <Card 
            title="Collection Management"
            subtitle="Keep track of your gems"
            hoverable
          >
            <p className="text-gray-600">
              Organize your gemstone collection, keep detailed records, and track your gems' history and provenance.
            </p>
          </Card>
          
          <Card 
            title="Ownership Transfer"
            subtitle="Secure and transparent"
            hoverable
          >
            <p className="text-gray-600">
              Transfer ownership of your gemstones securely, maintaining a complete historical record of each stone.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-700 font-bold text-xl">1</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Select Gemstone</h3>
            <p className="text-gray-600">Choose the gemstone type, mineral family, and basic properties</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-700 font-bold text-xl">2</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Define Attributes</h3>
            <p className="text-gray-600">Specify cut, color, clarity, and other quality factors</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-700 font-bold text-xl">3</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Add Details</h3>
            <p className="text-gray-600">Include dimensions, carat weight, origin, and other specifics</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-700 font-bold text-xl">4</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Get Valuation</h3>
            <p className="text-gray-600">Receive estimated value and save to your collection</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 rounded-xl">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Begin adding your gemstones to build your digital collection
          </p>
          <Link to="/valuation">
            <Button size="lg">Start Gemstone Valuation</Button>
          </Link>
        </div>
      </section>
    </UserLayout>
  );
};

export default Home;