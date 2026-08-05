import { Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AddProduct } from './pages/AddProduct';
import { CartPage } from './pages/CartPage';
import { EditProduct } from './pages/EditProduct';
import { Login } from './pages/Login';
import { Orders } from './pages/Orders';
import { Payment } from './pages/Payment';
import { ProductDetail } from './pages/ProductDetail';
import { ProductList } from './pages/ProductList';
import { Register } from './pages/Register';
import { SellerDashboard } from './pages/SellerDashboard';
import { Settings } from './pages/Settings';
import { ProtectedRoute, RoleRoute } from './routes/guards';
import { t } from './i18n';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/cart"
            element={
              <RoleRoute role="customer">
                <CartPage />
              </RoleRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <RoleRoute role="customer">
                <Orders />
              </RoleRoute>
            }
          />
          <Route
            path="/payment/:orderId"
            element={
              <RoleRoute role="customer">
                <Payment />
              </RoleRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller"
            element={
              <RoleRoute role="seller">
                <SellerDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/seller/products/new"
            element={
              <RoleRoute role="seller">
                <AddProduct />
              </RoleRoute>
            }
          />
          <Route
            path="/seller/products/:id/edit"
            element={
              <RoleRoute role="seller">
                <EditProduct />
              </RoleRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <p>{t.errors.pageNotFound}</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
