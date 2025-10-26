import { createContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = '$';
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);

  // ✅ init token from localStorage immediately
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const navigate = useNavigate();

  // ✅ handy memoized auth headers for any authed request
  const authHeaders = useMemo(() => ({ headers: { token } }), [token]);

  // ✅ logout helper
  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setCartItems({});
    toast.success('Logged out');
    navigate('/login');
  };

  const addToCart = async (itemId, size) => {
    if (!size) return toast.error('Select Product Size');

    const cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }
    setCartItems(cartData);

    toast.success('Added to cart successfully 🛒');

    if (token) {
      try {
        await axios.post(backendUrl + '/api/cart/add', { itemId, size }, authHeaders);
      } catch (error) {
        console.log(error); toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const sz in cartItems[items]) {
        try { if (cartItems[items][sz] > 0) totalCount += cartItems[items][sz]; } catch {}
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    const cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, authHeaders);
      } catch (error) {
        console.log(error); toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      const itemInfo = products.find((p) => p._id === items);
      for (const sz in cartItems[items]) {
        try { if (cartItems[items][sz] > 0) totalAmount += (itemInfo?.price || 0) * cartItems[items][sz]; } catch {}
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const res = await axios.get(backendUrl + '/api/product/list');
      if (res.data.success) setProducts(res.data.products.reverse());
      else toast.error(res.data.message);
    } catch (error) {
      console.log(error); toast.error(error.message);
    }
  };

  const getUserCart = async (tkn) => {
    try {
      const res = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token: tkn } });
      if (res.data.success) setCartItems(res.data.cartData);
    } catch (error) {
      console.log(error); toast.error(error.message);
    }
  };

  // ✅ profile helpers (use these in AccountSettings page)
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/me`, authHeaders);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to load profile');
      return res.data.user; // { _id, name, email }
    } catch (e) {
      toast.error(e.message); throw e;
    }
  };

  const updateProfile = async ({ name, email }) => {
    try {
      const res = await axios.put(`${backendUrl}/api/user/me`, { name, email }, authHeaders);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to update profile');
      toast.success('Profile updated');
      return res.data.user;
    } catch (e) {
      toast.error(e.message); throw e;
    }
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      const res = await axios.put(`${backendUrl}/api/user/password`, { currentPassword, newPassword }, authHeaders);
      if (!res.data.success) throw new Error(res.data.message || 'Failed to update password');
      toast.success('Password changed');
      return true;
    } catch (e) {
      toast.error(e.message); throw e;
    }
  };

  // load products on boot
  useEffect(() => { getProductsData(); }, []);

  // bootstrap cart from local token OR keep in sync when token changes
  useEffect(() => {
    if (token) getUserCart(token);
  }, [token]);

  const value = {
    // data
    products, currency, delivery_fee,
    search, setSearch, showSearch, setShowSearch,
    cartItems, setCartItems,
    token, setToken, backendUrl,
    // actions
    addToCart, getCartCount, updateQuantity, getCartAmount,
    navigate, logout,
    // profile helpers
    fetchProfile, updateProfile, changePassword,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;