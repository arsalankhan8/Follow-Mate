import { useLocation } from "react-router-dom";

const headerConfig = {
  "/dashboard": {
    heading: "Dashboard",
    subheading: "Monitor your outreach at a glance",
    showButton: false,
  },
  "/contacts": {
    heading: "Contacts",
    subheading: "Manage the people you are engaging with",
    buttonText: "Add Contact",
    showButton: true
  },
  "/campaigns": {
    heading: "Campaigns",
    subheading: "Plan and track your outreach campaigns",
    buttonText: "Create Campaign",
    showButton: true
  },
  "/engagements": {
    heading: "Engagements",
    subheading: "Track all your LinkedIn activities",
    buttonText: "Log Engagement",
    showButton: true
  },
  "/analytics": {
    heading: "Analytics",
    subheading: "Understand performance across campaigns",
    showButton: false,
  },
};

const defaultHeader = {
  heading: "",
  subheading: "",
  buttonText: "",
  showButton: false,
};

const HeaderSection = () => {
  const { pathname } = useLocation();
  const { heading, subheading, buttonText, showButton } =
    headerConfig[pathname] || defaultHeader;

  if (!heading && !subheading) {
    return null;
  }

  return (
    
    <header className="sticky top-0 z-10 ">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div>
          {heading && (
            <h1 className="text-3xl font-semibold text-slate-900">{heading}</h1>
          )}
          {subheading && (
            <p className="text-base text-slate-500">{subheading}</p>
          )}
        </div>

        {showButton && buttonText && (
          <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
            <span className="text-lg leading-none">+</span>
            {buttonText}
          </button>
        )}
      </div>
    </header>
  );
};

export default HeaderSection;
