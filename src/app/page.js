'use client'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import timeGridPlugin from '@fullcalendar/timegrid';

import interactionPlugin from '@fullcalendar/interaction';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { addMonths, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import AddEventModal from './Components/AddEventModal';
import UpdateEventModal from './Components/UpdateEventModal';


export default function Home() {

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
    console.log("New month displayed:", date.getMonth() + 1, date.getFullYear());

    const calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(date);

    // Fetch order data for the selected month
    fetchOrders(date);
  };

  useEffect(() => {
    const activeNames = Object.keys(assignmentFilters).filter(key => assignmentFilters[key]);
    const filtered = allEvents.filter(ev => activeNames.includes(ev.title));
    setCalendarEvents(filtered);
  }, [assignmentFilters, allEvents]);

  const fetchOrders = async (date) => {
    const startDate = startOfMonth(date).getTime();
    const endDate = endOfMonth(date).getTime();

    const tokenObj = JSON.parse(localStorage.getItem('camrilla_token'));
    const accessToken = tokenObj?.accessToken;

    if (!accessToken) {
      console.error('No access token found in localStorage');
      return;
    }

    try {
      const response = await axios.get(`http://api.camrilla.com/order/assignment`, {
        params: {
          startDate,
          endDate,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.code === 0 && response.data.message === 'Success') {
        const mappedEvents = response.data.data.map(item => ({
          id: item.id,
          title: item.assignmentName || 'No Title',
          start: new Date(item.assignmentDateTime),
          end: new Date(item.assignmentDateTime),
          extendedProps: {
            ...item,
          },
        }));

        // Create a filter map with all assignment names selected
        const uniqueAssignments = [...new Set(mappedEvents.map(ev => ev.title))];
        const filterMap = {};
        uniqueAssignments.forEach(name => {
          filterMap[name] = true;
        });

        setAllEvents(mappedEvents);         // store full list
        setCalendarEvents(mappedEvents);    // show all events initially
        setAssignmentFilters(filterMap);    // update filters
      } else {
        console.warn('API response was not successful:', response.data.message);
      }

    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders(selectedDate);
  }, []);

  return (
    <div>
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row g-6">
          <div className="col-sm-6 col-lg-3">
            <div className="card card-border-shadow-primary h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-primary"
                    ><i className="ri-car-line ri-24px"></i
                    ></span>
                  </div>
                  <h4 className="mb-0">42</h4>
                </div>
                <h6 className="mb-0 fw-normal">On route vehicles</h6>
                <p className="mb-0">
                  <span className="me-1 fw-medium">+18.2%</span>
                  <small className="text-muted">than last week</small>
                </p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card card-border-shadow-warning h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-warning"
                    ><i className="ri-alert-line ri-24px"></i
                    ></span>
                  </div>
                  <h4 className="mb-0">8</h4>
                </div>
                <h6 className="mb-0 fw-normal">Vehicles with errors</h6>
                <p className="mb-0">
                  <span className="me-1 fw-medium">-8.7%</span>
                  <small className="text-muted">than last week</small>
                </p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card card-border-shadow-danger h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-danger"
                    ><i className="ri-route-line ri-24px"></i
                    ></span>
                  </div>
                  <h4 className="mb-0">27</h4>
                </div>
                <h6 className="mb-0 fw-normal">Deviated from route</h6>
                <p className="mb-0">
                  <span className="me-1 fw-medium">+4.3%</span>
                  <small className="text-muted">than last week</small>
                </p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="card card-border-shadow-info h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <div className="avatar me-4">
                    <span className="avatar-initial rounded-3 bg-label-info"
                    ><i className="ri-time-line ri-24px"></i
                    ></span>
                  </div>
                  <h4 className="mb-0">13</h4>
                </div>
                <h6 className="mb-0 fw-normal">Late vehicles</h6>
                <p className="mb-0">
                  <span className="me-1 fw-medium">-2.5%</span>
                  <small className="text-muted">than last week</small>
                </p>
              </div>
            </div>
          </div>


          {/* full calender here */}

          <div className="card app-calendar-wrapper">
            <div className="row g-0">

              <div className="col  app-calendar-sidebar border-end" id="app-calendar-sidebar">
                <div className="p-5 my-sm-0 mb-4 border-bottom">
                  <button
                    className="btn btn-primary btn-toggle-sidebar w-100"
                    onClick={() => setShowAddEventModal(true)}>
                    <i className="ri-add-line ri-16px me-1_5"></i>
                    <span className="align-middle">Add Event</span>
                  </button>
                </div>
                <div className="px-4">

                  <div style={{ display: "flex", justifyContent: "center" }}>

                    <div style={{ transform: "scale(1.2)", transformOrigin: "top center", marginBottom: "20%", margintop: "10%" }}>
                      <DatePicker
                        inline
                        selected={selectedDate}
                        onChange={date => {
                          setSelectedDate(date);
                          const calendarApi = calendarRef.current.getApi();
                          calendarApi.gotoDate(date);
                        }}
                        onMonthChange={handleMonthChange}
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
                        Object.keys(assignmentFilters).forEach(key => {
                          newState[key] = e.target.checked;
                        });
                        setAssignmentFilters(newState);
                      }}
                    />
                    <label className="form-check-label" htmlFor="selectAll">View All</label>
                  </div>

                  {Object.keys(assignmentFilters).map((name, idx) => (
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
                  ))}

                </div>
              </div>

              <div className="col app-calendar-content">
                <div className="card shadow-none border-0">
                  <div className="card-body pb-0 ps-0">

                    <FullCalendar
                      ref={calendarRef}
                      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // ✅ interactionPlugin is needed for dateClick
                      initialView="dayGridMonth"
                      initialDate={selectedDate}
                      events={calendarEvents}
                      headerToolbar={{
                        left: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                      }}
                      dateClick={(info) => {
                        console.log('Date clicked:', info.dateStr); // Optional debug
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
                  tabindex="-1"
                  id="addEventSidebar"
                  aria-labelledby="addEventSidebarLabel">
                  <div className="offcanvas-header border-bottom">
                    <h5 className="offcanvas-title" id="addEventSidebarLabel">Add Event</h5>
                    <button
                      type="button"
                      className="btn-close text-reset"
                      data-bs-dismiss="offcanvas"
                      aria-label="Close"></button>
                  </div>
                  <div className="offcanvas-body">
                    <form className="event-form pt-0" id="eventForm" onsubmit="return false">
                      <div className="form-floating form-floating-outline mb-5">
                        <input
                          type="text"
                          className="form-control"
                          id="eventTitle"
                          name="eventTitle"
                          placeholder="Event Title" />
                        <label for="eventTitle">Title</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <select className="select2 select-event-label form-select" id="eventLabel" name="eventLabel">
                          <option data-label="primary" value="Business" selected>Business</option>
                          <option data-label="danger" value="Personal">Personal</option>
                          <option data-label="warning" value="Family">Family</option>
                          <option data-label="success" value="Holiday">Holiday</option>
                          <option data-label="info" value="ETC">ETC</option>
                        </select>
                        <label for="eventLabel">Label</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <input
                          type="text"
                          className="form-control"
                          id="eventStartDate"
                          name="eventStartDate"
                          placeholder="Start Date" />
                        <label for="eventStartDate">Start Date</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <input
                          type="text"
                          className="form-control"
                          id="eventEndDate"
                          name="eventEndDate"
                          placeholder="End Date" />
                        <label for="eventEndDate">End Date</label>
                      </div>
                      <div className="mb-5">
                        <div className="form-check form-switch">
                          <input type="checkbox" className="form-check-input allDay-switch" id="allDaySwitch" />
                          <label className="form-check-label" for="allDaySwitch">All Day</label>
                        </div>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <input
                          type="url"
                          className="form-control"
                          id="eventURL"
                          name="eventURL"
                          placeholder="https://www.google.com" />
                        <label for="eventURL">Event URL</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5 select2-primary">
                        <select
                          className="select2 select-event-guests form-select"
                          id="eventGuests"
                          name="eventGuests"
                          multiple>
                          <option data-avatar="1.png" value="Jane Foster">Jane Foster</option>
                          <option data-avatar="3.png" value="Donna Frank">Donna Frank</option>
                          <option data-avatar="5.png" value="Gabrielle Robertson">Gabrielle Robertson</option>
                          <option data-avatar="7.png" value="Lori Spears">Lori Spears</option>
                          <option data-avatar="9.png" value="Sandy Vega">Sandy Vega</option>
                          <option data-avatar="11.png" value="Cheryl May">Cheryl May</option>
                        </select>
                        <label for="eventGuests">Add Guests</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <input
                          type="text"
                          className="form-control"
                          id="eventLocation"
                          name="eventLocation"
                          placeholder="Enter Location" />
                        <label for="eventLocation">Location</label>
                      </div>
                      <div className="form-floating form-floating-outline mb-5">
                        <textarea className="form-control" name="eventDescription" id="eventDescription"></textarea>
                        <label for="eventDescription">Description</label>
                      </div>
                      <div className="mb-5 d-flex justify-content-sm-between justify-content-start my-6 gap-2">
                        <div className="d-flex">
                          <button type="submit" className="btn btn-primary btn-add-event me-4">Add</button>
                          <button
                            type="reset"
                            className="btn btn-outline-secondary btn-cancel me-sm-0 me-1"
                            data-bs-dismiss="offcanvas">
                            Cancel
                          </button>
                        </div>
                        <button className="btn btn-outline-danger btn-delete-event d-none">Delete</button>
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
      />

      <UpdateEventModal
        show={showUpdateModal}
        handleClose={() => setShowUpdateModal(false)}
        eventData={selectedEvent}
        refreshEvents={fetchOrders}
        selectedDate={selectedDate}
        allEvents={allEvents}
      />


    </div>
  );
}
