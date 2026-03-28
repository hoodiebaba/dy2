import React from 'react';
import { Sidebar_content } from './utils/sidebar_values';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './pages/Layout';
 
const Navigation = ({ sidebarOpen,sidebarPos, setSidebarPos }) => {
    const safeParse = (value, fallback = null) => {
        if (value == null) {
            return fallback
        }

        try {
            return JSON.parse(value)
        } catch {
            return fallback
        }
    }

    let permission=safeParse(localStorage.getItem("permission"), {})
    let user=safeParse(localStorage.getItem("user"), null)
    let rolename=user?.rolename
    const RouteCreator = (itm) => {

        // { console.log("RouteCreatoritmitmitm 16", itm.subMenu) }

        if (itm.subMenu.length > 0) {
            // console.log(itm.subMenu,"RouteCreatoritmitmitm 19")
            return itm.subMenu.map((oneItm) => {
                return RouteCreator(oneItm)
            })

        } else {

            if (itm.component) {
                // console.log(itm.link, itm.component, "RouteCreatoritmitmitm 26")
                return <Route key={itm.link} path={itm.link} element={<Layout child={itm.component} />} />
            }else{
                return <Route key={itm.link || "empty-route"} path={itm.link || ""} element={<Layout child={""} />} />
            }
        }

    }
    const adminRoutes = rolename === "Admin" ? Sidebar_content[rolename] || [] : [];

    return <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        {
            [...Sidebar_content["all_routes"], ...Sidebar_content["GlobalUrl"], ...adminRoutes].map((itm) => {

                // console.log("RouteCreatorRouteCreator", RouteCreator(itm))
                return RouteCreator(itm)
            })
        }
{/* 
        {
            console.log("dsdsadadaas",
                [...Sidebar_content["all_routes"], ...Sidebar_content["GlobalUrl"]].map((itm) => {

                    console.log("RouteCreatorRouteCreator", RouteCreator(itm))
                    return RouteCreator(itm)
                })
                
            )
        } */}
    </Routes>

};

export default Navigation;
