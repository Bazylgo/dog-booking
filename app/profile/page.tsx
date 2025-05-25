"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PetProfile } from "@/components/pet-profile"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2, Plus, Save, LogOut, User, Key, Shield } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [pets, setPets] = useState<any[]>([])
  const [userInfo, setUserInfo] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  })

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("doghotel_user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(storedUser))

    // Load saved pet profiles
    const storedProfiles = localStorage.getItem("pet-profiles")
    if (storedProfiles) {
      const profiles = JSON.parse(storedProfiles)
      if (profiles.length > 0) {
        // Use the first profile for user info
        const profile = profiles[0]
        setUserInfo({
          name: profile.name || "",
          surname: profile.surname || "",
          phone: profile.phone || "",
          email: profile.email || "",
          address: profile.address || "",
          city: profile.city || "",
          postalCode: profile.postalCode || "",
        })

        // Set pets from the profile
        if (profile.pets && profile.pets.length > 0) {
          setPets(profile.pets)
        }
      }
    }

    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("doghotel_user")
    router.push("/login")
  }

  const saveProfile = () => {
    setIsSaving(true)

    // Create a profile object with user info and pets
    const profile = {
      ...userInfo,
      pets: [...pets],
      savedAt: new Date().toISOString(),
    }

    // Get existing profiles
    const storedProfiles = localStorage.getItem("pet-profiles")
    let existingProfiles = storedProfiles ? JSON.parse(storedProfiles) : []

    // Update or add the profile
    if (existingProfiles.length > 0) {
      existingProfiles[0] = profile
    } else {
      existingProfiles = [profile]
    }

    // Save to localStorage
    localStorage.setItem("pet-profiles", JSON.stringify(existingProfiles))

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      // Show success message or notification
    }, 800)
  }

  const addPet = () => {
    setPets([
      ...pets,
      {
        id: Date.now().toString(),
        type: "dog",
        weight: "<5 kg",
        name: "",
        sex: "Male",
        age: "1",
      },
    ])
  }

  const updatePet = (id: string, field: string, value: string) => {
    setPets(pets.map((pet) => (pet.id === id ? { ...pet, [field]: value } : pet)))
  }

  const removePet = (id: string) => {
    setPets(pets.filter((pet) => pet.id !== id))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#C76E00]" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your account and pet information</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal Information</span>
              <span className="sm:hidden">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="pets" className="flex items-center gap-2">
              <span className="text-lg">🐾</span>
              <span className="hidden sm:inline">Pet Profiles</span>
              <span className="sm:hidden">Pets</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">Security & Privacy</span>
              <span className="sm:hidden">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">First Name</Label>
                    <Input
                      id="name"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surname">Last Name</Label>
                    <Input
                      id="surname"
                      value={userInfo.surname}
                      onChange={(e) => setUserInfo({ ...userInfo, surname: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={userInfo.address}
                    onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={userInfo.city}
                      onChange={(e) => setUserInfo({ ...userInfo, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={userInfo.postalCode}
                      onChange={(e) => setUserInfo({ ...userInfo, postalCode: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={saveProfile} className="bg-[#C76E00] hover:bg-[#a85b00]" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pets">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Pet Profiles</CardTitle>
                    <CardDescription>Manage your pet information for easier booking</CardDescription>
                  </div>
                  <Button onClick={addPet} className="bg-[#C76E00] hover:bg-[#a85b00]">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Pet
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pets.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <div className="flex justify-center mb-4">
                      <span className="text-5xl">🐾</span>
                    </div>
                    <p className="text-muted-foreground mb-4">No pets added yet.</p>
                    <Button
                      onClick={addPet}
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2 mx-auto bg-[#C76E00] hover:bg-[#a85b00]"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Pet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pets.map((pet) => (
                      <PetProfile
                        key={pet.id}
                        pet={pet}
                        onUpdate={(field, value) => updatePet(pet.id, field, value)}
                        onRemove={() => removePet(pet.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
              {pets.length > 0 && (
                <CardFooter className="flex justify-end">
                  <Button onClick={saveProfile} className="bg-[#C76E00] hover:bg-[#a85b00]" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Pet Profiles
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security & Privacy</CardTitle>
                <CardDescription>Manage your account security and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#C76E00]" />
                    Account Security
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Password Requirements</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>At least 8 characters long</li>
                        <li>Contains at least one uppercase letter</li>
                        <li>Contains at least one number</li>
                        <li>Contains at least one special character</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Button className="bg-[#C76E00] hover:bg-[#a85b00]">Update Password</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Connected Accounts</h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <div>
                        <p className="font-medium">Google</p>
                        <p className="text-sm text-gray-500">{user?.email ? user.email : "Not connected"}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {user?.email ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Reservation Updates</p>
                        <p className="text-sm text-gray-500">Receive emails about your reservation status changes</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-gray-500">
                          Receive promotional offers and updates about our services
                        </p>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">Disabled</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-[#C76E00] hover:bg-[#a85b00]">Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
