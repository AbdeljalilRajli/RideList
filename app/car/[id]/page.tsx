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
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Breadcrumb Section */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-width padding-x py-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span>›</span>
            <Link href="/fleet" className="hover:text-gray-700">
              Fleet
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">
              {car.make} {car.model}
            </span>
          </nav>
          
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {car.make} {car.model}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {car.year} • {car.class} • {car.color}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Starting from</p>
              <p className="text-3xl font-bold text-gray-900">${car.price_per_day}/day</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-width padding-x py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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

          {/* Car Details */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-8">

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
