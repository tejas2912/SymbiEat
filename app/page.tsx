import ClientLayout from "@/components/client-layout"
import { FoodMenu } from "@/components/food/food-menu"

export default function Home() {
  return (
    <ClientLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Hostel Canteen Menu</h1>
        <FoodMenu />
      </div>
    </ClientLayout>
  )
}
