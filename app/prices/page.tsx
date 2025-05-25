import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MoonIcon, SunriseIcon, HomeIcon, InfoIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function PricesPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Pricing</h1>
          <p className="text-lg text-gray-600">
            Transparent pricing for all our pet care services. No hidden fees or surprises.
          </p>
        </div>

        {/* Pricing Explanation */}
        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Pricing Information</AlertTitle>
          <AlertDescription className="text-blue-700">
            <p className="mb-2">
              Our pricing is based on the type of service, number of pets, duration, and timing. Special rates apply for
              weekends, holidays, and services outside normal hours (8 AM - 8 PM).
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Weekend and holiday surcharge: +20%</li>
              <li>Time surcharge (before 8 AM or after 8 PM): See table below</li>
              <li>Distance surcharge (for Spacer and Wyzyta Domowa): +1.5 zł per km beyond 5 km</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-[#C76E00] to-[#a85b00] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <MoonIcon className="h-5 w-5" />
                Nocleg
              </CardTitle>
              <CardDescription className="text-orange-100">Overnight stay at our dog hotel</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-[#C76E00]">91 zł</span>
                <span className="text-gray-500 ml-1">/ night</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Base price (first pet)</span>
                  <span className="font-medium">91 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>Additional animal</span>
                  <span className="font-medium">61 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>Weekend/holiday</span>
                  <span className="font-medium">101 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>Time surcharge</span>
                  <span className="font-medium">10 zł</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full bg-[#C76E00] hover:bg-[#a85b00]">Book Now</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-[#C76E00] to-[#a85b00] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <SunriseIcon className="h-5 w-5" />
                Spacer
              </CardTitle>
              <CardDescription className="text-orange-100">We'll pick up your pet for a walk</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-[#C76E00]">41 zł</span>
                <span className="text-gray-500 ml-1">/ 30 min</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Base price (first pet)</span>
                  <span className="font-medium">41 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>Additional animal</span>
                  <span className="font-medium">21 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>Weekend/holiday</span>
                  <span className="font-medium">52 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>Additional 30 min</span>
                  <span className="font-medium">21 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>Time surcharge</span>
                  <span className="font-medium">10 zł</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full bg-[#C76E00] hover:bg-[#a85b00]">Book Now</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-[#C76E00] to-[#a85b00] text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <HomeIcon className="h-5 w-5" />
                Wyzyta Domowa
              </CardTitle>
              <CardDescription className="text-orange-100">We'll visit your home to care for your pet</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-[#C76E00]">45 zł</span>
                <span className="text-gray-500 ml-1">/ 30 min</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Base price (first pet)</span>
                  <span className="font-medium">45 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>Additional animal</span>
                  <span className="font-medium">25 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>Weekend/holiday</span>
                  <span className="font-medium">60 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>Additional 30 min</span>
                  <span className="font-medium">20 zł</span>
                </li>
                <li className="flex justify-between">
                  <span>Time surcharge</span>
                  <span className="font-medium">10 zł</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full bg-[#C76E00] hover:bg-[#a85b00]">Book Now</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Detailed Pricing Table */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Pricing</h2>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Additional Animal</TableHead>
                  <TableHead>Weekend/Holiday</TableHead>
                  <TableHead>Time Surcharge</TableHead>
                  <TableHead>Additional Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MoonIcon className="h-4 w-4 text-[#C76E00]" />
                      Nocleg
                    </div>
                  </TableCell>
                  <TableCell>91 zł</TableCell>
                  <TableCell>61 zł</TableCell>
                  <TableCell>101 zł</TableCell>
                  <TableCell>10 zł</TableCell>
                  <TableCell>N/A</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <SunriseIcon className="h-4 w-4 text-[#C76E00]" />
                      Spacer
                    </div>
                  </TableCell>
                  <TableCell>41 zł</TableCell>
                  <TableCell>21 zł</TableCell>
                  <TableCell>52 zł</TableCell>
                  <TableCell>10 zł</TableCell>
                  <TableCell>21 zł / 30 min</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <HomeIcon className="h-4 w-4 text-[#C76E00]" />
                      Wyzyta Domowa
                    </div>
                  </TableCell>
                  <TableCell>45 zł</TableCell>
                  <TableCell>25 zł</TableCell>
                  <TableCell>60 zł</TableCell>
                  <TableCell>10 zł</TableCell>
                  <TableCell>20 zł / 30 min</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Cat Pricing */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cat Pricing</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <InfoIcon className="h-5 w-5 text-[#C76E00]" />
                <span className="font-medium">Special rates for cats</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Base Price (Cat)</TableHead>
                    <TableHead>Additional Cat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Nocleg</TableCell>
                    <TableCell>71 zł</TableCell>
                    <TableCell>39 zł</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Spacer</TableCell>
                    <TableCell>20 zł</TableCell>
                    <TableCell>10 zł</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Wyzyta Domowa</TableCell>
                    <TableCell>40 zł</TableCell>
                    <TableCell>15 zł</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charges */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Charges</h2>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distance Surcharge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">
                  For Spacer and Wyzyta Domowa services, a distance surcharge applies for locations beyond 5 km from our
                  facility.
                </p>
                <Badge className="bg-orange-100 text-[#a85b00] border-orange-200">+1.5 zł per km beyond 5 km</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Special Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">
                  Weekend and holiday rates apply for services on Saturdays, Sundays, and Polish national holidays.
                </p>
                <Badge className="bg-orange-100 text-[#a85b00] border-orange-200">+20% surcharge</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Outside Normal Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">
                  Services scheduled before 8 AM or after 8 PM incur an additional charge.
                </p>
                <Badge className="bg-orange-100 text-[#a85b00] border-orange-200">+10 zł per service</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Book a Service?</h2>
          <p className="text-gray-600 mb-6">
            Sign in to your account to make a reservation for your pet. We look forward to providing excellent care!
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-[#C76E00] hover:bg-[#a85b00]">
              Sign In to Book
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
