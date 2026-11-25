
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "./firebase";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import Auth from "./auth";
import "./App.css";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [page, setPage] = useState("home");
  const [studentProfile, setStudentProfile] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

const [chatMessages, setChatMessages] = useState([
  {
    id: 1,
    sender: "bot",
    text: "Hello! 👋 Welcome to CampusBot AI. How can I help you today?",
  },
]);
 const [photoUploading, setPhotoUploading] = useState(false);

const [theme, setTheme] = useState(() => {
  return localStorage.getItem("campusTheme") || "light";
});

const [notifications, setNotifications] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("campusNotifications") ||
      '{"events":true,"notices":true,"announcements":true}'
    );
  } catch {
    return {
      events: true,
      notices: true,
      announcements: true,
    };
  }
});

useEffect(() => {
  localStorage.setItem("campusTheme", theme);
}, [theme]);

useEffect(() => {
  localStorage.setItem(
    "campusNotifications",
    JSON.stringify(notifications)
  );
}, [notifications]);

const updateNotification = (key) => {
  setNotifications((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};

  const [permissionForm, setPermissionForm] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [careerGoals, setCareerGoals] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("careerGoals") || "[]"
    );
  } catch {
    return [];
  }
});

const [goalForm, setGoalForm] = useState({
  title: "",
  category: "Technical Skills",
  targetDate: "",
  priority: "Medium",
});

useEffect(() => {
  localStorage.setItem(
    "careerGoals",
    JSON.stringify(careerGoals)
  );
}, [careerGoals]);

const updateGoalForm = (field, value) => {
  setGoalForm((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const addCareerGoal = () => {
  if (!goalForm.title.trim() || !goalForm.targetDate) {
    alert("Please enter a goal name and target date.");
    return;
  }

  setCareerGoals((prev) => [
    ...prev,
    {
      ...goalForm,
      id: `${Date.now()}-${Math.random()}`,
      progress: 0,
      completed: false,
    },
  ]);

  setGoalForm({
    title: "",
    category: "Technical Skills",
    targetDate: "",
    priority: "Medium",
  });
};
const skillList = [
  "C Programming Basics",
  "Loops and Functions",
  "Linear Algebra",
  "Digital Circuit Design",
  "Git and GitHub",
  "HTML and CSS",
  "JavaScript Basics",
  "Mini Project in C",
];

const [completedSkills, setCompletedSkills] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("careerSkills") || "[]"
    );
  } catch {
    return [];
  }
});

useEffect(() => {
  localStorage.setItem(
    "careerSkills",
    JSON.stringify(completedSkills)
  );
}, [completedSkills]);

const skillProgress = Math.round(
  (completedSkills.length / skillList.length) * 100
);
const [applications, setApplications] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("campusApplications") || "[]"
    );
  } catch {
    return [];
  }
});

useEffect(() => {
  localStorage.setItem(
    "campusApplications",
    JSON.stringify(applications)
  );
}, [applications]);
const [eventData, setEventData] = useState({
  studentName: "",
  eventName: "",
  eventDate: "",
  eventTime: "",
  venue: "",
  participants: "",
  purpose: "",
  facilities: "",
});

  const features = [
    {
      title: "Campus Map",
      description: "Find important places on campus.",
      icon: "🗺️",
    },
    {
      title: "Timetable",
      description: "Check your class timetable.",
      icon: "📅",
    },
    {
      title: "Faculty",
      description: "Find faculty information.",
      icon: "👨‍🏫",
    },
    {
      title: "AI Assistant",
      description: "Get help with campus questions.",
      icon: "🤖",
    },
    {
      title: "Events",
      description: "See upcoming campus events.",
      icon: "🎉",
    },
    {
      title: "Career",
      description: "Explore career opportunities.",
      icon: "💼",
    },
  ];

  const openFeature = (title) => {
    if (title === "Timetable") {
      window.open(
        "https://web.mitsgwalior.in/time-table-cse",
        "_blank"
      );
      return;
    }

    if (title === "Faculty") {
      window.open(
        "https://www.mitsgwalior.in/department.php?id=cs",
        "_blank"
      );
      return;
    }

    setPage(title);
  };
 
   


useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setIsAuthenticated(true);

      try {
        const studentRef = doc(db, "students", user.uid);

        console.log("Logged in UID:", user.uid);

        const studentSnap = await getDoc(studentRef);

        console.log("Profile document exists:", studentSnap.exists());

        if (studentSnap.exists()) {
          const profileData = studentSnap.data();

          console.log("Fetched Student Profile:", profileData);
          console.log("Available Fields:", Object.keys(profileData));

          // Read student name, including the extra-space field
          const actualName =
            profileData.name?.trim() ||
            profileData["name "]?.trim() ||
            profileData.Name?.trim() ||
            user.displayName?.trim() ||
            "Student";

          console.log("Final Student Name:", actualName);

          setStudentProfile({
            ...profileData,
            name: actualName,
          });

          setStudentName(actualName);

        } else {
          console.log("Student profile not found in Firestore");

          setStudentProfile(null);
          setStudentName(user.displayName || "Student");
        }

      } catch (error) {
        console.error("Profile fetch error:", error);
        setStudentProfile(null);
        setStudentName(user.displayName || "Student");
      }

    } else {
      setStudentName("");
      setIsAuthenticated(false);
      setStudentProfile(null);
    }
  });

  return () => unsubscribe();
}, []);


const sendChatMessage = async () => {
  if (!chatInput.trim()) return;

  const userText = chatInput.trim();

  const userMessage = {
    id: Date.now(),
    sender: "user",
    text: userText,
  };

  setChatMessages((prev) => [...prev, userMessage]);
  setChatInput("");

  setIsTyping(true);

  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userText,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI response failed");
    }

    const botMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text: data.reply,
    };

    setChatMessages((prev) => [...prev, botMessage]);

  } catch (error) {
    console.error("Chat Error:", error);

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 2,
        sender: "bot",
        text: "Sorry! I am unable to respond right now. Please try again.",
      },
    ]);

  } finally {
    setIsTyping(false);
  }
};


