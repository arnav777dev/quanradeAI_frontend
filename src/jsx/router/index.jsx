// import React ,{useContext} from "react";
import {  Routes, Route, Outlet } from "react-router-dom";
import React, { createContext, useReducer, useContext, } from 'react';

/// Css
import './../index.css'
import './../chart.css'
import './../step.css'

/// Layout
import Nav from './../layouts/nav'
import Footer from './../layouts/Footer'

import { ThemeContext } from "../../context/ThemeContext";
//Scroll To Top
import ScrollToTop from './../layouts/ScrollToTop';

/// Dashboard
import Home from "./../pages/dashboard/Home.tsx";
import DashboardDark from "./../pages/dashboard/DashboardDark";

import Login from "../pages/authentication/Login.tsx";

import AllUsers from "./../pages/users/ActiveUsers.tsx";
import LoginWithBroker from "./../pages/broker/BrokerLogin.tsx";
import Updateblaze from "./../pages/updateBlaze/updateBlaze.tsx";


import Market from "./../pages/dashboard/Market";
import CoinDetails from "./../pages/dashboard/CoinDetails";
import Portofolio from "./../pages/dashboard/Portofolio";

import EmptyPage from "./../pages/dashboard/EmptyPage";

//trading
import TradingMarket from "../pages/trading/TradingMarket";
import IcoListing from "../pages/trading/IcoListing";
import P2P from "../pages/trading/P2P";
import FutureTrading from "../pages/trading/FutureTrading";

//Crypto
import MarketWatch from "../pages/crypto/MarketWatch";
import Exchange from "../pages/crypto/Exchange";
import Banking from "../pages/crypto/Banking";

//Reports
import History from "../pages/report/History";
import Orders from "../pages/report/Orders";
import Reports from "../pages/report/Reports";
import User from "../pages/report/User";

/// App
import AppProfile from './../pages/apps/AppProfile'
import PostDetails from './../pages/apps/PostDetails'
import EditProfile from "../pages/apps/EditProfile.tsx";
import Compose from './../pages/email/Compose/Compose'
import Inbox from './../pages/email/Inbox/Inbox'
import Read from './../pages/email/Read'




/// Pages
import LockScreen from '../pages/error/LockScreen.jsx'
import Error400 from '../pages/error/Error400.jsx'
import Error403 from '../pages/error/Error403.jsx'
import Error404 from '../pages/error/Error404.jsx'
import Error500 from '../pages/error/Error500.jsx'
import Error503 from '../pages/error/Error503.jsx'
import RightWalletBar from "../layouts/nav/RightWalletBar";
import { components } from "react-select";
import MonthlyStatus from "../pages/MonthlyStatus/MonthlyStatus.tsx";
import RiskManagement from "../pages/RiskManagement/RiskManagement.jsx";
import Equity from "../pages/equity/Equity.tsx";
import OrdersEQ from "../pages/equity/OrdersEQ.tsx";
import OrdersFUT from "../pages/FUTandOPT/futandopt_orders.tsx";
import Watchlist from "../pages/dashboard/Watchlist.tsx";
import OrderTab from "../pages/dashboard/OrderTab.tsx";
import NetpositonsTab from"../pages/dashboard/NetPositionsTab.tsx";
import HoldingsTab from"../pages/dashboard/HoldingsTab.tsx";
import IndexOptionBuying from "../pages/futuresOptions/IndexOptionBuying.tsx";
import IndexFuture from "../pages/futuresOptions/IndexFuture.tsx";
import StockFuture from "../pages/futuresOptions/StockFuture.tsx";
import StockOptionSelling from "../pages/futuresOptions/StockOptionSelling.tsx";
import StockOptionBuying from "../pages/futuresOptions/StockOptionBuying.tsx";
import Commodity from "../pages/futuresOptions/Commodity.tsx";

