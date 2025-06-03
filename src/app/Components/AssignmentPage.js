'use client';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker'
import AddEventModal from './AddEventModal';
import EditEventModalAssignments from './EditEventModalAssignments';
import AddNoteModal from './AddNoteModal';
import TransactionModal from './TransactionModal';
import useSearchStore from '../store/searchStore'; // adjust path if needed
import config from '../config/config';
import BasicPlanNotice from './BasicPlanNotice'; // Adjust path if needed

import { useAssignmentStore } from '../store/store';

export default function AssignmentPage() {

    const { decrementAssignmentCount } = useAssignmentStore()

    const [showBasicNotice, setShowBasicNotice] = useState(false);

    const [planInfo, setPlanInfo] = useState(null);

    const handleShowBasicPlanNotice = () => {
        alert('Free limit exceeded. Please subscribe to continue.');
        setShowAddModal(false); // ⛔ close AddEventModal
        setShowBasicNotice(true); // ✅ show subscription prompt
    }

    useEffect(() => {
        const fetchUserPlan = async () => {
            const tokenData = localStorage.getItem('camrilla_token');
            if (!tokenData) return;

            try {
                const { accessToken } = JSON.parse(tokenData);
                const res = await fetch(`${config.BASE_URL}user-plan`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                const json = await res.json();
                if (json.code === 0) {
                    console.log(json.data.userPlanDetails)
                    setPlanInfo(json.data.userPlanDetails);
                }
            } catch (err) {
                console.error("Error fetching user plan:", err);
            }
        };

        fetchUserPlan();
    }, []);

    const [allAssignments, setAllAssignments] = useState([]);

    useEffect(() => {
        const fetchAllAssignments = async () => {
            if (!planInfo?.startDate || !planInfo?.endDate) return;

            try {
                const tokenData = localStorage.getItem('camrilla_token');
                const accessToken = JSON.parse(tokenData)?.accessToken;
                if (!accessToken) return;

                const response = await axios.get(`${config.BASE_URL}order/assignment`, {
                    params: {
                        startDate: new Date(planInfo.startDate).getTime(),
                        endDate: new Date(planInfo.endDate).getTime()
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                console.log(response.data.data)

                setAllAssignments(response.data.data || []);
            } catch (error) {
                console.error('Error fetching all assignments:', error);
            }
        };

        fetchAllAssignments();
    }, [planInfo]);


    const bootstrapColors = [
        'warning', 'info', 'success', 'danger', 'dark', 'primary', 'secondary',
    ];

    const { searchTerm } = useSearchStore();

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAssignment, setPaymentAssignment] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNote, setPaymentNote] = useState('');

    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedNoteAssignment, setSelectedNoteAssignment] = useState(null);

    const handleAddNote = (assignment) => {
        setSelectedNoteAssignment(assignment);
        setShowNoteModal(true);
    };

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const handleEditAssignment = (assignment) => {
        setSelectedAssignment(assignment);
        setShowEditModal(true);
    };

    const [showAddModal, setShowAddModal] = useState(false);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [startOfMonth, setStartOfMonth] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    const [endOfMonth, setEndOfMonth] = useState(() => {
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        return end;
    });
    const [assignments, setAssignments] = useState([]);

    const fetchAssignments = async (startDate, endDate) => {
        try {
            const tokenData = JSON.parse(localStorage.getItem('camrilla_token'));
            const accessToken = tokenData?.accessToken;
            if (!accessToken) {
                console.error('Access Token not found.');
                return;
            }

            const startMillis = startDate.getTime();
            const endMillis = endDate.getTime();

            const response = await axios.get(`${config.BASE_URL}order/assignment`, {
                params: {
                    startDate: startMillis,
                    endDate: endMillis
                }
            });

            setAssignments(response.data.data); // save your data here
            console.log('Assignments fetched:', response.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    useEffect(() => {
        fetchAssignments(startOfMonth, endOfMonth);
    }, [startOfMonth, endOfMonth]);

    const handleMonthChange = (date) => {
        setCurrentDate(date);
        const newStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const newEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        newEnd.setHours(23, 59, 59, 999); // <--- Add this!
        setStartOfMonth(newStart);
        setEndOfMonth(newEnd);
        setTimeFilter(null);
    };

    const [selectedAssignmentNames, setSelectedAssignmentNames] = useState(["All"]);

    const normalize = (str) => str?.trim().toLowerCase();

    const uniqueAssignmentNames = useMemo(() => {
        const nameMap = new Map();

        allAssignments.forEach(item => {
            const rawName = item.assignmentName;
            if (!rawName) return;

            const normalized = normalize(rawName);
            if (!nameMap.has(normalized)) {
                nameMap.set(normalized, rawName.trim());
            }
        });

        return Array.from(nameMap.values());
    }, [allAssignments]);

    // const [timeFilter, setTimeFilter] = useState("All");
    const [timeFilter, setTimeFilter] = useState(null);

    const filteredAssignments = useMemo(() => {
        const filterByName = selectedAssignmentNames.includes("All")
            ? assignments
            : assignments.filter(a =>
                selectedAssignmentNames
                    .map(normalize)
                    .includes(normalize(a.assignmentName))
            );

        const text = searchTerm.toLowerCase();

        const matchesSearch = (assignment) => {
            return (
                assignment.customerName?.toLowerCase().includes(text) ||
                assignment.customerMobile?.toLowerCase().includes(text) ||
                assignment.customerEmail?.toLowerCase().includes(text) ||
                assignment.customerAddress?.toLowerCase().includes(text) ||
                assignment.assignmentName?.toLowerCase().includes(text) ||
                assignment.assignmentAddress?.toLowerCase().includes(text) ||
                assignment.assignmentNote?.toLowerCase().includes(text) ||
                assignment.assignToName?.toLowerCase().includes(text) ||
                assignment.assignToHandle?.toLowerCase().includes(text) ||
                (assignment.functions || []).some(f => f.functionName?.toLowerCase().includes(text)) ||
                (assignment.transactions || []).some(t => t.paymentNote?.toLowerCase().includes(text))
            );
        };

        return filterByName.filter(a => !searchTerm || matchesSearch(a));
    }, [assignments, selectedAssignmentNames, searchTerm]);


    const handleFilterChange = (name) => {
        if (name === "All") {
            setSelectedAssignmentNames(["All"]);
        } else {
            let updatedSelection = [...selectedAssignmentNames];
            if (updatedSelection.includes(name)) {
                updatedSelection = updatedSelection.filter(n => n !== name);
            } else {
                updatedSelection.push(name);
            }
            // If no filters selected, fallback to "All"
            if (updatedSelection.length === 0) {
                updatedSelection = ["All"];
            } else {
                updatedSelection = updatedSelection.filter(n => n !== "All");
            }
            setSelectedAssignmentNames(updatedSelection);
        }
    };

    const handleAddPayment = async (assignment) => {

        setPaymentAssignment(assignment);
        setPaymentAmount(assignment.totalAmount || '');
        setPaymentNote('');
        setShowPaymentModal(true);

    };

    const submitPayment = async () => {
        if (!paymentAssignment) return;

        const tokenData = JSON.parse(localStorage.getItem('camrilla_token'));
        const accessToken = tokenData?.accessToken;
        if (!accessToken) {
            alert('Access Token not found');
            return;
        }

        try {
            await axios.put(`${config.BASE_URL}order/assignment/${paymentAssignment.id}`, {
                ...paymentAssignment,
                totalAmount: Number(paymentAmount)
            });

            await axios.post(`${config.BASE_URL}order/assignment/${paymentAssignment.id}/transaction`, {
                receivedPayment: 0,
                receivedDate: Date.now(),
                paymentNote
            });

            alert('Payment added successfully');
            setShowPaymentModal(false);
            fetchAssignments(startOfMonth, endOfMonth);
        } catch (error) {
            console.error('Error during Add Payment:', error);
            alert('Failed to add payment');
        }
    };


    const handleDeleteAssignment = async (assignmentId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this assignment?");
        if (!confirmDelete) return;

        const tokenData = JSON.parse(localStorage.getItem('camrilla_token'));
        const accessToken = tokenData?.accessToken;
        if (!accessToken) {
            alert('Access Token not found');
            return;
        }

        try {
            await axios.delete(`${config.BASE_URL}order/assignment/${assignmentId}`);
            decrementAssignmentCount()
            alert('Assignment deleted successfully');
            fetchAssignments(startOfMonth, endOfMonth); // Refresh after delete
        } catch (error) {
            console.error('Error deleting assignment:', error);
            alert('Failed to delete assignment');
        }
    };

    const hasAssignmentOnDate = (date) => {
        return assignments.some(a => {
            const aDate = new Date(a.assignmentDateTime);
            return (
                aDate.getFullYear() === date.getFullYear() &&
                aDate.getMonth() === date.getMonth() &&
                aDate.getDate() === date.getDate()
            );
        });
    };

    const handleTimeFilterChange = (filterType) => {
        const now = new Date();
        let startDate, endDate;

        if (filterType === "CurrentYear") {
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else if (filterType === "LastYear") {
            startDate = new Date(now.getFullYear() - 1, 0, 1);
            endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        } else if (filterType === "LastMonth") {
            const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            startDate = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 1);
            endDate = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);
        } else {
            // Default "All" case: fetch very wide range
            startDate = new Date(2000, 0, 1);
            endDate = new Date(2100, 11, 31, 23, 59, 59, 999);
        }

        setTimeFilter(filterType);
        setStartOfMonth(startDate);
        setEndOfMonth(endDate);
    };

    // // Create a mapping of assignment name to a consistent color
    const assignmentColorMap = useMemo(() => {
        const map = new Map();
        let index = 0;

        allAssignments.forEach(item => {
            const rawName = item.assignmentName?.trim();
            if (!rawName) return;

            const normalized = normalize(rawName);

            if (!map.has(normalized)) {
                const color = bootstrapColors[index % bootstrapColors.length];
                map.set(normalized, color);
                index++;
            }
        });

        return map;
    }, [allAssignments]);

    const getTitleText = () => {
        switch (timeFilter) {
            case 'All':
                return 'All Assignments';
            case 'LastMonth':
                const currentMonthIndex = currentDate.getMonth(); // Get the current month (0-11)
                const lastMonthIndex = (currentMonthIndex - 1 + 12) % 12; // Calculate the last month index
                const lastMonthName = new Date(currentDate.getFullYear(), lastMonthIndex).toLocaleString('default', { month: 'long' });
                const curr_year = currentDate.toLocaleString('default', { year: 'numeric' })
                return `Assignments - ${lastMonthName} ${curr_year}`;
            case 'CurrentYear':
                const year = currentDate.toLocaleString('default', { year: 'numeric' })
                return `Assignments - Year ${year}`;
            case 'LastYear':
                const current_year = currentDate.toLocaleString('default', { year: 'numeric' })
                const lastYear = current_year - 1
                return `Assignments - Year ${lastYear}`;
            default: {
                const monthName = currentDate.toLocaleString('default', { month: 'long' });
                const year = currentDate.toLocaleString('default', { year: 'numeric' })
                return `Assignments - ${monthName} ${year}`;
            }
        }
    };



    return (
        <div>
            <div className="container-xxl flex-grow-1 container-p-y">
                <div className="card app-calendar-wrapper">
                    <div className="row g-0">

                        <div className="col app-calendar-sidebar border-end" id="app-calendar-sidebar">

                            <div className="p-5 my-sm-0 mb-4 border-bottom">

                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="btn btn-primary btn-toggle-sidebar w-100">
                                    <i className="ri-add-line ri-16px me-1_5"></i>
                                    <span className="align-middle">Add Event</span>
                                </button>
                            </div>
                            <div className="px-4">

                                <div style={{ display: "flex", justifyContent: "center" }}>

                                    <div style={{ transform: "scale(1.2)", transformOrigin: "top center", marginBottom: "20%", margintop: "10%" }}>
                                        <DatePicker
                                            inline
                                            selected={currentDate}
                                            onMonthChange={handleMonthChange}
                                            onChange={date => setCurrentDate(date)}
                                            dayClassName={(date) => hasAssignmentOnDate(date) ? 'has-assignment' : undefined}
                                        />
                                    </div>

                                </div>

                                <hr className="mb-5 mx-n4 mt-3" />

                                <div className="mb-4 ms-1">
                                    <h5>Event Filters</h5>
                                </div>

                                <div className="form-check form-check-secondary mb-5 ms-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="selectAll"
                                        checked={selectedAssignmentNames.includes("All")}
                                        onChange={() => handleFilterChange("All")}
                                    />
                                    <label className="form-check-label" htmlFor="selectAll">View All</label>
                                </div>

                                {uniqueAssignmentNames.map((name, idx) => (
                                    <div key={idx} className="form-check mb-3 ms-3 d-flex align-items-center gap-2">
                                        <input
                                            className={`form-check-input`}
                                            type="checkbox"
                                            id={`assignment-${idx}`}
                                            checked={selectedAssignmentNames.includes(name)}
                                            onChange={() => handleFilterChange(name)}
                                            style={{
                                                backgroundColor: selectedAssignmentNames.includes(name)
                                                    ? `var(--bs-${assignmentColorMap.get(normalize(name))})`
                                                    : 'transparent',
                                                borderColor: `var(--bs-${assignmentColorMap.get(normalize(name))})`
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor={`assignment-${idx}`}>
                                            {name}
                                            {/* <span className={`badge bg-${assignmentColorMap[name]}`}>{name}</span> */}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col app-calendar-content">
                            <div className="card shadow-none border-0">

                                <div className="card-header d-flex align-items-center justify-content-between border border-top-0 border-start-0 border-end-0">
                                    <h5 className="card-title m-0 me-2  py-1">{getTitleText()}</h5>
                                    <div className="dropdown">
                                        <div className="d-flex flex-wrap align-items-center gap-3">
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="timeFilter"
                                                    id="filterLastMonth"
                                                    checked={timeFilter === "LastMonth"}
                                                    onChange={() => handleTimeFilterChange("LastMonth")}
                                                />
                                                <label className="form-check-label" htmlFor="filterLastMonth">Last Month</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="timeFilter"
                                                    id="filterCurrentYear"
                                                    checked={timeFilter === "CurrentYear"}
                                                    onChange={() => handleTimeFilterChange("CurrentYear")}
                                                />
                                                <label className="form-check-label" htmlFor="filterCurrentYear">Current Year</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="timeFilter"
                                                    id="filterLastYear"
                                                    checked={timeFilter === "LastYear"}
                                                    onChange={() => handleTimeFilterChange("LastYear")}
                                                />
                                                <label className="form-check-label" htmlFor="filterLastYear">Last Year</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="timeFilter"
                                                    id="filterAll"
                                                    checked={timeFilter === "All"}
                                                    onChange={() => handleTimeFilterChange("All")}
                                                />
                                                <label className="form-check-label" htmlFor="filterAll">All</label>
                                            </div>
                                        </div>


                                    </div>
                                </div>

                                <div className="card-body mt-4">
                                    <div className="d-flex flex-column gap-4">
                                        {[...filteredAssignments].sort((a, b) => new Date(a.assignmentDateTime) - new Date(b.assignmentDateTime))
                                            .map((assignment, index) => {
                                                const date = new Date(assignment.assignmentDateTime);

                                                return (
                                                    <div key={index} className="border border-top-0 border-start-0 border-end-0 rounded p-3 pb-4 d-flex gap-4" style={{}}>
                                                        {/* Date Column */}
                                                        <div className="text-center border border-top-0 border-bottom-0 border-start-0 " style={{ minWidth: '80px' }}>
                                                            <small className="text-muted">{date.toLocaleString('default', { month: 'short' })}</small>
                                                            <h3 className="mb-0">{date.getDate()}</h3>
                                                            <small className="text-muted">{date.getFullYear()}</small>
                                                        </div>

                                                        {/* Info Column */}
                                                        <div className="flex-grow-1">
                                                            <strong className="d-block mb-1">{assignment.customerName || '-'}</strong>
                                                            <div className="text-muted small mb-1">
                                                                {assignment.customerEmail || '-'} | {assignment.customerMobile || '-'}
                                                            </div>
                                                            <div className="text-muted small">
                                                                {/* <strong>{assignment.assignmentName || '-'}</strong> */}
                                                                <strong>
                                                                    <span className={`badge bg-${assignmentColorMap.get(normalize(assignment.assignmentName)) || 'secondary'}`}>
                                                                        {assignment.assignmentName || '-'}
                                                                    </span>
                                                                </strong>
                                                                &nbsp;
                                                                <span>- {assignment.assignmentAddress || '-'}</span>
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons Column */}
                                                        <div className="d-flex flex-column justify-content-between align-items-end gap-2" style={{ minWidth: '120px' }}>
                                                            <div className="d-flex gap-2">
                                                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditAssignment(assignment)}>
                                                                    <i className="bi bi-pencil-fill"></i>
                                                                </button>
                                                                <button className="btn btn-sm btn-outline-success" onClick={() => handleAddPayment(assignment)}>
                                                                    <i className="bi bi-currency-rupee"></i>
                                                                </button>
                                                            </div>
                                                            <div className="d-flex gap-2">
                                                                <button className="btn btn-sm btn-outline-info" onClick={() => handleAddNote(assignment)}>
                                                                    {/* <i className="bi bi-journal-check"></i> */}
                                                                    <i className="bi bi-file-earmark-pdf-fill"></i>
                                                                </button>
                                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteAssignment(assignment.id)}>
                                                                    <i className="bi bi-trash-fill"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                );
                                            })}
                                    </div>
                                </div>


                            </div>

                        </div>

                    </div>
                </div>
            </div>


            <AddEventModal
                show={showAddModal}
                handleClose={() => setShowAddModal(false)}
                allEvents={assignments.map(item => ({ title: item.assignmentName }))}
                selectedDate={currentDate}
                refreshEvents={(date) => fetchAssignments(startOfMonth, endOfMonth)}
                preFilledDate={currentDate.toISOString().split('T')[0]} // prefill today's date
                triggerBasicPlanModal={handleShowBasicPlanNotice} // 👈 pass the callback
            />

            <EditEventModalAssignments
                show={showEditModal}
                handleClose={() => setShowEditModal(false)}
                eventData={selectedAssignment}
                refreshEvents={(date) => fetchAssignments(startOfMonth, endOfMonth)}
                selectedDate={currentDate}
                allEvents={assignments.map(item => ({ title: item.assignmentName }))}
            />

            <AddNoteModal
                show={showNoteModal}
                handleClose={() => setShowNoteModal(false)}
                assignmentData={selectedNoteAssignment}
                refreshEvents={() => fetchAssignments(startOfMonth, endOfMonth)}
            />

            {showPaymentModal && (
                <TransactionModal
                    show={showPaymentModal}
                    handleClose={() => setShowPaymentModal(false)}
                    assignment={paymentAssignment}
                    refresh={() => fetchAssignments(startOfMonth, endOfMonth)}
                />
            )}

            {showBasicNotice && (
                <BasicPlanNotice show={true} handleClose={() => setShowBasicNotice(false)} />
            )}


        </div>
    )
}
