"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cars } from "@/constants";
import { CarProps } from "@/types";
import { getCarImage } from "@/lib/utils";
import { calculateCarRent } from "@/utils";

export default function CarDetailPage() {
  const params = useParams();
  const [car, setCar] = useState<CarProps | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      // Find car by creating a unique ID from make-model-year
      const foundCar = cars.find((c, index) => {
        const carId = `${c.make.toLowerCase()}-${c.model.toLowerCase().replace(/\s+/g, '-')}-${c.year}-${index}`;
        return carId === params.id;
      });
      setCar(foundCar || null);
    }
  }, [params.id]);

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Car not found</h1>
          <Link href="/fleet" className="text-blue-600 hover:text-blue-800">
            ← Back to Fleet
          </Link>
        </div>
      </div>
    );
  }

  const carImages = [
    getCarImage(car),
    getCarImage(car),
    getCarImage(car),
    getCarImage(car),
  ];

  const features = [
    { label: "Fuel Type", value: car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1) },
    { label: "Transmission", value: car.transmission === 'a' ? 'Automatic' : 'Manual' },
    { label: "Drive Type", value: car.drive.toUpperCase() },
    { label: "Seats", value: `${car.seats} seats` },
    { label: "City MPG", value: `${car.city_mpg} MPG` },
    { label: "Highway MPG", value: `${car.highway_mpg} MPG` },
    { label: "Combined MPG", value: `${car.combination_mpg} MPG` },
    { label: "Engine", value: `${car.displacement}L ${car.cylinders}-cylinder` },
    { label: "Class", value: car.class },
    { label: "Color", value: car.color },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-100 pt-20">
      {/* Modern Hero Section */}
      <div className="relative bg-gradient-to-r from-white via-blue-50/30 to-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-24 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-width padding-x py-12">
          {/* Enhanced Breadcrumb */}
          <div className="bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 mb-8 inline-flex items-center space-x-3 shadow-sm border border-gray-100">
            <Link href="/" className="text-gray-600 hover:text-primary-blue transition-colors font-medium">
              Home
            </Link>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <Link href="/fleet" className="text-gray-600 hover:text-primary-blue transition-colors font-medium">
              Fleet
            </Link>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="text-gray-900 font-semibold">
              {car.make} {car.model}
            </span>
          </div>
          
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {car.year}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                    {car.class}
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                  {car.make} <span className="text-primary-blue">{car.model}</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Experience premium {car.fuel_type === 'electricity' ? 'electric' : car.fuel_type === 'hybrid' ? 'hybrid' : 'performance'} driving with this exceptional {car.class.toLowerCase()}
                </p>
              </div>
              
              {/* Feature Highlights */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1)}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{car.seats} Seats</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{car.transmission === 'a' ? 'Automatic' : 'Manual'}</span>
                </div>
              </div>
            </div>
            
            {/* Price Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 min-w-[280px]">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 font-medium">Starting from</p>
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-4xl font-bold text-gray-900">${car.price_per_day}</span>
                  <span className="text-lg text-gray-600 font-medium">/day</span>
                </div>
                <p className="text-xs text-gray-500">Includes insurance & roadside assistance</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-8" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" className="fill-gray-50"></path>
          </svg>
        </div>
      </div>

      <div className="max-width padding-x py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Modern Image Gallery */}
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="relative h-96 bg-gray-100">
                <Image
                  src={carImages[currentImageIndex]}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-contain"
                />
              </div>
              
              {/* Thumbnail Navigation */}
              <div className="flex p-4 space-x-2">
                {carImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`View ${index + 1}`}
                      fill
                      className="object-contain bg-gray-50"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modern Car Details */}
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Image src="/gas.svg" width={24} height={24} alt="fuel" />
                  </div>
                  <p className="text-sm text-gray-600">City MPG</p>
                  <p className="font-semibold">{car.city_mpg}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Image src="/steering-wheel.svg" width={24} height={24} alt="transmission" />
                  </div>
                  <p className="text-sm text-gray-600">Transmission</p>
                  <p className="font-semibold">{car.transmission === 'a' ? 'Auto' : 'Manual'}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Image src="/tire.svg" width={24} height={24} alt="drive" />
                  </div>
                  <p className="text-sm text-gray-600">Drive</p>
                  <p className="font-semibold">{car.drive.toUpperCase()}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this car</h2>
                <p className="text-gray-600 leading-relaxed">
                  The {car.year} {car.make} {car.model} is a {car.class} that combines 
                  {car.fuel_type === 'electricity' ? ' zero-emission electric power' : 
                   car.fuel_type === 'hybrid' ? ' efficient hybrid technology' : ' reliable performance'} 
                  with modern comfort and style. 
                  {car.fuel_type === 'electricity' ? 
                    ` With an impressive ${car.city_mpg} MPGe city rating, this electric vehicle offers both environmental benefits and cost savings.` :
                    ` Achieving ${car.city_mpg} MPG in the city and ${car.highway_mpg} MPG on the highway, it's designed for both efficiency and performance.`
                  }
                </p>
              </div>

              {/* Features Grid */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h2>
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{feature.label}</span>
                      <span className="font-medium text-gray-900">{feature.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button className="w-full py-[16px] px-6 rounded-full bg-blue-900 text-white text-[14px] leading-[17px] font-bold hover:bg-blue-800 transition-colors [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))]">
                  Reserve Now - ${car.price_per_day}/day
                </button>
                <button className="w-full py-[16px] px-6 rounded-full border border-gray-300 text-gray-700 text-[14px] leading-[17px] font-bold hover:bg-gray-50 transition-colors">
                  Contact for Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Rental Terms */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Information</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Minimum age: 21 years</li>
              <li>• Valid driver's license required</li>
              <li>• Credit card for security deposit</li>
              <li>• Full insurance coverage included</li>
              <li>• 24/7 roadside assistance</li>
              <li>• Free cancellation up to 24 hours</li>
            </ul>
          </div>

          {/* Why Choose This Car */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose This Car</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• {car.fuel_type === 'electricity' ? 'Eco-friendly electric power' : car.fuel_type === 'hybrid' ? 'Fuel-efficient hybrid technology' : 'Reliable and efficient performance'}</li>
              <li>• Comfortable seating for {car.seats} passengers</li>
              <li>• Modern safety features and technology</li>
              <li>• {car.transmission === 'a' ? 'Smooth automatic transmission' : 'Engaging manual transmission'}</li>
              <li>• Excellent fuel economy ratings</li>
              <li>• Well-maintained and regularly serviced</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
