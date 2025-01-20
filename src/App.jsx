import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

import UserContext from "./contexts/UserContext";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Routing from "./components/Routing/Routing";
import { getJwt, getUser } from "./services/userServices";
import setAuthToken from "./utils/setAuthToken";

import "react-toastify/dist/ReactToastify.css";
import CartContext from "./contexts/CartContext";
import useData from "./hooks/useData";
import useAddToCart from "./hooks/cart/useAddToCart";
import useRemoveFromCart from "./hooks/cart/useRemoveFromCart";
import useUpdateCart from "./hooks/cart/useUpdateCart";

setAuthToken(getJwt());

const App = () => {
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);
const {data:cartData,refetch}=useData("/cart",null,["cart"])



const addToCartMutation = useAddToCart();
const removeFromCartMutation = useRemoveFromCart();
const updateCartMutation = useUpdateCart();


useEffect(()=>{
    if(cartData){
        setCart(cartData);
    }
},[cartData])

useEffect(() => {
    if (user) {
        refetch();
    }
}, [user]);

    useEffect(() => {
        try {
            const jwtUser = getUser();
            if (Date.now() >= jwtUser.exp * 1000) {
                localStorage.removeItem("token");
                location.reload();
            } else {
                setUser(jwtUser);
            }
        } catch (error) {}
    }, []);

    
    const addToCart = useCallback((product, quantity) => {
      const updatedCart = [...cart];
      setCart(updatedCart);
  
      addToCartMutation.mutate(
          { id: product._id, quantity: quantity },
          {
              onSuccess: () => {
                  toast.success("Product added to cart successfully!");
              },
              onError: (error) => {
                  toast.error("Something went wrong!");
                  setCart(cart);
              },
          }
      );
  }, [cart]);
  

    const removeFromCart = useCallback((id) => {
        const oldCart = [...cart];
        const newCart = oldCart.filter((item) => item.product._id !== id);
        setCart(newCart);
        
   
    removeFromCartMutation.mutate(
        { id },
        {
          onError: () => {
            toast.error("Something went wrong!");
            setCart(oldCart);
          },
        }
      );
    },
    [cart]
  );

 



    const updateCart = useCallback((type, id) => {
        const oldCart = [...cart];
        const updatedCart = [...cart];
        const productIndex = updatedCart.findIndex(
          (item) => item.product._id === id
        );
  
        if (type === "increase") {
          updatedCart[productIndex].quantity += 1;
        }
        if (type === "decrease") {
          updatedCart[productIndex].quantity -= 1;
        }
     setCart(updatedCart)

        updateCartMutation.mutate(
          { id, type },
          {
            onError: () => {
              toast.error("Something went wrong!");
            setCart(oldCart)
            },
          }
        );
      },
      [cart]
    );
  
    

    return (
        <UserContext.Provider value={user}>
            <CartContext.Provider
                value={{
                    cart,
                    addToCart,
                    removeFromCart,
                    updateCart,
                    setCart,
                }}>
                <div className='app'>
                    <Navbar />
                    <main>
                        <ToastContainer position='bottom-right' />
                        <Routing />
                    </main>
                </div>
            </CartContext.Provider>
        </UserContext.Provider>
    );
};

export default App;