const toggleTheme = (event) => {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();

  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  document.documentElement.style.setProperty("--circle-x", `${x}px`);
  document.documentElement.style.setProperty("--circle-y", `${y}px`);

  if (document.startViewTransition) {
    document.startViewTransition(() => {
      setTheme((prev) => prev === "dark" ? "light" : "dark");
    });
  } else {
    setTheme((prev) => prev === "dark" ? "light" : "dark");
  }
};
const handleLogout = async () => {
  const confirmLogout = window.confirm(
    "Are you sure you want to logout?"
  );

  if (!confirmLogout) return;

  try {
    await signOut(auth);
    setPage("home");
  } catch (error) {
    console.error("Logout error:", error);
    alert("Unable to logout. Please try again.");
  }
};
const handleProfilePhoto = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const user = auth.currentUser;

  if (!user) {
    alert("Please login first.");
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }

  try {
    setPhotoUploading(true);

    const photoRef = ref(
      storage,
      `profilePhotos/${user.uid}/profile.jpg`
    );

    await uploadBytes(photoRef, file);

    const photoURL = await getDownloadURL(photoRef);

    await updateDoc(doc(db, "students", user.uid), {
      photoURL: photoURL
    });

    setStudentProfile((prev) => ({
      ...prev,
      photoURL: photoURL
    }));

    alert("Profile photo updated successfully!");

  } catch (error) {
    console.error("Photo upload error:", error);
    alert("Photo upload failed: " + error.message);

  } finally {
    setPhotoUploading(false);
    e.target.value = "";
  }
};
if (!isAuthenticated) {
  return (
    <Auth
      onLoginSuccess={() => setIsAuthenticated(true)}
    />
  );
}
  return (
    <div className={`app ${theme === "dark" ? "dark-theme" : ""}`}>

      {/* LEFT SIDEBAR */}
      <aside className="sidebar">

        {/* LOGO */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-circle">CC</div>
          <span>Campus Companion</span>
        </div>

        {/* SIDEBAR MENU */}
        <div className="sidebar-menu">

          <button
            className={`sidebar-item ${
              page === "home" ? "active" : ""
            }`}
            onClick={() => setPage("home")}
          >
            <span className="sidebar-icon">🏠</span>
            <span className="sidebar-text">Home</span>
          </button>

          <button
            className={`sidebar-item ${
              page === "dashboard" ? "active" : ""
            }`}
            onClick={() => setPage("dashboard")}
          >
            <span className="sidebar-icon">📊</span>
            <span className="sidebar-text">Dashboard</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => setPage("Campus Map")}
          >
            <span className="sidebar-icon">🗺️</span>
            <span className="sidebar-text">Campus Map</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => openFeature("Timetable")}
          >
            <span className="sidebar-icon">📅</span>
            <span className="sidebar-text">Timetable</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => openFeature("Faculty")}
          >
            <span className="sidebar-icon">👨‍🏫</span>
            <span className="sidebar-text">Faculty</span>
          </button>

          {/* EVENTS BUTTON */}
          <button
            className={`sidebar-item ${
              page === "Events" ? "active" : ""
            }`}
            onClick={() => {
              setSubmitted(false);
              setPage("Events");
            }}
          >
            <span className="sidebar-icon">🎉</span>
            <span className="sidebar-text">Events</span>
          </button>

          {/* ADMIN DASHBOARD BUTTON */}
          <button
            className={`sidebar-item ${
              page === "Admin Dashboard" ? "active" : ""
            }`}
            onClick={() => setPage("Admin Dashboard")}
          >
            <span className="sidebar-icon">🛡️</span>
            <span className="sidebar-text">Admin Dashboard</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => setPage("Career")}
          >
            <span className="sidebar-icon">💼</span>
            <span className="sidebar-text">Career</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => setPage("AI Assistant")}
          >
            <span className="sidebar-icon">🤖</span>
            <span className="sidebar-text">AI Assistant</span>
          </button>

          <button
            className="sidebar-item"
            onClick={() => setPage("Profile")}
          >
            <span className="sidebar-icon">👤</span>
            <span className="sidebar-text">Profile</span>
          </button>

        </div>

        {/* SETTINGS */}
        <button
          className="sidebar-item sidebar-settings"
          onClick={() => setPage("Settings")}
        >
          <span className="sidebar-icon">⚙️</span>
          <span className="sidebar-text">Settings</span>
        </button>

      </aside>

      {/* MAIN WEBSITE AREA */}
      <div className="main-area">

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="logo">Campus Companion</div>

          <button onClick={() => setPage("home")}>
            Home
          </button>

          <button onClick={() => setPage("dashboard")}>
            Dashboard
          </button>
        </nav>

        {/* HOME */}
        {page === "home" && (
          <main className="hero">
            <div className="theme-toggle-container">
  <button
    className="theme-toggle-btn"
   onClick={toggleTheme}
  >
    {theme === "dark" ? "☀️" : "🌙"}
  </button>

  <span className="theme-label">
    {theme === "dark" ? "Light Mode" : "Dark Mode"}
  </span>
</div>

            <h1>Campus Companion</h1>

            <p className="subtitle">
              Your digital companion for MITS Gwalior
            </p>

            <button
              className="start-btn"
              onClick={() => setPage("dashboard")}
            >
              Get Started
            </button>

            <h2>Features</h2>

            <div className="features">

              {features.map((feature) => (
                <div
                  className="feature-card"
                  key={feature.title}
                >
                  <div className="icon">
                    {feature.icon}
                  </div>

                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>

                  <button
                    onClick={() =>
                      openFeature(feature.title)
                    }
                  >
                    Open
                  </button>

                </div>
              ))}

            </div>

          </main>
        )}

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <main className="dashboard">

            <h1>Student Dashboard</h1>

            <p>
             Welcome {studentName} to Campus Companion 👋
            </p>

            <div className="dashboard-grid">

              {features.map((feature) => (
                <button
                  className="dashboard-card"
                  key={feature.title}
                  onClick={() =>
                    openFeature(feature.title)
                  }
                >
                  <span>{feature.icon}</span>

                  <strong>{feature.title}</strong>

                  <small>
                    {feature.description}
                  </small>

                </button>
              ))}

            </div>

          </main>
        )}

        {/* CAMPUS MAP */}
        {page === "Campus Map" && (
          <div className="campus-map-page">

            <div className="map-header">

              <div>
                <h1>🗺️ MITS Campus Map</h1>

                <p>
                  Official MITS Gwalior campus layout
                </p>
              </div>

              <button
                className="back-btn"
                onClick={() => setPage("dashboard")}
              >
                ← Dashboard
              </button>

            </div>

            <div className="official-map-card">

              <div className="official-map-title">

                <h2>MITS Gwalior Campus</h2>

                <p>
                  Campus plan showing important buildings
                  and facilities.
                </p>

              </div>

              <img
                src="/images/mits-campus-map.png"
                alt="Official MITS Gwalior Campus Map"
                className="official-mits-map"
              />

            </div>

            <div className="map-info">

              <h2>Important Locations</h2>

              <div className="location-grid">

                <div className="location-item">
                  🏫
                  <span>Main Building</span>
                </div>

                <div className="location-item">
                  📚
                  <span>Central Library</span>
                </div>

                <div className="location-item">
                  🏢
                  <span>Administrative Block</span>
                </div>

                <div className="location-item">
                  🏛️
                  <span>Architecture Department</span>
                </div>

                <div className="location-item">
                  🔧
                  <span>Workshop</span>
                </div>

                <div className="location-item">
                  🍴
                  <span>Canteen</span>
                </div>

                <div className="location-item">
                  🏟️
                  <span>Sports Ground</span>
                </div>

                <div className="location-item">
                  🚪
                  <span>Jubilee Gate</span>
                </div>

              </div>

            </div>

          </div>
        )}
     {/* EVENTS */}
{page === "Events" && (
  <main className="events-page">

    <button
      className="back-btn"
      onClick={() => setPage("dashboard")}
    >
      ← Dashboard
    </button>

    <h1>🎉 Event Management</h1>

    <p>
      Create an event and submit your permission application.
    </p>

    {/* EVENT FORM */}
    {!submitted && (
      <div className="permission-form">

        <h2>📝 Event Permission Application</h2>

        {/* STUDENT / TEAM NAME */}
        <label>Student / Team Name</label>

        <input
          type="text"
          placeholder="Enter your name or team name"
          value={eventData.studentName}
          onChange={(e) =>
            setEventData({
              ...eventData,
              studentName: e.target.value,
            })
          }
        />

        {/* EVENT NAME */}
        <label>Event Name</label>

        <input
          type="text"
          placeholder="Enter event name"
          value={eventData.eventName}
          onChange={(e) =>
            setEventData({
              ...eventData,
              eventName: e.target.value,
            })
          }
        />

        {/* EVENT DATE */}
        <label>Event Date</label>

        <input
          type="date"
          value={eventData.eventDate}
          onChange={(e) =>
            setEventData({
              ...eventData,
              eventDate: e.target.value,
            })
          }
        />

        {/* EVENT TIME */}
        <label>Event Time</label>

        <input
          type="time"
          value={eventData.eventTime}
          onChange={(e) =>
            setEventData({
              ...eventData,
              eventTime: e.target.value,
            })
          }
        />

        {/* VENUE */}
        <label>Venue</label>

        <input
          type="text"
          placeholder="Enter venue"
          value={eventData.venue}
          onChange={(e) =>
            setEventData({
              ...eventData,
              venue: e.target.value,
            })
          }
        />

        {/* PARTICIPANTS */}
        <label>Expected Participants</label>

        <input
          type="number"
          min="1"
          placeholder="Enter number of participants"
          value={eventData.participants}
          onChange={(e) =>
            setEventData({
              ...eventData,
              participants: e.target.value,
            })
          }
        />

        {/* PURPOSE */}
        <label>Purpose of Event</label>

        <textarea
          placeholder="Enter the purpose of the event"
          rows="4"
          value={eventData.purpose}
          onChange={(e) =>
            setEventData({
              ...eventData,
              purpose: e.target.value,
            })
          }
        ></textarea>

        {/* FACILITIES */}
        <label>Required Facilities</label>

        <textarea
          placeholder="Example: Projector, microphone, chairs..."
          rows="3"
          value={eventData.facilities}
          onChange={(e) =>
            setEventData({
              ...eventData,
              facilities: e.target.value,
            })
          }
        ></textarea>

        {/* BUTTONS */}
        <div className="form-buttons">

          <button
            className="back-btn"
            onClick={() => setPage("dashboard")}
          >
            ← Back
          </button>

          <button
            className="permission-btn"
            onClick={() => {

              if (
                !eventData.studentName ||
                !eventData.eventName ||
                !eventData.eventDate ||
                !eventData.eventTime ||
                !eventData.venue ||
                !eventData.participants ||
                !eventData.purpose
              ) {
                alert("Please fill all required fields.");
                return;
              }

              setApplications((prev) => [
  ...prev,
  {
    ...eventData,
    id: Date.now(),
    status: "Pending Approval",
  },
]);

setSubmitted(true);
            }}
          >
            Submit Application
          </button>

        </div>

      </div>
    )}

    {/* SUCCESS MESSAGE */}
    {submitted && (
      <div className="permission-success">

        <div className="success-icon">✅</div>

        <h2>Application Submitted Successfully!</h2>

        <p>
          Your event permission application has been sent
          to the concerned authority.
        </p>

        <div className="submitted-event-details">

          <p>
            <strong>Event:</strong> {eventData.eventName}
          </p>

          <p>
            <strong>Date:</strong> {eventData.eventDate}
          </p>

          <p>
            <strong>Time:</strong> {eventData.eventTime}
          </p>

          <p>
            <strong>Venue:</strong> {eventData.venue}
          </p>

          <p>
            <strong>Participants:</strong> {eventData.participants}
          </p>

        </div>

        <p>
          <strong>Status:</strong> Pending Approval
        </p>

        <button
          className="permission-btn"
          onClick={() => {
            setSubmitted(false);

            setEventData({
              studentName: "",
              eventName: "",
              eventDate: "",
              eventTime: "",
              venue: "",
              participants: "",
              purpose: "",
              facilities: "",
            });
          }}
        >
          Create Another Event
        </button>

      </div>
    )}

  </main>
)}
{/* EVENTS BUTTON */}
          <button
            className={`sidebar-item ${
              page === "Events" ? "active" : ""
            }`}
            onClick={() => {
              setSubmitted(false);
              setPage("Events");
            }}
          >
            <span className="sidebar-icon">🎉</span>
            <span className="sidebar-text">Events</span>
          </button>

          {/* ADMIN DASHBOARD BUTTON */}
          <button
            className={`sidebar-item ${
              page === "Admin Dashboard" ? "active" : ""
            }`}
            onClick={() => setPage("Admin Dashboard")}
          >
            <span className="sidebar-icon">🛡️</span>
            <span className="sidebar-text">Admin Dashboard</span>
          </button>

