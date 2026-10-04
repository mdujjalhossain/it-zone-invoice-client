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
// import AccessDeniedModal from "../pages/AccessDeniedModal";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        errorElement: <UnderDevelopment />,
        children: [
            {
                index: true,
                element: <PrivateRoutes><Home /></PrivateRoutes>
            },
            {
                path: '/billing',
                element: <PrivateRoutes><POSScreen /></PrivateRoutes>,
            },
            {
                path: '/invoices',
                element: <PrivateRoutes><InvoiceHistory /></PrivateRoutes>,
            },
            {
                path: '/inventory',
                element: <PrivateRoutes><Inventory /></PrivateRoutes>,
            },
            {
                path: '/services',
                element: <PrivateRoutes><ServiceTracking /></PrivateRoutes>,
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