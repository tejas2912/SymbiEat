"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Loader2 } from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  role: string
  orderCount: number
  totalSpent: number
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-[hsl(var(--admin-text))/0.7] mt-1">View all registered users and their order statistics</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text))/0.5]" />
          <Input
            placeholder="Search users..."
            className="pl-9 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))] text-[hsl(var(--admin-text))]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-muted))]">
        <CardHeader>
          <CardTitle className="text-[hsl(var(--admin-text))]">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-primary))]" />
            </div>
          ) : error ? (
            <p className="text-red-500 text-center py-4">{error}</p>
          ) : (
            <div className="rounded-md border border-[hsl(var(--admin-muted))] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[hsl(var(--admin-card))] hover:bg-[hsl(var(--admin-card))]">
                    <TableHead className="text-[hsl(var(--admin-text))]">Name</TableHead>
                    <TableHead className="text-[hsl(var(--admin-text))]">Email</TableHead>
                    <TableHead className="text-[hsl(var(--admin-text))]">Role</TableHead>
                    <TableHead className="text-[hsl(var(--admin-text))]">Total Orders</TableHead>
                    <TableHead className="text-[hsl(var(--admin-text))]">Total Spent</TableHead>
                    <TableHead className="text-[hsl(var(--admin-text))]">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow className="bg-[hsl(var(--admin-card))] hover:bg-[hsl(var(--admin-muted))]">
                      <TableCell colSpan={6} className="text-center py-4 text-[hsl(var(--admin-text))]">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow
                        key={user._id}
                        className="bg-[hsl(var(--admin-card))] hover:bg-[hsl(var(--admin-muted))]"
                      >
                        <TableCell className="font-medium text-[hsl(var(--admin-text))]">{user.name}</TableCell>
                        <TableCell className="text-[hsl(var(--admin-text))]">{user.email}</TableCell>
                        <TableCell className="text-[hsl(var(--admin-text))]">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            }`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-[hsl(var(--admin-text))]">{user.orderCount || 0}</TableCell>
                        <TableCell className="text-[hsl(var(--admin-text))]">
                          ₹{user.totalSpent?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="text-[hsl(var(--admin-text))]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