{/* ADMIN DASHBOARD PAGE */}
        {page === "Admin Dashboard" && (
          <main className="dashboard">
            <button
              className="back-btn"
              onClick={() => setPage("dashboard")}
            >
              ← Dashboard
            </button>

            <h1>🛡️ Admin Dashboard</h1>
            <p>Manage event permission applications.</p>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Total Applications</h3>
                <h2>{applications.length}</h2>
              </div>

              <div className="dashboard-card">
                <h3>Pending</h3>
                <h2>
                  {applications.filter(
                    (app) => app.status === "Pending Approval"
                  ).length}
                </h2>
              </div>

              <div className="dashboard-card">
                <h3>Approved</h3>
                <h2>
                  {applications.filter(
                    (app) => app.status === "Approved"
                  ).length}
                </h2>
              </div>
            </div>

            <h2>Event Applications</h2>
            <div className="application-search">
  <span>🔎</span>
  <input
    type="text"
    placeholder="Search student or event name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  {searchTerm && (
    <button onClick={() => setSearchTerm("")}>
      Clear
    </button>
  )}
</div>

            {applications.length === 0 ? (
              <p>No applications yet. Submit an event form first.</p>
            ) : (
              applications.filter((app) => {
    const search = searchTerm.toLowerCase().trim();

    return (
      (app.eventName || "").toLowerCase().includes(search) ||
      (app.studentName || "").toLowerCase().includes(search)
    );
  })
  .map((app) => (
                <div className="permission-form" key={app.id}>
                  <h3>{app.eventName}</h3>
                  <p>Student: {app.studentName}</p>
                  <p>Date: {app.eventDate}</p>
                  <p>Time: {app.eventTime}</p>
                  <p>Venue: {app.venue}</p>
                  <p>Participants: {app.participants}</p>
                  <p> Status:{" "} <span
    className={`status-badge ${
      app.status === "Approved"
        ? "approved"
        : app.status === "Rejected"
        ? "rejected"
        : "pending"
    }`}
  >
    {app.status}
  </span>
</p>

                  {app.status === "Pending Approval" && (
                    <div className="form-buttons">
                      <button
                        className="permission-btn"
                        onClick={() =>
                          setApplications((prev) =>
                            prev.map((item) =>
                              item.id === app.id
                                ? { ...item, status: "Approved" }
                                : item
                            )
                          )
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="back-btn"
                        onClick={() =>
                          setApplications((prev) =>
                            prev.map((item) =>
                              item.id === app.id
                                ? { ...item, status: "Rejected" }
                                : item
                            )
                          )
                        }
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </main>
        )}{/* CAREER SECTION */}
{page === "Career" && (
  <div className="career-page">
    <div className="career-hero">
      <span className="career-tag">MITS GWALIOR • CAREER HUB</span>
      <h1>Build Your Future 🚀</h1>
      <p>
        Explore career opportunities, develop new skills,
        and prepare yourself for internships and placements.
      </p>
    </div>

    <h2>Explore Career Opportunities</h2>
    <p className="career-subtitle">
      Choose a category to start your journey.
    </p>
    <button
  className="career-goal-open-btn"
  onClick={() => setPage("Career Goal Planner")}
>
  🎯 Open Career Goal Planner →
</button>
    <div className="career-grid">
      <div className="career-card">
        <div className="career-icon">💼</div>
        <h3>Internships</h3>
        <p>Explore internships and gain practical experience.</p>
        <button onClick={() => window.open(
          "https://internshala.com/internships/",
          "_blank", "noopener,noreferrer"
        )}>
          Explore Internships →
        </button>
      </div>

      <div className="career-card">
        <div className="career-icon">💻</div>
        <h3>Technical Skills</h3>
        <p>Learn programming, web development and computer science.</p>
        <button onClick={() => window.open(
          "https://www.freecodecamp.org/learn/",
          "_blank", "noopener,noreferrer"
        )}>
          Start Learning →
        </button>
      </div>

      <div className="career-card">
        <div className="career-icon">🧠</div>
        <h3>DSA & Coding</h3>
        <p>Practice problem-solving and strengthen coding fundamentals.</p>
        <button onClick={() => window.open(
          "https://leetcode.com/problemset/",
          "_blank", "noopener,noreferrer"
        )}>
          Practice Coding →
        </button>
      </div>

      <div className="career-card">
        <div className="career-icon">📄</div>
        <h3>Resume Building</h3>
        <p>Prepare a resume highlighting your education and projects.</p>
        <button onClick={() => setPage("Resume Builder")}>
        Build My Resume →
        </button>
        </div>
        
      <div className="career-card">
        <div className="career-icon">🎯</div>
        <h3>Interview Preparation</h3>
        <p>Improve communication, technical knowledge and interview skills.</p>
        <button onClick={() => window.open(
          "https://www.geeksforgeeks.org/interview-preparation/",
          "_blank", "noopener,noreferrer"
        )}>
          Prepare Now →
        </button>
      </div>

      <div className="career-card">
        <div className="career-icon">🏆</div>
        <h3>Government Careers</h3>
        <p>Explore government exams and official recruitment information.</p>
        <button onClick={() => window.open(
          "https://ssc.gov.in/",
          "_blank", "noopener,noreferrer"
        )}>
          Explore Exams →
        </button>
      </div>
    </div>

    <div className="career-tip">
      <h3>💡 Your Career Tip</h3>
      <p>
        As a first-year CSD student, focus on C programming,
        problem-solving, communication skills and small projects.
        Build your fundamentals before moving to advanced topics.
      </p>
    </div>
  </div>
)}

{/* PERSONALIZED CAREER ROADMAP */}
{page === "Career" && (
<section className="career-roadmap">
  <div className="roadmap-heading">
    <span className="roadmap-label">YOUR LEARNING JOURNEY</span>
    <h2>🎯 Personalized Career Roadmap</h2>
    <p>
      A step-by-step roadmap for your B.Tech Computer Science
      and Design journey.
    </p>
  </div>

  <div className="roadmap-timeline">
    <div className="roadmap-step">
      <div className="roadmap-number">01</div>
      <div className="roadmap-content">
        <span className="roadmap-status">CURRENT PRIORITY</span>
        <h3>Semester 1 — Build Your Foundation</h3>
        <p>Understand programming and strengthen your fundamentals.</p>
        <ul>
          <li>C programming: variables, conditions and loops</li>
          <li>Linear Algebra and Digital Circuit Design</li>
          <li>Learn Git and GitHub basics</li>
          <li>Mini project: Student Marks Calculator in C</li>
        </ul>
        <details>
          <summary>View learning targets</summary>
          <p>
            Write small C programs regularly, practise debugging,
            and upload your first mini project to GitHub.
          </p>
        </details>
      </div>
    </div>

    <div className="roadmap-step">
      <div className="roadmap-number">02</div>
      <div className="roadmap-content">
        <h3>Semester 2 — Explore Development</h3>
        <p>Start building practical projects.</p>
        <ul>
          <li>Strengthen C and learn basic data structures</li>
          <li>Learn HTML, CSS and JavaScript</li>
          <li>Understand GitHub repositories</li>
          <li>Project: Personal Portfolio Website</li>
        </ul>
        <details>
          <summary>View learning targets</summary>
          <p>
            Build a responsive portfolio and document your
            learning and projects.
          </p>
        </details>
      </div>
    </div>

    <div className="roadmap-step">
      <div className="roadmap-number">03</div>
      <div className="roadmap-content">
        <h3>Second Year — Develop Core Skills</h3>
        <p>Build problem-solving ability and technical depth.</p>
        <ul>
          <li>Data Structures and Algorithms (DSA)</li>
          <li>Object-oriented programming and databases</li>
          <li>Explore UI/UX and design tools</li>
          <li>Build one substantial team project</li>
        </ul>
        <details>
          <summary>View learning targets</summary>
          <p>
            Practise coding problems consistently and explore
            different technology career paths.
          </p>
        </details>
      </div>
    </div>

    <div className="roadmap-step">
      <div className="roadmap-number">04</div>
      <div className="roadmap-content">
        <h3>Third Year — Prepare for Opportunities</h3>
        <p>Apply your skills to real-world problems.</p>
        <ul>
          <li>Build strong projects and a technical portfolio</li>
          <li>Practise aptitude and interview questions</li>
          <li>Apply for relevant internships</li>
          <li>Improve communication and teamwork</li>
        </ul>
        <details>
          <summary>View learning targets</summary>
          <p>
            Tailor your resume to each opportunity and practise
            explaining your projects clearly.
          </p>
        </details>
      </div>
    </div>

    <div className="roadmap-step">
      <div className="roadmap-number">05</div>
      <div className="roadmap-content">
        <h3>Fourth Year — Placement & Career</h3>
        <p>Prepare for graduation and your next step.</p>
        <ul>
          <li>Revise DSA, core CS concepts and aptitude</li>
          <li>Practise technical and HR interviews</li>
          <li>Apply through verified placement channels</li>
          <li>Explore jobs, higher studies or other goals</li>
        </ul>
        <details>
          <summary>View learning targets</summary>
          <p>
            Track applications, prepare for interviews and
            review your long-term career goals.
          </p>
        </details>
      </div>
    </div>
  </div>

  <div className="roadmap-note">
    <strong>💡 Remember:</strong>
    <p>
      This is a suggested roadmap, not a fixed college syllabus.
      Follow your official MITS curriculum first and adapt the
      learning targets to your interests and available time.
    </p>
  </div>
</section>
)}
{/* SKILLS PROGRESS TRACKER */}
{page === "Career" && (
<section className="skills-tracker">
  <div className="skills-tracker-header">
    <div>
      <span className="roadmap-label">TRACK YOUR GROWTH</span>
      <h2>📈 Skills Progress Tracker</h2>
      <p>Mark a skill complete when you have practised it.</p>
    </div>

    <div className="progress-percentage">
      {skillProgress}%
    </div>
  </div>

  <div
    className="progress-track"
    role="progressbar"
    aria-valuenow={skillProgress}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label="Skills completion"
  >
    <div
      className="progress-fill"
      style={{ width: `${skillProgress}%` }}
    />
  </div>

  <p className="progress-caption">
    {completedSkills.length} of {skillList.length} skills completed
  </p>

  <div className="skills-list">
    {skillList.map((skill) => (
      <label className="skill-row" key={skill}>
        <input
          type="checkbox"
          checked={completedSkills.includes(skill)}
          onChange={(e) => {
            setCompletedSkills((prev) =>
              e.target.checked
                ? [...prev, skill]
                : prev.filter((item) => item !== skill)
            );
          }}
        />

        <span>{skill}</span>

        {completedSkills.includes(skill) && (
          <span className="skill-done">Completed ✓</span>
        )}
      </label>
    ))}
  </div>

  <button
    className="reset-skills-btn"
    onClick={() => {
      if (window.confirm("Reset all skill progress?")) {
        setCompletedSkills([]);
      }
    }}
  >
    Reset Progress
  </button>
</section>
)}
{/* CAREER GOAL PLANNER */}
{page === "Career Goal Planner" && (
  <main className="goal-planner-page">
    <button
      className="back-btn"
      onClick={() => setPage("Career")}
    >
      ← Back to Career
    </button>

    <div className="goal-planner-heading">
      <span className="career-tag">CAREER HUB • GOAL TRACKER</span>
      <h1>🎯 Career Goal Planner</h1>
      <p>Set your goals, choose deadlines and track your progress.</p>
    </div>

    {/* ADD GOAL FORM */}
    <section className="goal-form-card">
      <h2>＋ Create a New Goal</h2>

      <label>Goal Name</label>
      <input
        type="text"
        placeholder="e.g. Complete C Programming Basics"
        value={goalForm.title}
        onChange={(e) => updateGoalForm("title", e.target.value)}
      />

      <label>Goal Category</label>
      <select
        value={goalForm.category}
        onChange={(e) => updateGoalForm("category", e.target.value)}
      >
        <option>Technical Skills</option>
        <option>DSA & Coding</option>
        <option>College Academics</option>
        <option>Internship</option>
        <option>Projects</option>
        <option>Interview Preparation</option>
        <option>Other</option>
      </select>

      <label>Target Date</label>
      <input
        type="date"
        min={new Date().toLocaleDateString("en-CA")}
        value={goalForm.targetDate}
        onChange={(e) => updateGoalForm("targetDate", e.target.value)}
      />

      <label>Priority</label>
      <select
        value={goalForm.priority}
        onChange={(e) => updateGoalForm("priority", e.target.value)}
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <button
        className="goal-add-btn"
        onClick={addCareerGoal}
      >
        + Add Goal
      </button>
    </section>

    {/* GOAL SUMMARY */}
    <div className="goal-stats-grid">
      <div className="goal-stat-card">
        <span>Total Goals</span>
        <strong>{careerGoals.length}</strong>
      </div>

      <div className="goal-stat-card">
        <span>In Progress</span>
        <strong>
          {careerGoals.filter(
            (goal) => !goal.completed
          ).length}
        </strong>
      </div>

      <div className="goal-stat-card">
        <span>Completed</span>
        <strong>
          {careerGoals.filter(
            (goal) => goal.completed
          ).length}
        </strong>
      </div>
    </div>

    {/* GOAL LIST */}
    <section className="goal-list-section">
      <h2>My Career Goals</h2>

      {careerGoals.length === 0 ? (
        <div className="goal-empty-state">
          <span>📝</span>
          <h3>No goals added yet</h3>
          <p>Create your first goal using the form above.</p>
        </div>
      ) : (
        <div className="goal-list">
          {careerGoals.map((goal) => (
            <article className="goal-card" key={goal.id}>
              <div className="goal-card-top">
                <div>
                  <span className="goal-category">
                    {goal.category}
                  </span>
                  <h3>{goal.title}</h3>
                </div>

                <span
                  className={`goal-priority ${
                    goal.priority.toLowerCase()
                  }`}
                >
                  {goal.priority} Priority
                </span>
              </div>

              <p className="goal-date">
                📅 Target: {goal.targetDate}
              </p>

              <div className="goal-progress-heading">
                <span>Progress</span>
                <strong>
                  {goal.completed ? 100 : goal.progress}%
                </strong>
              </div>

              <div className="goal-progress-track">
                <div
                  className="goal-progress-fill"
                  style={{
                    width: `${
                      goal.completed ? 100 : goal.progress
                    }%`,
                  }}
                />
              </div>

              {!goal.completed && (
                <div className="goal-progress-controls">
                  <label>
                    Update progress
                    <select
                      value={goal.progress}
                      onChange={(e) => {
                        const progress = Number(e.target.value);

                        setCareerGoals((prev) =>
                          prev.map((item) =>
                            item.id === goal.id
                              ? { ...item, progress }
                              : item
                          )
                        );
                      }}
                    >
                      <option value={0}>0%</option>
                      <option value={25}>25%</option>
                      <option value={50}>50%</option>
                      <option value={75}>75%</option>
                    </select>
                  </label>
                </div>
              )}

              <div className="goal-card-actions">
                <button
                  className="goal-complete-btn"
                  onClick={() =>
                    setCareerGoals((prev) =>
                      prev.map((item) =>
                        item.id === goal.id
                          ? {
                              ...item,
                              completed: !item.completed,
                              progress: item.completed
                                ? 0
                                : 100,
                            }
                          : item
                      )
                    )
                  }
                >
                  {goal.completed
                    ? "↩ Reopen Goal"
                    : "✓ Mark Completed"}
                </button>

                <button
                  className="goal-delete-btn"
                  onClick={() => {
                    if (window.confirm("Delete this goal?")) {
                      setCareerGoals((prev) =>
                        prev.filter((item) => item.id !== goal.id)
                      );
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  </main>
)}
{page === "Resume Builder" && (
  <main className="resume-builder">
    <button
      className="back-btn"
      onClick={() => setPage("Career")}
    >
      ← Back to Career
    </button>

    <h1>📄 Professional Resume Builder</h1>
    <p>Create your resume for internships and jobs.</p>

    <div className="resume-form">
      <h2>Personal Information</h2>

      <label>Full Name</label>
      <input
        id="resume-name"
        type="text"
        placeholder="Enter your full name"
      />

      <label>Course and Branch</label>
      <input
        id="resume-course"
        type="text"
        placeholder="B.Tech Computer Science and Design"
      />

      <label>Email Address</label>
      <input
        id="resume-email"
        type="email"
        placeholder="Enter your email"
      />

      <label>Phone Number</label>
      <input
        id="resume-phone"
        type="tel"
        placeholder="Enter your phone number"
      />

      <label>Career Objective</label>
      <textarea
        id="resume-objective"
        placeholder="Write a short introduction about your career goals"
      />

      <label>Education</label>
      <textarea
        id="resume-education"
        placeholder="College, course, year, Class 12 details"
      />

      <label>Technical Skills</label>
      <textarea
        id="resume-skills"
        placeholder="C Programming, HTML, CSS, JavaScript..."
      />

      <label>Projects</label>
      <textarea
        id="resume-projects"
        placeholder="Project name and a short description"
      />

      <label>Certifications / Achievements</label>
      <textarea
        id="resume-achievements"
        placeholder="Add your certifications or achievements"
      />

      <button
        className="permission-btn"
        onClick={() => {
          const fields = [
            ["resume-name", "Full Name"],
            ["resume-course", "Course"],
            ["resume-email", "Email"],
            ["resume-phone", "Phone"],
            ["resume-objective", "Career Objective"],
            ["resume-education", "Education"],
            ["resume-skills", "Technical Skills"],
            ["resume-projects", "Projects"],
            ["resume-achievements", "Achievements"],
          ];

          const emptyField = fields.find(
            ([id]) => !document.getElementById(id)?.value.trim()
          );

          if (emptyField) {
            alert("Please fill in: " + emptyField[1]);
            return;
          }

          const getValue = (id) =>
            document.getElementById(id).value.trim();

          const resumeWindow = window.open("", "_blank");

          if (!resumeWindow) {
            alert("Please allow pop-ups to preview your resume.");
            return;
          }

          const escapeHTML = (value) =>
            value.replace(/[&<>"']/g, (char) => ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[char]);

          const section = (heading, value) => `
            <section>
              <h2>${heading}</h2>
              <p>${escapeHTML(value).replace(/\n/g, "<br>")}</p>
            </section>
          `;

          resumeWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>My Resume</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  font-family: Arial, sans-serif;
                  max-width: 800px;
                  margin: 30px auto;
                  padding: 25px;
                  color: #222;
                  line-height: 1.6;
                }
                header {
                  border-bottom: 3px solid #234b85;
                  padding-bottom: 12px;
                }
                h1 { color: #234b85; margin-bottom: 5px; }
                h2 {
                  color: #234b85;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 4px;
                  font-size: 18px;
                }
                section { margin-top: 20px; }
                p { overflow-wrap: anywhere; }
                @media print {
                  body { margin: 0; padding: 15px; }
                  button { display: none; }
                }
              </style>
            </head>
            <body>
              <header>
                <h1>${escapeHTML(getValue("resume-name"))}</h1>
                <p>${escapeHTML(getValue("resume-course"))}</p>
                <p>${escapeHTML(getValue("resume-email"))} |
                   ${escapeHTML(getValue("resume-phone"))}</p>
              </header>
              ${section("Career Objective", getValue("resume-objective"))}
              ${section("Education", getValue("resume-education"))}
              ${section("Technical Skills", getValue("resume-skills"))}
              ${section("Projects", getValue("resume-projects"))}
              ${section("Certifications & Achievements", getValue("resume-achievements"))}
              <button onclick="window.print()">Print / Save as PDF</button>
            </body>
            </html>
          `);

          resumeWindow.document.close();
        }}
      >
        Generate Resume
      </button>
    </div>
  </main>
)}

{/* SETTINGS PAGE */}
{page === "Settings" && (
  <main className="settings-page">

    <button
      className="back-btn"
      onClick={() => setPage("dashboard")}
    >
      ← Dashboard
    </button>

    <div className="settings-heading">
      <span>ACCOUNT PREFERENCES</span>
      <h1>⚙️ Settings</h1>
      <p>Manage your Campus Companion experience.</p>
    </div>

    {/* ACCOUNT INFORMATION */}
    <section className="settings-card">
      <div className="settings-card-heading">
        <span>👤</span>
        <div>
          <h2>Account Information</h2>
          <p>Your registered student details</p>
        </div>
      </div>

      <div className="settings-info-grid">
        <div>
          <small>Student Name</small>
          <strong>{studentProfile?.name || studentName || "Student"}</strong>
        </div>

        <div>
          <small>Email Address</small>
          <strong>{studentProfile?.email || auth.currentUser?.email || "Not available"}</strong>
        </div>

        <div>
          <small>Roll Number</small>
          <strong>{studentProfile?.rollNumber || "Not available"}</strong>
        </div>

        <div>
          <small>Branch</small>
          <strong>{studentProfile?.branch || "Not available"}</strong>
        </div>

        <div>
          <small>Semester</small>
          <strong>{studentProfile?.semester || "Not available"}</strong>
        </div>
      </div>

      <p className="settings-note">
        To update your personal details, visit the Profile page.
      </p>

      <button
        className="settings-action-btn"
        onClick={() => setPage("Profile")}
      >
        View Profile →
      </button>
    </section>

    {/* NOTIFICATION SETTINGS */}
    <section className="settings-card">
      <div className="settings-card-heading">
        <span>🔔</span>
        <div>
          <h2>Notification Preferences</h2>
          <p>Choose the updates you want to receive</p>
        </div>
      </div>

      <div className="settings-option">
        <div>
          <strong>Event Notifications</strong>
          <p>Updates about college events</p>
        </div>
        <label className="settings-switch">
          <input
            type="checkbox"
            checked={notifications.events}
            onChange={() => updateNotification("events")}
          />
          <span className="settings-slider"></span>
        </label>
      </div>

      <div className="settings-option">
        <div>
          <strong>College Notices</strong>
          <p>Important academic and college notices</p>
        </div>
        <label className="settings-switch">
          <input
            type="checkbox"
            checked={notifications.notices}
            onChange={() => updateNotification("notices")}
          />
          <span className="settings-slider"></span>
        </label>
      </div>

      <div className="settings-option">
        <div>
          <strong>Announcements</strong>
          <p>General campus announcements</p>
        </div>
        <label className="settings-switch">
          <input
            type="checkbox"
            checked={notifications.announcements}
            onChange={() => updateNotification("announcements")}
          />
          <span className="settings-slider"></span>
        </label>
      </div>

      <p className="settings-note">
        These preferences are saved in this browser.
        They do not yet send real push notifications.
      </p>
    </section>

    {/* APPEARANCE */}
    <section className="settings-card">
      <div className="settings-card-heading">
        <span>🎨</span>
        <div>
          <h2>Appearance</h2>
          <p>Customize how Campus Companion looks</p>
        </div>
      </div>

      <div className="theme-options">
        <button
          className={`theme-choice ${theme === "light" ? "selected" : ""}`}
          onClick={() => setTheme("light")}
        >
          ☀️ Light Mode
          {theme === "light" && <span>✓ Selected</span>}
        </button>

        <button
          className={`theme-choice ${theme === "dark" ? "selected" : ""}`}
          onClick={() => setTheme("dark")}
        >
          🌙 Dark Mode
          {theme === "dark" && <span>✓ Selected</span>}
        </button>
      </div>
    </section>

    {/* PRIVACY AND SECURITY */}
    <section className="settings-card">
      <div className="settings-card-heading">
        <span>🔐</span>
        <div>
          <h2>Privacy & Security</h2>
          <p>Information about your account security</p>
        </div>
      </div>

      <div className="security-info">
        <strong>Firebase Authentication</strong>
        <p>Your account is managed through Firebase Authentication.</p>
      </div>

      <div className="security-info">
        <strong>Account Status</strong>
        <p>● Logged in</p>
      </div>
    </section>

    {/* LOGOUT */}
    <section className="settings-card settings-logout-card">
      <div>
        <h2>🚪 Sign Out</h2>
        <p>Sign out of your Campus Companion account.</p>
      </div>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        Logout
      </button>
    </section>

    <p className="settings-footer">
      Campus Companion • MITS Gwalior
    </p>

  </main>
)}

{/* AI ASSISTANT PAGE */}
{page === "AI Assistant" && (
  <main className="ai-assistant-page">

    <button
      className="back-btn"
      onClick={() => setPage("dashboard")}
    >
      ← Dashboard
    </button>

    <div className="ai-header">
      <div className="ai-avatar">🤖</div>
      <div>
        <h1>CampusBot AI</h1>
        <p>Your smart campus companion</p>
        <span className="ai-status">● Ready to help</span>
      </div>
    </div>

    <div className="ai-chat-container">

      <div className="ai-welcome">
        <h2>Hello, {studentName || "Student"}! 👋</h2>
        <p>
          I'm CampusBot AI. Ask me anything about your
          college, academics, events and campus life.
        </p>
      </div>

      <div className="ai-suggestions">
        <p>Try asking:</p>

        {[
          "Tell me about MITS Gwalior",
          "How can I join college clubs?",
          "Where can I find my timetable?",
          "Give me some study tips",
        ].map((question) => (
          <button
            key={question}
            onClick={() => setChatInput(question)}
          >
            {question} →
          </button>
        ))}
      </div>

      <div className="ai-messages">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.sender}`}
          >
            <span>
              {message.sender === "bot" ? "🤖" : "👤"}
            </span>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
        {isTyping && (
  <div className="typing-indicator">
    🤖 CampusBot is typing...
  </div>
)}
      <div className="ai-input-area">
        <input
          type="text"
          placeholder="Ask CampusBot anything..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendChatMessage();
          }}
        />

        <button onClick={sendChatMessage}>
          ➤
        </button>
      </div>

      <p className="ai-disclaimer">
        CampusBot AI • AI responses will be connected in the next step.
      </p>

    </div>
  </main>
)}

        {/* OTHER FEATURES */}
{page !== "home" &&
  page !== "dashboard" &&
  page !== "Campus Map" &&
  page !== "Events" && 
  page !== "Admin Dashboard" &&
   page !== "Career Goal Planner" &&
    page !== "Resume Builder" &&
page !== "Profile" &&
page !== "Settings" &&
page !== "AI Assistant" && (

    <main className="dashboard">

      <button
        className="back-btn"
        onClick={() => setPage("dashboard")}
      >
        ← Dashboard
      </button>

      <h1>{page}</h1>

      <p>
        This section will be developed next.
      </p>

    </main>
)}

{/* STUDENT PROFILE */}
{page === "Profile" && (
  <main className="profile-page">

    <button
      className="back-btn"
      onClick={() => setPage("dashboard")}
    >
      ← Dashboard
    </button>

    <div className="profile-heading">
      <span>MY ACCOUNT</span>
      <h1>Student Profile</h1>
      <p>Manage your personal and academic information.</p>
    </div>
  <div className="logout-section">
  <button
    className="logout-btn"
    onClick={handleLogout}
  >
    🚪 Logout
  </button>
</div>
    {studentProfile ? (
      <div className="profile-card-new">

        <div className="profile-cover"></div>

        <div className="profile-photo-section">
      <div className="profile-photo">
  {studentProfile.photoURL ? (
    <img
      src={studentProfile.photoURL}
      alt="Student Profile"
    />
  ) : (
    <span>👤</span>
  )}
</div>

<input
  type="file"
  id="profile-camera-input"
  accept="image/*"
  hidden
  onChange={handleProfilePhoto}
/>

<button
  className="camera-btn"
  disabled={photoUploading}
  onClick={() =>
    document.getElementById("profile-camera-input").click()
  }
>
  {photoUploading ? "Uploading..." : "📷 Change Profile Photo"}
</button>
         

          <h2>{studentProfile.name || studentName}</h2>
          <p className="profile-branch">
            {studentProfile.branch || "B.Tech Student"}
          </p>

          <span className="profile-status">
            ● Student Account
          </span>

        </div>

        <div className="profile-details">
       

          <h3>Personal Information</h3>

          <div className="profile-info-grid">

            <div className="profile-info-item">
              <span>✉️ Email Address</span>
              <strong>{studentProfile.email || "Not available"}</strong>
            </div>

            <div className="profile-info-item">
              <span>🎓 Roll Number</span>
              <strong>{studentProfile.rollNumber || "Not available"}</strong>
            </div>

            <div className="profile-info-item">
              <span>🏫 Branch</span>
              <strong>{studentProfile.branch || "Not available"}</strong>
            </div>

            <div className="profile-info-item">
              <span>📚 Semester</span>
              <strong>{studentProfile.semester || "Not available"}</strong>
            </div>

          </div>
        </div>

      </div>
    ) : (
      <p>Loading student profile...</p>
    )}

  </main>
)}

      </div>

    </div>
  );
}

export default App;
