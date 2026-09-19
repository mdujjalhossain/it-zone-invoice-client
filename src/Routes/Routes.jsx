import { createBrowserRouter } from "react-router";
import Root from "../Layout/Root";
import Home from "../pages/Home";
import PosScreen from "../pages/posScreen";
import UnderDevelopment from "../Components/UnderDevelopment";
import InvoiceHistory from "../pages/InvoiceHistory";
import Inventory from "../pages/Inventory";
import ServiceTracking from "../pages/ServiceTracking";

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
                path: '/pos',
                Component: PosScreen,
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
                path: '/service',
                Component: ServiceTracking,
            },

        ]
    }
])