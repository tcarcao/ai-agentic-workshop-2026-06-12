import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { CartProvider } from "./features/cart/context/CartContext";
import RestaurantsPage from "./pages/RestaurantsPage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import OrderPage from "./pages/OrderPage";
import AccountPage from "./pages/AccountPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<RestaurantsPage />} />
            <Route path="/restaurants/:id" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
