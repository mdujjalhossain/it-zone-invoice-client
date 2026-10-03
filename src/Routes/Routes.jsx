import { createBrowserRouter } from "react-router";
import Root from "../Layout/Root";
import Home from "../pages/Home";
import UnderDevelopment from "../Components/UnderDevelopment";
import InvoiceHistory from "../pages/InvoiceHistory";
import Inventory from "../pages/Inventory";
import ServiceTracking from "../pages/ServiceTracking";
import POSScreen from "../pages/PosScreen";
import Ledger from "../pages/Ledger";
import Register from "../pages/Register";
import Login from "../pages/Login";
import PrivateRoutes from "./PrivateRoutes";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        errorElement: <UnderDevelopment />,
        children: [
            {
                index: true,
                Component: Home
            },
            {
                path: '/billing',
                Component: POSScreen,
            },
            {
                path: '/invoices',
                Component: InvoiceHistory,
            },
            {
                path: '/inventory',
                Component: Inventory,
            },
            {
                path: '/services',
                Component: ServiceTracking,
            },
            {
                path: '/ledger',
                element: <PrivateRoutes><Ledger /></PrivateRoutes>,
            },
            {
                path: '/register',
                Component: Register,
            },
            {
                path: '/login',
                Component: Login,
            },

        ]
    }
])