const Markup = () => {
  const allroutes = [
    /// Dashboard
    { url: "all-users", component: <AllUsers/> }, 
    { url: "WatchList", component: <Watchlist/> }, 
    { url: "OrderTab", component: <OrderTab /> }, 
    {url:"NetpositonsTab",component:<NetpositonsTab/>},
    {url:"HoldingsTab",component:<HoldingsTab/>},
    { url: "broker-login", component: <LoginWithBroker/> }, 
    { url: "login", component: <Login/> }, 
    { url: "equity-data", component: <Equity/> }, 
    { url: "equity-orders", component: <OrdersEQ/> }, 
    { url: "future-orders", component: <OrdersFUT/> }, 
    { url: "market", component: <Market/> }, 
    { url: "coin-details", component: <CoinDetails/> }, 
    { url: "portofolio", component: <Portofolio /> }, 
    { url:"monthly-status",component:<MonthlyStatus/>},
    { url:"fund-management",component:<RiskManagement/>},
    { url:"update-blaze",component:<Updateblaze/>},
    { url: "Index-Option-Buying", component: <IndexOptionBuying value="is_intraday,is_index,is_options,is_buying_side" /> },
    { url: "Index-Future", component: <IndexFuture value="is_index,is_future" /> },
    { url: "Stock-Future", component: <StockFuture value="is_stocks,is_future" /> },
    { url: "Stock-Option-Selling", component: <StockOptionSelling value="is_stocks,is_options,is_selling_side" /> },
    { url: "Stock-Option-Buying", component: <StockOptionBuying value="is_stocks,is_options,is_buying_side" /> },
    { url: "Commodity", component: <Commodity value="is_commodity" /> },

      //Trading
    { url: "trading-market", component: <TradingMarket /> }, 
    { url: "ico-listing", component: <IcoListing /> }, 
    { url: "p2p", component: <P2P /> }, 
    { url: "future", component: <FutureTrading /> }, 

    //Cryoti
    { url: "market-watch", component: <MarketWatch /> }, 
    { url: "exchange", component: <Exchange /> }, 
    { url: "banking", component: <Banking /> }, 
    
    //Reports
    { url: "history", component: <History /> }, 
    { url: "orders", component: <Orders /> }, 
    { url: "reports", component: <Reports /> }, 
    { url: "user", component: <User /> }, 
    
    /// Apps
    { url: "app-profile", component: <AppProfile /> },        
    { url: "post-details", component: <PostDetails /> }, 
    { url: "edit-profile", component: <EditProfile /> }, 
    { url: "email-compose", component: <Compose /> },
    { url: "email-inbox", component: <Inbox /> },
    { url: "email-read", component: <Read /> },
  ]
  return (
       <>
         <Routes>              
            <Route path='/page-lock-screen' element= {<LockScreen />} />
            <Route path='/page-error-400' element={<Error400/>} />            
            <Route path='/page-error-403' element={<Error403/>} />
            <Route path='/page-error-404' element={<Error404/>} />
            <Route path='/page-error-500' element={<Error500/>} />
            <Route path='/page-error-503' element={<Error503/>} />     
            <Route element={<MainLayout/>}>                             
                <Route  path='/' element={<Home />} />              
                <Route  path='/dashboard' element={<Home />} />         
                <Route  path='/login' element={<Login />} />      
                <Route  path='/index-2' element={<DashboardDark/>} />
              </Route>
              <Route  element={<MainLayout2 />} > 
                {allroutes.map((data, i) => (
                  <Route
                    key={i}
                    exact
                    path={`${data.url}`}
                    element={data.component}
                  />
                ))}
              </Route>                
          </Routes>        
          <ScrollToTop />
       </>
  )
}
let currentUrl = window.location.href;
// Create Context for sideMenu state
export const SideMenuContext = createContext();
function MainLayout(){  

  const {sidebariconHover, headWallet} = useContext(ThemeContext);

  
  return (
    <>
      <div id="main-wrapper"         
        className={`show wallet-open ${headWallet ? "" : 'active'} ${sidebariconHover ? "iconhover-toggle": ""} "menu-toggle"`}
      >  
          <Nav />
          <RightWalletBar />
          <div className="content-body" >          
            <div className={"container-fluid"+ (!window.location.href.includes("dashboard") ? "_dashboard" : "")} style={{ minHeight: window.screen.height - 45 }}>
              <Outlet />   
            </div>
          </div>
          <Footer />        
      </div>      
    </>
  )
};
function MainLayout2(){  
  const {sidebariconHover} = useContext(ThemeContext);
  return (
    <>
      <div id="main-wrapper" className={`show ${sidebariconHover ? "iconhover-toggle": ""} "menu-toggle"`}>  
          <Nav />          
          <div className="content-body" >          
            <div className={"container-fluid"+ (!window.location.href.includes("dashboard") ? "_dashboard" : "")} style={{ minHeight: window.screen.height - 45 }}>
              <Outlet />   
            </div>
          </div>
          <Footer />        
      </div>
      
    </>
  )
};

export default Markup;