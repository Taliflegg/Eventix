import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { savePlan } from "../../services/shabbatService";
import { toast } from "react-toastify";

type Person = {
  name: string;
  status: "confirmed" | "tentative" | "undecided" | "not-here";
  starred?: boolean;
};

type Location = {
  id: string;
  name: string;
  count: number;
  priorityPeople: Person[];
  others: Person[];
  status: string | null;
};

type ShabbatData = {
  date: string;
  dateEnglish?: string;
  dateHebrew?: string;
  parasha: string;
  locations: any[];
};

export default function Decision() {
  const location = useLocation();
  const nav = useNavigate();
  const back = () => nav("/Shabbat");
  const { t }: { t: (key: string) => string } = useTranslation();
  const shabbat: ShabbatData | null = location.state || null;

  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    console.log("shabbat.locations raw:", shabbat?.locations);
    if (shabbat?.locations) {
      const mappedLocations: Location[] = shabbat.locations.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        count: (loc.confirmedCount || 0) + (loc.pendingCount || 0),
        priorityPeople: (loc.confirmedNames || []).map((name: string) => ({
          name,
          status: "confirmed",
          starred: true,
        })),
        others: (loc.pendingNames || []).map((name: string) => ({
          name,
          status: "tentative",
          starred: false,
        })),
        status: loc.myStatus || null,
      }));
      setLocations(mappedLocations);
    }
  }, [shabbat]);

  if (!shabbat) return <div>{t("Decision.no_data")}</div>;

  const handleSavePlan = async (
    date: string,
    locationId: string,
    status: "going" | "tentative"
  ) => {
    console.log("handleSavePlan called with:", { date, locationId, status });
    try {
      const result = await savePlan(date, locationId, status);
      if (result.success) {
        setLocations((prev) =>
          prev.map((loc) =>
            loc.id === locationId
              ? {
                  ...loc,
                  status: status,
                }
              : loc
          )
        );
        // window.alert(t("Decision.save_success") || "העדכון נשמר בהצלחה!");
        toast.success(t("Decision.save_success") || "העדכון נשמר בהצלחה!");
        back(); // ניווט חזרה לאחר אישור ההודעה
      } else {
        // window.alert(
        //   (t("Decision.save_failed")
        //     .replace("{{message}}", result.message || t("Decision.error_saving"))) ||
        //     "שגיאה בשמירת הנתונים"
        // );
        toast.error(
          (t("Decision.save_failed")
            .replace("{{message}}", result.message || t("Decision.error_saving"))) ||
            "שגיאה בשמירת הנתונים"
        );
      }
    } catch (error) {
      console.error("שגיאה בשמירת התוכנית:", error);
      // window.alert(t("Decision.error_saving") || "שגיאה בעדכון התכנון");
      toast.error(t("Decision.error_saving") || "שגיאה בעדכון התכנון");
    }
  };

  return (
    <div
      style={{
        position: "relative", // חשוב!
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: 20,
        background: "#f8f9fa",
      }}
    >
      {/* כפתור חזרה */}
      <button
        onClick={back}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
        title="חזרה"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          style={{ width: 32, height: 32, color: "#333" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 500,
            color: "#555",
            marginBottom: 8,
          }}
        >
          {t("Decision.parasha").replace("{{parasha}}", shabbat.parasha)}
        </h1>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#333",
          }}
        >
          {t("Decision.title")}
        </h2>
      </div>

      {locations.map((location) => (
        <div
          key={location.id}
          style={{
            background: "white",
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              borderBottom: "1px solid #eee",
              paddingBottom: 12,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600, color: "#333" }}>
              {location.name}
            </div>
            <div style={{ fontSize: 14, color: "#666" }}>
              {t("Decision.count_people").replace(
                "{{count}}",
                location.count.toString()
              )}
            </div>
          </div>

          <PeopleSection
            title={t("Decision.priority_people")}
            people={location.priorityPeople}
          />
          <PeopleSection title={t("Decision.other_people")} people={location.others} />

          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid #eee",
              display: "flex",
              gap: 12,
            }}
          >
            <HoverButton
              text={t("Decision.confirm_button").replace(
                "{{location}}",
                location.name
              )}
              borderColor="#007bff"
              hoverBg="#007bff"
              hoverText="white"
              onClick={() => {
                console.log("location.id:", location.id);
                handleSavePlan(shabbat?.dateEnglish || "", location.id, "going");
              }}
            />
            <HoverButton
              text={t("Decision.maybe_button").replace(
                "{{location}}",
                location.name
              )}
              borderColor="#ffc107"
              hoverBg="#ffc107"
              hoverText="black"
              onClick={() => {
                console.log("Calling handleSavePlan with:", {
                  date: shabbat?.dateEnglish || "",
                  locationId: location.id,
                  status: "tentative",
                });
                handleSavePlan(shabbat?.dateEnglish || "", location.id, "tentative");
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PeopleSection({ title, people }: { title: string; people: Person[] }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: 8,
          color: "#888",
        }}
      >
        {title}
      </div>
      {people.map((person, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            padding: "6px 12px",
            margin: "4px 8px 4px 0",
            borderRadius: 20,
            fontSize: 14,
            fontWeight: person.starred ? 600 : 500,
            background: getBackgroundColor(person),
            color: getColor(person),
            border: getBorder(person),
          }}
        >
          {person.name}
        </span>
      ))}
    </div>
  );
}

function HoverButton({
  text,
  borderColor,
  hoverBg,
  hoverText,
  onClick,
}: {
  text: string;
  borderColor: string;
  hoverBg: string;
  hoverText: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        padding: 12,
        border: `2px solid ${borderColor}`,
        background: hovered ? hoverBg : "white",
        color: hovered ? hoverText : borderColor,
        borderRadius: 8,
        fontWeight: 600,
        cursor: "pointer",
        textAlign: "center",
        transition: "all 0.2s ease",
      }}
    >
      {text}
    </button>
  );
}

function getBackgroundColor(person: Person): string {
  if (person.starred) {
    switch (person.status) {
      case "confirmed":
        return "#d4edda";
      case "tentative":
        return "#ffeaa7";
      case "undecided":
        return "#e9ecef";
      case "not-here":
        return "#f5c6cb";
    }
  } else {
    switch (person.status) {
      case "confirmed":
        return "#e8f5e8";
      case "tentative":
        return "#fff3cd";
      case "undecided":
        return "#f8f9fa";
      case "not-here":
        return "#f8d7da";
    }
  }
  return "transparent";
}

function getColor(person: Person): string {
  if (person.starred) {
    switch (person.status) {
      case "confirmed":
        return "#155724";
      case "tentative":
        return "#856404";
      case "undecided":
        return "#495057";
      case "not-here":
        return "#721c24";
    }
  } else {
    switch (person.status) {
      case "confirmed":
        return "#2d5f2d";
      case "tentative":
        return "#856404";
      case "undecided":
        return "#6c757d";
      case "not-here":
        return "#721c24";
    }
  }
  return "#000";
}

function getBorder(person: Person): string {
  if (person.starred) {
    switch (person.status) {
      case "confirmed":
        return "2px solid #c3e6c3";
      case "tentative":
        return "2px solid #fdd835";
      case "undecided":
        return "2px solid #ced4da";
      case "not-here":
        return "2px solid #f1b0b7";
    }
  } else {
    switch (person.status) {
      case "confirmed":
        return "1px solid #c3e6c3";
      case "tentative":
        return "1px solid #ffeaa7";
      case "undecided":
        return "1px solid #dee2e6";
      case "not-here":
        return "1px solid #f5c6cb";
    }
  }
  return "none";
}
