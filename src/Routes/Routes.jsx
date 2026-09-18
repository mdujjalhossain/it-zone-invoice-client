import { createBrowserRouter } from "react-router";
import Root from "../Layout/Root";
import Home from "../pages/Home";
import PosScreen from "../pages/posScreen";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        // errorElement: <ErrorElement />,
        children: [
            {
                index: true,
                Component: Home
            },
            {
                path: '/pos',
                Component: PosScreen,
            },
        ]
    }
])