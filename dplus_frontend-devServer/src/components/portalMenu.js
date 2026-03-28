import {
  Activity,
  BarChart2,
  Bell,
  Cpu,
  Database,
  HardDrive,
  Layers,
  Map,
  MapPin,
  MessageSquare,
  Network,
  Settings,
  Terminal,
  Wrench,
} from "lucide-react";

export const portalMenu = [
  {
    title: "Topology Layer",
    type: "link",
    icon: Network,
    href: "/topology-layer",
  },
  {
    title: "Layer View",
    type: "dropdown",
    icon: Layers,
    href: "/layer-view",
    children: [
      { title: "Site Layer", href: "/layer-view/site-layer" },
      { title: "Carrier Layer", href: "/layer-view/carrier-layer" },
      { title: "Cell Layer", href: "/map-box/carrier-layer" },
    ],
  },
  {
    title: "DataPlus Analytics Pro",
    type: "dropdown",
    icon: BarChart2,
    href: "/dataplus-analytics-pro",
    children: [
      { title: "Site Analytics", href: "/dataplus-analytics-pro/site-analytics" },
      { title: "Site Pro Rules", href: "/dataplus-analytics-pro/site-pro-rules" },
      { title: "Cell Analytics", href: "/dataplus-analytics-pro/cell-analytics" },
      { title: "Cell Pro Rules", href: "/dataplus-analytics-pro/cell-pro-rules" },
      { title: "KPI Check Rules", href: "/dataplus-analytics-pro/kpi-check-rules" },
      { title: "Pro Rules Management", href: "/dataplus-analytics-pro/pro-rules-management" },
    ],
  },
  {
    title: "Insights Engine",
    type: "dropdown",
    icon: Activity,
    href: "/insights-engine",
    children: [
      { title: "MSS Dashboard", href: "/insights-engine/core-dashboard/mss" },
      { title: "UGW Dashboard", href: "/insights-engine/core-dashboard/ugw" },
      { title: "MGW Dashboard", href: "/insights-engine/core-dashboard/mgw" },
      { title: "Worst Cells Dashboard", href: "/insights-engine/ran-dashboard/worstcells" },
      { title: "4G Dashboard", href: "/insights-engine/ran-dashboard/huawei4g" },
      { title: "5G Dashboard", href: "/insights-engine/ran-dashboard/huawei5g" },
      { title: "Network Dashboard", href: "/insights-engine/network-dashboard" },
      { title: "Parameter Audit Dashboard", href: "/insights-engine/parameter-audit-dashboard" },
    ],
  },
  {
    title: "Discussions",
    type: "link",
    icon: MessageSquare,
    href: "/discussions",
  },
  {
    title: "GIS Engine",
    type: "link",
    icon: Map,
    href: "/gis-engine",
  },
  {
    title: "Configuration Management",
    type: "dropdown",
    icon: Settings,
    href: "/configuration-management",
    children: [
      { title: "Parameter Audit", href: "/configuration-management/parameter-audit" },
      { title: "Neighbour Audit", href: "/configuration-management/neighbour-audit" },
      { title: "Daily Parameter Audit", href: "/configuration-management/daily-parameter-audit" },
    ],
  },
  {
    title: "iSON",
    type: "link",
    icon: Cpu,
    href: "/iSon/file-with-form",
  },
  {
    title: "Custom Query",
    type: "dropdown",
    icon: Database,
    href: "/custom-query",
    children: [
      { title: "DB Config", href: "/custom-query/db-config" },
      { title: "Advanced Query Builder", href: "/custom-query/advanced-query-builder" },
      { title: "Run Query", href: "/custom-query/run-query" },
      { title: "Saved Query List", href: "/custom-query/saved-query-list" },
    ],
  },
  {
    title: "xAlerts",
    type: "dropdown",
    icon: Bell,
    href: "/xAlerts",
    children: [
      { title: "Configure Scheduler", href: "/xAlerts/configure-scheduler" },
      { title: "Alert Scheduler", href: "/xAlerts/alert-scheduler" },
    ],
  },
  {
    title: "CX/IX Support",
    type: "dropdown",
    icon: Wrench,
    href: "/cx-ix-support",
    children: [
      { title: "Scripting", href: "/cx-ix-support/scripting" },
      { title: "Parameter Audit", href: "/cx-ix-support/parameteraudit" },
      { title: "DB Update", href: "/cx-ix-support/dbupdate" },
    ],
  },
  {
    title: "Network Inventory",
    type: "dropdown",
    icon: HardDrive,
    href: "/network-inventory",
    children: [
      { title: "Site Database", href: "/network-inventory/site-database" },
      { title: "Auto Discovery", href: "/network-inventory/auto-discovery" },
    ],
  },
  {
    title: "Nokia Tool Management Query",
    type: "link",
    icon: Terminal,
    href: "/nokia-tool-management-query",
  },
  {
    title: "Map Settings",
    type: "link",
    icon: MapPin,
    href: "/selectSettings",
  },
];

export function findMenuTitle(pathname) {
  if (pathname === "/" || pathname === "/home") {
    return "Home";
  }

  for (const item of portalMenu) {
    if (item.href && pathname.startsWith(item.href)) {
      if (item.children) {
        const child = item.children.find((entry) => pathname.startsWith(entry.href));
        return child?.title || item.title;
      }

      return item.title;
    }

    if (item.children) {
      const child = item.children.find((entry) => pathname.startsWith(entry.href));
      if (child) {
        return child.title;
      }
    }
  }

  return "Datayog Portal";
}
