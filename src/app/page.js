"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import DatePicker from "react-datepicker";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { startOfMonth, endOfMonth } from "date-fns";
import AddEventModal from "./Components/AddEventModal";
import UpdateEventModal from "./Components/UpdateEventModal";
import { Modal } from "react-bootstrap";
import { useMemo } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);
import useUserPlan from "./hooks/useUserPlan";
import useSearchStore from "./store/searchStore"; // adjust as needed
import config from "./config/config";
import BasicPlanNotice from "./Components/BasicPlanNotice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RenewalNotice from "./Components/RenewalNotice";

const normalize = (str) => str?.trim().toLowerCase();

const bootstrapColors = [
  "warning",
  "info",
  "success",
  "danger",
  "primary",
  "secondary",
  "dark",
];

export default function Home() {
  const [showRenewalModal, setShowRenewalModal] = useState(false);

  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleCloseBasicModal = () => {
    setShowBasicModal(false);
    localStorage.setItem("basic_plan_notice_last_shown", Date.now().toString());
  };
  const [assignmentColorMap, setAssignmentColorMap] = useState(new Map());

  const { searchTerm } = useSearchStore();

  const planInfo = useUserPlan();

  const getExpiryMessage = () => {
    if (!planInfo?.endDate) return null;
    const end = new Date(planInfo.endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24)); // days
    if (diff <= 5) {
      return `⚠️ Your plan expires in ${diff} day${diff !== 1 ? "s" : ""}`;
    }
    return null;
  };

  const isBasicPlan = planInfo?.planName?.toLowerCase() === "basic";
  const isProfessionalPlan =
    planInfo?.planName?.toLowerCase() === "professional";

  const [showBasicModal, setShowBasicModal] = useState(false);

  useEffect(() => {
    if (isBasicPlan) {
      const lastShown = localStorage.getItem("basic_plan_notice_last_shown");
      const now = Date.now();

      const TEN_MINUTES = 10 * 60 * 1000;

      if (!lastShown || now - parseInt(lastShown, 10) > TEN_MINUTES) {
        setShowBasicModal(true);
      }
    }
  }, [isBasicPlan]);

  useEffect(() => {
    if (!planInfo?.endDate || isBasicPlan) return;

    const checkRenewalWindow = () => {
      const expiry = new Date(planInfo.endDate);
      const now = new Date();
      const diffDays = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

      const shouldShow = diffDays <= 15 && diffDays >= -15;

      if (shouldShow) {
        const lastShown = localStorage.getItem("renewal_notice_last_shown");
        const nowTime = Date.now();
        const FIVE_MINUTES = 5 * 60 * 1000;

        if (!lastShown || nowTime - parseInt(lastShown, 10) > FIVE_MINUTES) {
          setShowRenewalModal(true);
          localStorage.setItem("renewal_notice_last_shown", nowTime.toString());
        }
      }
    };

    checkRenewalWindow(); // Initial check
    const interval = setInterval(checkRenewalWindow, 5 * 60 * 1000); // Every 5 min

    return () => clearInterval(interval); // Cleanup
  }, [planInfo?.endDate, isBasicPlan]);

  const showFeedbackMessage = () => {
    if (!planInfo || !planInfo.planName || !planInfo.endDate) return false;

    const now = new Date();
    const end = new Date(planInfo.endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    const isBasic = planInfo.planName.toLowerCase() === "basic";
    const isProfessional = planInfo.planName.toLowerCase() === "professional";

    return isProfessional && diff > 5;
  };

  const [selectedCard, setSelectedCard] = useState(null); // 'total', 'received', 'due', etc.
  const [showListModal, setShowListModal] = useState(false);

  const handleCardClick = (type) => {
    setSelectedCard(type);
    setShowListModal(true);
  };

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [preFilledDate, setPreFilledDate] = useState(null);

  const [showAddEventModal, setShowAddEventModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const calendarRef = useRef();

  const [calendarEvents, setCalendarEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [assignmentFilters, setAssignmentFilters] = useState({});

  const handleMonthChange = (date) => {
    console.log(
      "New month displayed:",
      date.getMonth() + 1,
      date.getFullYear()
    );

    setSelectedDate(date);

    const calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(date);

    fetchOrders(date);
  };

  useEffect(() => {
    const matchesSearch = (event) => {
      const e = event.extendedProps || {};
      const text = (searchTerm || "").toLowerCase();

      if (!text) return true;

      return (
        (event.title || "").toLowerCase().includes(text) ||
        (e.customerName || "").toLowerCase().includes(text) ||
        (e.customerMobile || "").toLowerCase().includes(text) ||
        (e.customerEmail || "").toLowerCase().includes(text) ||
        (e.customerAddress || "").toLowerCase().includes(text) ||
        (e.assignmentAddress || "").toLowerCase().includes(text) ||
        (e.assignmentName || "").toLowerCase().includes(text) ||
        (e.assignmentNote || "").toLowerCase().includes(text) ||
        (e.assignToName || "").toLowerCase().includes(text) ||
        (e.assignToHandle || "").toLowerCase().includes(text) ||
        (e.contactPerson1Mobile || "").toLowerCase().includes(text) ||
        (e.contactPerson2Mobile || "").toLowerCase().includes(text) ||
        (e.functions || []).some((f) =>
          (f.functionName || "").toLowerCase().includes(text)
        ) ||
        (e.transactions || []).some((t) =>
          (t.paymentNote || "").toLowerCase().includes(text)
        )
      );
    };

    const activeNormalizedNames = Object.keys(assignmentFilters)
      .filter((key) => assignmentFilters[key])
      .map((name) => normalize(name));

    const filtered = allEvents.filter(
      (ev) =>
        activeNormalizedNames.includes(normalize(ev.title)) &&
        (!searchTerm || matchesSearch(ev))
    );

    setCalendarEvents(filtered);
  }, [assignmentFilters, allEvents, searchTerm]);

  const fetchOrders = async (date) => {
    const startDate = startOfMonth(date).getTime();
    const endDate = endOfMonth(date).getTime();

    const tokenObj = JSON.parse(localStorage.getItem("camrilla_token"));
    const accessToken = tokenObj?.accessToken;

    if (!accessToken) {
      console.error("No access token found in localStorage");
      return;
    }

    try {
      const response = await axios.get(`${config.BASE_URL}order/assignment`, {
        params: {
          startDate,
          endDate,
        },
      });

      if (response.data.code === 0 && response.data.message === "Success") {
        console.log(response.data.data);

        const nameMap = new Map();
        let index = 0;

        response.data.data.forEach((item) => {
          const rawName = item.assignmentName?.trim() || "No Title";
          const normalized = normalize(rawName);
          if (!nameMap.has(normalized)) {
            nameMap.set(normalized, {
              original: rawName,
              color: bootstrapColors[index % bootstrapColors.length],
            });
            index++;
          }
        });

        const mappedEvents = response.data.data.map((item) => {
          const rawName = item.assignmentName?.trim() || "No Title";
          const normalized = normalize(rawName);
          const color = nameMap.get(normalized)?.color || "secondary";

          return {
            id: item.id,
            title: rawName,
            start: new Date(item.assignmentDateTime),
            end: new Date(item.assignmentDateTime),
            backgroundColor: `var(--bs-${color})`,
            borderColor: `var(--bs-${color})`,
            textColor: "#fff",
            extendedProps: {
              ...item,
            },
          };
        });

        setAllEvents(mappedEvents); // store full list
        setCalendarEvents(mappedEvents); // show all events initially

        mappedEvents.forEach((event) => {
          const rawName = event.title?.trim();
          if (!rawName) return;

          const normalized = normalize(rawName);
          if (!nameMap.has(normalized)) {
            nameMap.set(normalized, {
              original: rawName,
              color: bootstrapColors[index % bootstrapColors.length],
            });
            index++;
          }
        });

        const filterMap = {};
        nameMap.forEach((val, key) => {
          filterMap[val.original] = true;
        });

        setAssignmentFilters(filterMap); // 👈 Update filters
        setAssignmentColorMap(nameMap); // 👈 New state (see next step)
        setAllEvents(mappedEvents);
        setCalendarEvents(mappedEvents);
      } else {
        console.warn("API response was not successful:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders(selectedDate);
  }, []);

  const { totalAssignments, totalPayment, duePayment, receivedPayment } =
    useMemo(() => {
      const totalAssignments = allEvents.length;

      let totalPayment = 0;
      let duePayment = 0;
      let receivedPayment = 0;

      allEvents.forEach((event) => {
        const assignment = event.extendedProps || {};
        const totalAmount = assignment.totalAmount || 0;
        const transactions = assignment.transactions || [];

        const receivedSum = transactions.reduce(
          (sum, t) => sum + (t.receivedPayment || 0),
          0
        );

        totalPayment += totalAmount;
        receivedPayment += receivedSum;
        duePayment += Math.max(totalAmount - receivedSum, 0);
      });

      return { totalAssignments, totalPayment, duePayment, receivedPayment };
    }, [allEvents]);

  const filteredAssignments = useMemo(() => {
    return allEvents.filter((event) => {
      const assignment = event.extendedProps;
      const totalAmount = assignment?.totalAmount || 0;
      const transactions = assignment?.transactions || [];
      const received = transactions.reduce(
        (sum, t) => sum + (t.receivedPayment || 0),
        0
      );

      if (selectedCard === "total") return true;
      if (selectedCard === "received") return received > 0;
      if (selectedCard === "due") return totalAmount - received > 0;
      if (selectedCard === "payment") return totalAmount > 0; // ✅ include all paid assignments
      return false;
    });
  }, [selectedCard, allEvents]);

  const {
    assignmentsCount,
    totalPaymentSum,
    totalDueAmount,
    totalReceivedAmount,
    assignmentGrowthPercent,
    paymentGrowthPercent,
    dueGrowthPercent,
    receivedGrowthPercent,
  } = useMemo(() => {
    const thisMonthStart = dayjs().startOf("month");
    const lastMonthStart = dayjs().subtract(1, "month").startOf("month");
    const lastMonthEnd = thisMonthStart;

    let totalPayment = 0;
    let duePayment = 0;
    let receivedPayment = 0;

    let lastMonthTotal = 0;
    let thisMonthTotal = 0;

    let lastMonthReceived = 0;
    let thisMonthReceived = 0;

    let lastMonthDue = 0;
    let thisMonthDue = 0;

    let lastMonthPayment = 0;
    let thisMonthPayment = 0;

    const assignmentsCount = allEvents.length;

    allEvents.forEach((event) => {
      const assignment = event.extendedProps || {};
      const totalAmount = assignment.totalAmount || 0;
      const transactions = assignment.transactions || [];
      const assignmentDate = dayjs(assignment.assignmentDateTime);

      const received = transactions.reduce(
        (sum, t) => sum + (t.receivedPayment || 0),
        0
      );
      const due = Math.max(totalAmount - received, 0);

      totalPayment += totalAmount;
      receivedPayment += received;
      duePayment += due;

      if (assignmentDate.isBetween(lastMonthStart, lastMonthEnd, null, "[)")) {
        lastMonthTotal += 1;
        lastMonthReceived += received;
        lastMonthDue += due;
        lastMonthPayment += totalAmount;
      }

      if (assignmentDate.isAfter(thisMonthStart)) {
        thisMonthTotal += 1;
        thisMonthReceived += received;
        thisMonthDue += due;
        thisMonthPayment += totalAmount;
      }
    });

    const calcPercent = (thisVal, lastVal) => {
      if (lastVal === 0) return 0;
      return +(((thisVal - lastVal) / lastVal) * 100).toFixed(1);
    };

    return {
      assignmentsCount,
      totalPaymentSum: totalPayment,
      totalDueAmount: duePayment,
      totalReceivedAmount: receivedPayment,
      assignmentGrowthPercent: calcPercent(thisMonthTotal, lastMonthTotal),
      paymentGrowthPercent: calcPercent(thisMonthPayment, lastMonthPayment),
      dueGrowthPercent: calcPercent(thisMonthDue, lastMonthDue),
      receivedGrowthPercent: calcPercent(thisMonthReceived, lastMonthReceived),
    };
  }, [allEvents]);

  const hasAssignmentOnDate = (date) => {
    return allEvents.some((a) => {
      const aDate = new Date(a.start);
      return (
        aDate.getFullYear() === date.getFullYear() &&
        aDate.getMonth() === date.getMonth() &&
        aDate.getDate() === date.getDate()
      );
    });
  };

  useEffect(() => {
    const tokenData = JSON.parse(localStorage.getItem("camrilla_token"));
    if (!tokenData?.accessToken) {
      router.replace("/Login");
    } else {
      setIsAuthenticated(true);
    }
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.2rem",
          fontWeight: "500",
        }}
      >
        Loading...
      </div>
    ); // Don't render anything yet
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.2rem",
          fontWeight: "500",
        }}
      >
        Redirecting to login...
      </div>
    ); // Prevent even a single frame of UI before redirect
  }

  const formattedMonth = selectedDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {isBasicPlan && (
        <BasicPlanNotice
          show={showBasicModal}
          handleClose={handleCloseBasicModal}
        />
      )}

      {!isBasicPlan && (
        <RenewalNotice
          show={showRenewalModal}
          handleClose={() => setShowRenewalModal(false)}
        />
      )}

      <div className="container-xxl flex-grow-1 container-p-y">
        {/* Expiry message */}
        {!isBasicPlan && getExpiryMessage() && (
          <div
            className="alert alert-warning text-center py-2 mb-0"
            role="alert"
          >
            {getExpiryMessage()}
          </div>
        )}

        {/* Motivational subscribe message */}
        {isBasicPlan && (
          <div className="alert alert-info text-center py-2 mb-0" role="alert">
            🚀 Unlock the full potential of Camrilla –{" "}
            <Link
              href="/Subscriptions"
              className="text-decoration-underline fw-bold"
            >
              Upgrade to PRO now
            </Link>{" "}
            and elevate your business!
          </div>
        )}

        {showFeedbackMessage() && (
          <div
            className="alert alert-success text-center py-2 mb-0"
            role="alert"
          >
            🌟 Enjoying Camrilla Pro? We would love your feedback!{" "}
            <Link href="/Feedback" className="text-decoration-underline fw-bold">
              Write to us
            </Link>
            .
          </div>
        )}

        {selectedDate && (
          <div
            className="text-center fw-bold my-5"
            style={{ fontSize: "1.2rem" }}
          >
            📅 Showing Assignments & Statistics for: {formattedMonth}
          </div>
        )}

        <div className="row g-6 ">
          <div
            className="col-sm-6 col-lg-3"
            onClick={() => handleCardClick("total")}
          >
            <div className="card card-border-shadow-primary h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-primary">
                      <i className="ri-briefcase-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{totalAssignments}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Total assignment</h6>
                {/* <p className="mb-0">
                  <span className="me-1 fw-medium">
                    {assignmentGrowthPercent}%
                  </span>
                  <small className="text-muted">than last month</small>
                </p> */}
              </div>
            </div>
          </div>
          <div
            className="col-sm-6 col-lg-3"
            onClick={() => handleCardClick("payment")}
          >
            <div className="card card-border-shadow-warning h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-warning">
                      <i className="ri-wallet-3-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{totalPayment}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Total Payment</h6>
                {/* <p className="mb-0">
                  <span className="me-1 fw-medium">
                    {paymentGrowthPercent > 0 ? "+" : ""}
                    {paymentGrowthPercent}%
                  </span>
                  <small className="text-muted">than last month</small>
                </p> */}
              </div>
            </div>
          </div>
          <div
            className="col-sm-6 col-lg-3"
            onClick={() => handleCardClick("due")}
          >
            <div className="card card-border-shadow-danger h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-danger">
                      <i className="ri-error-warning-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{duePayment}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Due Payment </h6>
                {/* <p className="mb-0">
                  <span className="me-1 fw-medium">
                    {dueGrowthPercent > 0 ? "+" : ""}
                    {dueGrowthPercent}%
                  </span>
                  <small className="text-muted">than last month</small>
                </p> */}
              </div>
            </div>
          </div>
          <div
            className="col-sm-6 col-lg-3"
            onClick={() => handleCardClick("received")}
          >
            <div className="card card-border-shadow-info h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-info">
                      <i className="ri-bank-card-line ri-24px"></i>
                    </span>
                  </div>
                  <h4 className="mb-0">{receivedPayment}</h4>
                </div>
                <h6 className="mb-0 fw-normal">Recieved Payment</h6>
                {/* <p className="mb-0">
                  <span className="me-1 fw-medium">
                    {receivedGrowthPercent > 0 ? "+" : ""}
                    {receivedGrowthPercent}%
                  </span>
                  <small className="text-muted">than last month</small>
                </p> */}
              </div>
            </div>
          </div>

          {/* full calender here */}

          <div className="card app-calendar-wrapper">
            <div className="row g-0">
              <div
                className="col  app-calendar-sidebar border-end"
                id="app-calendar-sidebar"
              >
                <div className="p-5 my-sm-0 mb-4 border-bottom">
                  <button
                    className="btn btn-primary btn-toggle-sidebar w-100"
                    onClick={() => setShowAddEventModal(true)}
                  >
                    <i className="ri-add-line ri-16px me-1_5"></i>
                    <span className="align-middle">Add Event</span>
                  </button>
                </div>
                <div className="px-4">
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <div
                      style={{
                        transform: "scale(1.2)",
                        transformOrigin: "top center",
                        marginBottom: "20%",
                        margintop: "10%",
                      }}
                    >
                      <DatePicker
                        inline
                        selected={selectedDate}
                        onChange={(date) => {
                          if (date.getMonth() !== selectedDate.getMonth() || date.getFullYear() !== selectedDate.getFullYear()) {
                            fetchOrders(date);
                          }
                          setSelectedDate(date);
                          const calendarApi = calendarRef.current.getApi();
                          calendarApi.gotoDate(date);
                        }}
                        onMonthChange={handleMonthChange}
                        dayClassName={(date) =>
                          hasAssignmentOnDate(date)
                            ? "has-assignment"
                            : undefined
                        }
                        showNavigation={false}
                      />
                    </div>
                  </div>

                  <hr className="mb-5 mx-n4 mt-3" />

                  <div className="mb-4 ms-1">
                    <h5>Event Filters</h5>
                  </div>

                  <div className="form-check form-check-secondary mb-2 ms-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAll"
                      checked={Object.values(assignmentFilters).every(Boolean)}
                      onChange={(e) => {
                        const newState = {};
                        Object.keys(assignmentFilters).forEach((key) => {
                          newState[key] = e.target.checked;
                        });
                        setAssignmentFilters(newState);
                      }}
                    />
                    <label className="form-check-label" htmlFor="selectAll">
                      View All
                    </label>
                  </div>

                  {Object.keys(assignmentFilters).map((name, idx) => {
                    const normalized = normalize(name);
                    const color =
                      assignmentColorMap.get(normalized)?.color || "secondary";

                    return (
                      <div
                        className="form-check mb-2 ms-3 d-flex align-items-center gap-2"
                        key={idx}
                      >
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`filter-${idx}`}
                          checked={assignmentFilters[name]}
                          onChange={(e) => {
                            const updatedFilters = {
                              ...assignmentFilters,
                              [name]: e.target.checked,
                            };
                            setAssignmentFilters(updatedFilters);
                          }}
                          style={{
                            backgroundColor: assignmentFilters[name]
                              ? `var(--bs-${color})`
                              : "transparent",
                            borderColor: `var(--bs-${color})`,
                          }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`filter-${idx}`}
                        >
                          {name}
                        </label>
                      </div>
                    );
                  })}

                  {/* {Object.keys(assignmentFilters).map((name, idx) => (
                    <div className="form-check mb-2 ms-3" key={idx}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`filter-${name}`}
                        checked={assignmentFilters[name]}
                        onChange={(e) => {
                          const updatedFilters = { ...assignmentFilters, [name]: e.target.checked };
                          setAssignmentFilters(updatedFilters);
                        }}
                      />
                      <label className="form-check-label" htmlFor={`filter-${name}`}>{name}</label>
                    </div>
                  ))} */}
                </div>
              </div>

              <div className="col app-calendar-content">
                <div className="card shadow-none border-0 " >
                  <div className="card-body pb-0 ps-0 ">
                    <FullCalendar
                      contentHeight={500}
                      ref={calendarRef}
                      plugins={[
                        dayGridPlugin,
                        timeGridPlugin,
                        interactionPlugin,
                      ]} // ✅ interactionPlugin is needed for dateClick
                      initialView="dayGridMonth"
                      initialDate={selectedDate}
                      events={calendarEvents}
                      headerToolbar={{
                        left: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                      }}
                      dateClick={(info) => {
                        console.log("Date clicked:", info.dateStr); // Optional debug
                        setPreFilledDate(info.dateStr);
                        setShowAddEventModal(true);
                      }}
                      eventClick={(info) => {
                        const eventData = info.event.extendedProps;
                        setSelectedEvent({ ...eventData, id: info.event.id });
                        setShowUpdateModal(true);
                      }}
                    />
                  </div>
                </div>
                <div className="app-overlay"></div>

                <div
                  className="offcanvas offcanvas-end event-sidebar"
                  tabIndex="-1"
                  id="addEventSidebar"
                  aria-labelledby="addEventSidebarLabel"
                >
                  <div className="offcanvas-header border-bottom">
                    <h5 className="offcanvas-title" id="addEventSidebarLabel">
                      Add Event
                    </h5>
                    <button
                      type="button"
                      className="btn-close text-reset"
                      data-bs-dismiss="offcanvas"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="offcanvas-body">
                    <form
                      className="event-form pt-0"
                      id="eventForm"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div className="form-floating form-floating-outline mb-5">
                        <input
                          type="text"
                          className="form-control"
                          id="eventTitle"
                          name="eventTitle"
                          placeholder="Event Title"
                        />
                        <label htmlFor="eventTitle">Title</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <select
                          className="select2 select-event-label form-select"
                          id="eventLabel"
                          name="eventLabel"
                          defaultValue="Business"
                        >
                          <option data-label="primary" value="Business">
                            Business
                          </option>
                          <option data-label="danger" value="Personal">
                            Personal
                          </option>
                          <option data-label="warning" value="Family">
                            Family
                          </option>
                          <option data-label="success" value="Holiday">
                            Holiday
                          </option>
                          <option data-label="info" value="ETC">
                            ETC
                          </option>
                        </select>

                        <label htmlFor="eventLabel">Label</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <input
                          type="text"
                          className="form-control"
                          id="eventStartDate"
                          name="eventStartDate"
                          placeholder="Start Date"
                        />
                        <label htmlFor="eventStartDate">Start Date</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <input
                          type="text"
                          className="form-control"
                          id="eventEndDate"
                          name="eventEndDate"
                          placeholder="End Date"
                        />
                        <label htmlFor="eventEndDate">End Date</label>
                      </div>
                      <div className="mb-5">
                        <div className="form-check form-switch">
                          <input
                            type="checkbox"
                            className="form-check-input allDay-switch"
                            id="allDaySwitch"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="allDaySwitch"
                          >
                            All Day
                          </label>
                        </div>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <input
                          type="url"
                          className="form-control"
                          id="eventURL"
                          name="eventURL"
                          placeholder="https://www.google.com"
                        />
                        <label htmlFor="eventURL">Event URL</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5 select2-primary">
                        <select
                          className="select2 select-event-guests form-select"
                          id="eventGuests"
                          name="eventGuests"
                          multiple
                        >
                          <option data-avatar="1.png" value="Jane Foster">
                            Jane Foster
                          </option>
                          <option data-avatar="3.png" value="Donna Frank">
                            Donna Frank
                          </option>
                          <option
                            data-avatar="5.png"
                            value="Gabrielle Robertson"
                          >
                            Gabrielle Robertson
                          </option>
                          <option data-avatar="7.png" value="Lori Spears">
                            Lori Spears
                          </option>
                          <option data-avatar="9.png" value="Sandy Vega">
                            Sandy Vega
                          </option>
                          <option data-avatar="11.png" value="Cheryl May">
                            Cheryl May
                          </option>
                        </select>
                        <label htmlFor="eventGuests">Add Guests</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <input
                          type="text"
                          className="form-control"
                          id="eventLocation"
                          name="eventLocation"
                          placeholder="Enter Location"
                        />
                        <label htmlFor="eventLocation">Location</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <textarea
                          className="form-control"
                          name="eventDescription"
                          id="eventDescription"
                        ></textarea>
                        <label htmlFor="eventDescription">Description</label>
                      </div>
                      <div className="mb-5 d-flex justify-content-sm-between justify-content-start my-6 gap-2">
                        <div className="d-flex">
                          <button
                            type="submit"
                            className="btn btn-primary btn-add-event me-4"
                          >
                            Add
                          </button>
                          <button
                            type="reset"
                            className="btn btn-outline-secondary btn-cancel me-sm-0 me-1"
                            data-bs-dismiss="offcanvas"
                          >
                            Cancel
                          </button>
                        </div>
                        <button className="btn btn-outline-danger btn-delete-event d-none">
                          Delete
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddEventModal
        show={showAddEventModal}
        handleClose={() => setShowAddEventModal(false)}
        allEvents={allEvents}
        selectedDate={selectedDate}
        refreshEvents={fetchOrders}
        preFilledDate={preFilledDate}
        triggerBasicPlanModal={() => setShowBasicModal(true)}
      />

      <UpdateEventModal
        show={showUpdateModal}
        handleClose={() => setShowUpdateModal(false)}
        eventData={selectedEvent}
        refreshEvents={fetchOrders}
        selectedDate={selectedDate}
        allEvents={allEvents}
      />

      <Modal
        show={showListModal}
        onHide={() => setShowListModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedCard === "total" && "All Assignments"}
            {selectedCard === "received" && "Received Payments"}
            {selectedCard === "due" && "Due Payments"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table table-bordered  align-middle">
              <thead>
                <tr>
                  {selectedCard === "total" && (
                    <>
                      <th>Client Info</th>
                      <th>Contact</th>
                      <th>Amount & Assignee</th>
                    </>
                  )}
                  {selectedCard === "payment" && (
                    <>
                      <th>Client & Assignment</th>
                      <th>Total Amount</th>
                      <th>Received</th>
                      <th>Remaining</th>
                      <th>Contact Info</th>
                    </>
                  )}
                  {selectedCard === "received" && (
                    <>
                      <th>Client & Assignment</th>
                      <th>Received Amount</th>
                      <th>Date</th>
                      <th>Phone</th>
                    </>
                  )}
                  {selectedCard === "due" && (
                    <>
                      <th>Client</th>
                      <th>Assignment</th>
                      <th>Due Payment</th>
                      <th>Phone</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((event, i) => {
                  const a = event.extendedProps;
                  const received = (a.transactions || []).reduce(
                    (sum, t) => sum + (t.receivedPayment || 0),
                    0
                  );
                  const due = (a.totalAmount || 0) - received;

                  return (
                    <tr key={i}>
                      {selectedCard === "total" && (
                        <>
                          <td>
                            <strong>{a.customerName}</strong>
                            <br />
                            <small>{a.assignmentName}</small>
                            <br />
                            <small>{a.assignmentAddress}</small>
                          </td>
                          <td>
                            <div>{a.customerMobile}</div>
                            <div>{a.customerEmail}</div>
                            <div>{a.customerAddress}</div>
                          </td>
                          <td>
                            ₹{a.totalAmount}
                            <br />
                            <small>
                              {a.assignToName} - {a.assignToHandle}
                            </small>
                          </td>
                        </>
                      )}

                      {selectedCard === "payment" && (
                        <>
                          <td>
                            <strong>{a.customerName}</strong>
                            <br />
                            <small>{a.assignmentName}</small>
                          </td>
                          <td>₹{a.totalAmount}</td>
                          <td>₹{received}</td>
                          <td>₹{a.totalAmount - received}</td>
                          <td>
                            <div>{a.customerMobile}</div>
                            <div>{a.customerEmail || "—"}</div>
                          </td>
                        </>
                      )}

                      {selectedCard === "due" && (
                        <>
                          <td>{a.customerName}</td>
                          <td>{a.assignmentName}</td>
                          <td>₹{due}</td>
                          <td>{a.customerMobile}</td>
                        </>
                      )}

                      {selectedCard === "received" && (
                        <>
                          <td>
                            <strong>{a.customerName}</strong>
                            <br />
                            <small>{a.assignmentName}</small>
                          </td>
                          <td>₹{received}</td>
                          <td>
                            {a.transactions?.[0]?.receivedDate
                              ? new Date(
                                  a.transactions[0].receivedDate
                                ).toLocaleString()
                              : "—"}
                          </td>
                          <td>{a.customerMobile}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
