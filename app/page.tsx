import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoonIcon, SunriseIcon, HomeIcon, ShieldCheckIcon, StarIcon } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
        <div className="flex-1 space-y-6">
          <Badge className="bg-orange-100 text-orange-800 border-orange-200 mb-4">Premium Pet Care</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Your Pet's <span className="text-[#C76E00]">Home Away</span> From Home
          </h1>
          <p className="text-lg text-gray-600 max-w-xl">
            Professional pet care services in Warsaw. We offer overnight stays, walks, and home visits for your beloved
            pets with personalized attention and care.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="bg-[#C76E00] hover:bg-[#a85b00]">
                Sign In to Book
              </Button>
            </Link>
            <Link href="/prices">
              <Button size="lg" variant="outline">
                View Our Prices
              </Button>
            </Link>
          </div>
          <div className="pt-4 text-sm text-[#C76E00] font-medium">
            * Login required to access Reservations and Bookings
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <img
              src="/dzeki_cute.jpg?height=400&width=500"
              alt="Happy dog at our hotel"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We offer a variety of services to meet your pet's needs, from overnight stays to walks and home visits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-[#C76E00] to-[#a85b00] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <MoonIcon className="h-5 w-5" />
                Nocleg (Overnight Stay)
              </CardTitle>
              <CardDescription className="text-orange-100">Comfortable accommodations for your pet</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>24/7 supervision and care</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Regular feeding and exercise</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Comfortable sleeping arrangements</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Daily updates on your pet's well-being</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-lg font-bold text-[#C76E00]">From 91 zł</span>
              <Link href="/login">
                <Button className="bg-[#C76E00] hover:bg-[#a85b00]">Book Now</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-[#a85b00] to-[#C76E00] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <SunriseIcon className="h-5 w-5" />
                Spacer (Walk)
              </CardTitle>
              <CardDescription className="text-orange-100">Professional dog walking service</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Scheduled walks at your preferred time</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Pick-up and drop-off service</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Exercise and socialization</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Flexible duration options</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-lg font-bold text-[#C76E00]">From 41 zł</span>
              <Link href="/login">
                <Button className="bg-[#C76E00] hover:bg-[#a85b00]">Book Now</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-[#a85b00] to-[#C76E00] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <HomeIcon className="h-5 w-5" />
                Wyzyta Domowa (Home Visit)
              </CardTitle>
              <CardDescription className="text-orange-100">In-home pet care service</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Care in your pet's familiar environment</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Feeding, medication, and playtime</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Plant watering and mail collection</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Regular updates and photos</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-lg font-bold text-[#C76E00]">From 45 zł</span>
              <Link href="/login">
                <Button className="bg-[#C76E00] hover:bg-[#a85b00]">Book Now</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Booking a service with us is simple and straightforward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#C76E00]">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
            <p className="text-gray-600">Sign up and create your profile with your pet's details.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#C76E00]">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Choose a Service</h3>
            <p className="text-gray-600">Select from our range of pet care services.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#C76E00]">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Book Your Dates</h3>
            <p className="text-gray-600">Choose your preferred dates and times for the service.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-[#C76E00]">4</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Enjoy Peace of Mind</h3>
            <p className="text-gray-600">Relax knowing your pet is in good hands.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what pet owners have to say about our services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
              </div>
              <p className="italic text-gray-600 mb-4">
                "My dog Max loves staying at Dog Hotel! The staff is so caring and attentive. I receive regular updates
                and photos, which gives me peace of mind while I'm away."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-[#C76E00] font-semibold">AK</span>
                </div>
                <div>
                  <p className="font-semibold">Anna Kowalska</p>
                  <p className="text-sm text-gray-500">Dog owner</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
              </div>
              <p className="italic text-gray-600 mb-4">
                "The home visit service is perfect for my cat Luna. She gets stressed in new environments, so having
                someone come to our home is ideal. The staff is professional and reliable."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-[#C76E00] font-semibold">JN</span>
                </div>
                <div>
                  <p className="font-semibold">Jan Nowak</p>
                  <p className="text-sm text-gray-500">Cat owner</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <StarIcon className="h-5 w-5 text-yellow-400" fill="currentColor" />
              </div>
              <p className="italic text-gray-600 mb-4">
                "I use the walking service regularly for my energetic Labrador. The staff is punctual and my dog always
                comes back happy and tired. Highly recommend!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-[#C76E00] font-semibold">MW</span>
                </div>
                <div>
                  <p className="font-semibold">Marta Wiśniewska</p>
                  <p className="text-sm text-gray-500">Dog owner</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-50 rounded-2xl p-8 md:p-12">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Book a Service?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Create an account or sign in to book a service for your pet. We look forward to taking care of your furry
            friend!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-[#C76E00] hover:bg-[#a85b00]">
                Sign In
              </Button>
            </Link>
            <Link href="/prices">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#C76E00]">
            * You must be logged in to access the Reservations and Bookings pages
          </p>
        </div>
      </section>
    </div>
  )
}
