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
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState(false)


  useEffect(() => {

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
  }, [router]) // Depend on router to ensure it runs when router is ready


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

  const handlePasswordUpdate = () => {
    setPasswordChangeMessage("");
    setPasswordChangeError(false);

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeMessage("New password and confirm password do not match.");
      setPasswordChangeError(true);
      return;
    }

    // Basic password strength validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordChangeMessage("New password does not meet the requirements.");
      setPasswordChangeError(true);
      return;
    }

    // In a real application, you would send currentPassword, newPassword to your backend for verification and update.
    // For this example, we'll simulate success.

    // Simulate API call for password update
    setIsSaving(true); // Re-using isSaving for demonstration, ideally have a separate state
    setTimeout(() => {
      setIsSaving(false);
      setPasswordChangeMessage("Password updated successfully!");
      setPasswordChangeError(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }, 1500);
  };

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
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {passwordChangeMessage && (
                    <Alert className={passwordChangeError ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
                      {passwordChangeError ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Save className="h-4 w-4 text-green-600" />
                      )}
                      <AlertTitle className={passwordChangeError ? "text-red-800" : "text-green-800"}>
                        {passwordChangeError ? "Error" : "Success"}
                      </AlertTitle>
                      <AlertDescription className={passwordChangeError ? "text-red-700" : "text-green-700"}>
                        {passwordChangeMessage}
                      </AlertDescription>
                    </Alert>
                  )}

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

                  <Button onClick={handlePasswordUpdate} className="bg-[#C76E00] hover:bg-[#a85b00]">
                    Update Password
                  </Button>
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