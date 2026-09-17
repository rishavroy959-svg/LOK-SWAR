// js/citizen/icons.js - Official Civic SVG Icons & Safe Proxy Fallback
(function() {
// Clean Official Civic SVG Icons
let Icons = {
  Shield: ({ className = "w-4 h-4" }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  })),
  CheckCircle: ({ className = "w-4 h-4" }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 11.08V12a10 10 0 1 1-5.93-9.14"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22 4 12 14.01 9 11.01"
  })),
  FileText: ({ className = "w-4 h-4" }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "14 2 14 8 20 8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16", y1: "13", x2: "8", y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16", y1: "17", x2: "8", y2: "17"
  })),
  Sparkles: ({ className = "w-4 h-4" }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
  })),
  Layers: ({ className = "w-4 h-4" }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "12 2 2 7 12 12 22 7 12 2"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "2 17 12 22 22 17"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "2 12 12 17 22 12"
  })),
  Compass: ({ className = "w-4 h-4" }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12", cy: "12", r: "10"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
  })),
  Activity: ({ className = "w-4 h-4" }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "22 12 18 12 15 21 9 3 6 12 2 12"
  })),
  Building: ({ className = "w-4 h-4" }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "4", y: "2", width: "16", height: "20", rx: "2", ry: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 22v-4h6v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"
  })),
  GovCrest: ({
    className = "w-6 h-6"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
  })),
  ShieldCheck: ({
    className = "w-3.5 h-3.5 inline-block text-emerald-400"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 12l2 2 4-4"
  })),
  Mic: ({
    className = "w-5 h-5"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19 10v2a7 7 0 0 1-14 0v-2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "19",
    x2: "12",
    y2: "23"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "23",
    x2: "16",
    y2: "23"
  })),
  Camera: ({
    className = "w-5 h-5"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "13",
    r: "4"
  })),
  Speaker: ({
    className = "w-5 h-5"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
  })),
  Search: ({
    className = "w-4 h-4"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "21",
    x2: "16.65",
    y2: "16.65"
  })),
  Bell: ({
    className = "w-5 h-5"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.73 21a2 2 0 0 1-3.46 0"
  })),
  Menu: ({
    className = "w-5 h-5"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "12",
    x2: "21",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "6",
    x2: "21",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "18",
    x2: "21",
    y2: "18"
  })),
  Check: ({
    className = "w-4 h-4"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })),
  Refresh: ({
    className = "w-4 h-4"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "23 4 23 10 17 10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10"
  })),
  MapPin: ({
    className = "w-4 h-4"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "3"
  })),
  Roads: ({
    className = "w-6 h-6"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 19L8 5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 19L16 5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "12",
    x2: "12",
    y2: "15"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "19",
    x2: "12",
    y2: "22"
  })),
  MapPolygon: ({
    className = "w-6 h-6"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "2",
    x2: "8",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    y1: "6",
    x2: "16",
    y2: "22"
  })),
  DataCheck: ({
    className = "w-6 h-6"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "21",
    x2: "16.65",
    y2: "16.65"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 11l2 2 4-4"
  })),
  UserProfile: ({
    className = "w-6 h-6"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M23 21v-2a4 4 0 0 0-3-3.87"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 3.13a4 4 0 0 1 0 7.75"
  })),
  AlertTriangle: ({
    className = "w-4 h-4 text-rose-500"
  }) => /*#__PURE__*/React.createElement("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "9",
    x2: "12",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "17",
    x2: "12.01",
    y2: "17"
  })),
  RoadIllustration: ({
    className = "w-14 h-14"
  }) => /*#__PURE__*/React.createElement("div", {
    className: "w-14 h-14 rounded-full bg-[#ede9fe] dark:bg-purple-950/60 flex items-center justify-center border border-purple-100 dark:border-purple-900/40 shadow-xs select-none flex-shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-lg overflow-hidden relative shadow-xs border border-purple-200/60 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 32 32",
    className: "w-full h-full",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", { width: "32", height: "16", fill: "#38bdf8" }),
    /*#__PURE__*/React.createElement("circle", { cx: "24", cy: "7", r: "3", fill: "#fef08a" }),
    /*#__PURE__*/React.createElement("polygon", { points: "0,15 32,15 32,32 0,32", fill: "#22c55e" }),
    /*#__PURE__*/React.createElement("polygon", { points: "11,15 21,15 27,32 5,32", fill: "#334155" }),
    /*#__PURE__*/React.createElement("line", { x1: "16", y1: "16", x2: "16", y2: "19", stroke: "#fbbf24", strokeWidth: "1.2" }),
    /*#__PURE__*/React.createElement("line", { x1: "16", y1: "22", x2: "16", y2: "26", stroke: "#fbbf24", strokeWidth: "1.5" }),
    /*#__PURE__*/React.createElement("line", { x1: "16", y1: "29", x2: "16", y2: "32", stroke: "#fbbf24", strokeWidth: "1.8" })))),
  ProgressTicket: ({
    className = "w-14 h-14"
  }) => /*#__PURE__*/React.createElement("div", {
    className: "w-14 h-14 rounded-full bg-[#fce7f3] dark:bg-pink-950/60 flex items-center justify-center border border-pink-100 dark:border-pink-900/40 shadow-xs select-none flex-shrink-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl leading-none"
  }, "🎟️")),
  GisHotspotMap: ({
    className = "w-14 h-14"
  }) => /*#__PURE__*/React.createElement("div", {
    className: "w-14 h-14 rounded-full bg-[#ffedd5] dark:bg-amber-950/60 flex items-center justify-center border border-amber-100 dark:border-amber-900/40 shadow-xs select-none flex-shrink-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl leading-none"
  }, "🗺️")),
  CitizenProfileGroup: ({
    className = "w-14 h-14"
  }) => /*#__PURE__*/React.createElement("div", {
    className: "w-14 h-14 rounded-full bg-[#fef3c7] dark:bg-yellow-950/60 flex items-center justify-center border border-yellow-100 dark:border-yellow-900/40 shadow-xs select-none flex-shrink-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl leading-none"
  }, "👥"))
};

// Safe fallback proxy: ensures ANY icon accessed on Icons is NEVER undefined
Icons = new Proxy(Icons, {
  get(target, prop) {
    if (prop in target && target[prop]) return target[prop];
    return ({ className = "w-4 h-4 inline-block" }) => /*#__PURE__*/React.createElement("svg", {
      className: className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "10" }));
  }
});

  window.Icons = Icons;
})();
