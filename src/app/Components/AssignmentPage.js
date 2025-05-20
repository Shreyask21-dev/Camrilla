'use client';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker'
import AddEventModal from './AddEventModal';
import EditEventModalAssignments from './EditEventModalAssignments';
import AddNoteModal from './AddNoteModal';

export default function AssignmentPage() {

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

            const response = await axios.get(`https://newapi.camrilla.com/order/assignment`, {
                params: {
                    startDate: startMillis,
                    endDate: endMillis
                }
            });

            // ,
            //     headers: {
            //         Authorization: `Bearer ${accessToken}`
            //     }

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
    };

    const [selectedAssignmentNames, setSelectedAssignmentNames] = useState(["All"]);

    const uniqueAssignmentNames = useMemo(() => {
        const names = assignments.map(item => item.assignmentName).filter(Boolean);
        return Array.from(new Set(names));
    }, [assignments]);

    const filteredAssignments = useMemo(() => {
        if (selectedAssignmentNames.includes("All")) {
            return assignments;
        }
        return assignments.filter(a => selectedAssignmentNames.includes(a.assignmentName));
    }, [assignments, selectedAssignmentNames]);

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
        // const totalAmount = prompt("Enter Total Amount:", assignment.totalAmount || 0);
        // if (totalAmount === null) return; // user cancelled

        // const paymentNote = prompt("Enter Payment Note:", "Good Payment Note");
        // if (paymentNote === null) return; // user cancelled

        setPaymentAssignment(assignment);
        setPaymentAmount(assignment.totalAmount || '');
        setPaymentNote('');
        setShowPaymentModal(true);

        // const tokenData = JSON.parse(localStorage.getItem('camrilla_token'));
        // const accessToken = tokenData?.accessToken;
        // if (!accessToken) {
        //     alert('Access Token not found');
        //     return;
        // }

        // try {
        //     // Step 1: Update Assignment with new Total Amount
        //     await axios.put(`https://newapi.camrilla.com/order/assignment/${assignment.id}`, {
        //         customerName: assignment.customerName,
        //         customerMobile: assignment.customerMobile,
        //         customerEmail: assignment.customerEmail,
        //         customerAddress: assignment.customerAddress,
        //         assignmentAddress: assignment.assignmentAddress,
        //         assignmentName: assignment.assignmentName,
        //         assignmentDateTime: assignment.assignmentDateTime,
        //         assignmentStatus: assignment.assignmentStatus || "Completed",
        //         contactPerson1Name: assignment.contactPerson1Name || "",
        //         contactPerson1Mobile: assignment.contactPerson1Mobile || "",
        //         contactPerson2Name: assignment.contactPerson2Name || "",
        //         contactPerson2Mobile: assignment.contactPerson2Mobile || "",
        //         assignToName: assignment.assignToName || "Me",
        //         assignToHandle: assignment.assignToHandle || "MeTo",
        //         assignmentNote: assignment.assignmentNote || "",
        //         totalAmount: Number(totalAmount),
        //         reminderBeforedays: assignment.reminderBeforedays || 0,
        //         reminderDate: assignment.reminderDate || ""
        //     });


        //     // Step 2: Add a Transaction with receivedPayment = 0
        //     await axios.post(`https://newapi.camrilla.com/order/assignment/${assignment.id}/transaction`, {
        //         receivedPayment: 0,
        //         receivedDate: Date.now(),
        //         paymentNote: paymentNote
        //     });



        //     alert('Payment added successfully');
        //     fetchAssignments(startOfMonth, endOfMonth); // refresh assignments
        // } catch (error) {
        //     console.error('Error during Add Payment:', error);
        //     alert('Failed to add payment');
        // }
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
            await axios.put(`https://newapi.camrilla.com/order/assignment/${paymentAssignment.id}`, {
                ...paymentAssignment,
                totalAmount: Number(paymentAmount)
            });

            await axios.post(`https://newapi.camrilla.com/order/assignment/${paymentAssignment.id}/transaction`, {
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
            await axios.delete(`https://newapi.camrilla.com/order/assignment/${assignmentId}`);

            // , {
            //     headers: {
            //         Authorization: `Bearer ${accessToken}`
            //     }
            // }

            alert('Assignment deleted successfully');
            fetchAssignments(startOfMonth, endOfMonth); // Refresh after delete
        } catch (error) {
            console.error('Error deleting assignment:', error);
            alert('Failed to delete assignment');
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
                                    <div key={idx} className="form-check mb-3 ms-3">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`assignment-${idx}`}
                                            checked={selectedAssignmentNames.includes(name)}
                                            onChange={() => handleFilterChange(name)}
                                        />
                                        <label className="form-check-label" htmlFor={`assignment-${idx}`}>
                                            {name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col app-calendar-content">
                            <div className="card shadow-none border-0">

                                <div class="card-header d-flex align-items-center justify-content-between border border-top-0 border-start-0 border-end-0">
                                    <h5 class="card-title m-0 me-2  py-1">Assignments</h5>
                                    <div class="dropdown">
                                        <button
                                            class="btn btn-text-secondary rounded-pill text-muted border-0 p-1"
                                            type="button"
                                            id="meetingSchedule"
                                            data-bs-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false">
                                            <i class="ri-more-2-line ri-20px"></i>
                                        </button>
                                        <div class="dropdown-menu dropdown-menu-end" aria-labelledby="meetingSchedule">
                                            <a class="dropdown-item" href="javascript:void(0);">Last 28 Days</a>
                                            <a class="dropdown-item" href="javascript:void(0);">Last Month</a>
                                            <a class="dropdown-item" href="javascript:void(0);">Last Year</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body mt-4">
                                    <div className="d-flex flex-column gap-4">
                                        {filteredAssignments.map((assignment, index) => {
                                            const date = new Date(assignment.assignmentDateTime);

                                            return (
                                                <div key={index} className="d-flex align-items-center justify-content-between flex-nowrap border-bottom pb-3">
                                                    {/* Date */}
                                                    <div className="text-center" style={{ minWidth: '20px' }}>
                                                        <small className="text-muted">{date.toLocaleString('default', { month: 'short' })}</small>
                                                        <h3 className="mb-0">{date.getDate()}</h3>
                                                        <small className="text-muted">{date.getFullYear()}</small>
                                                    </div>

                                                    {/* Name | Phone | Email */}
                                                    <div className="d-flex align-items-center gap-1" style={{ minWidth: '180px' }}>
                                                        <strong>{assignment.customerName || '-'}</strong>
                                                        <span className="text-muted">|</span>
                                                        <strong>{assignment.customerMobile || '-'}</strong>
                                                        <span className="text-muted">|</span>
                                                        <strong>{assignment.customerEmail || '-'}</strong>
                                                    </div>

                                                    {/* Assignment Name */}
                                                    <div style={{ minWidth: '80px' }}>
                                                        <strong>{assignment.assignmentName || '-'}</strong>
                                                    </div>

                                                    {/* Venue */}
                                                    <div style={{ minWidth: '80px' }}>
                                                        <strong>{assignment.assignmentAddress || '-'}</strong>
                                                    </div>



                                                    {/* Edit Button */}
                                                    {/* Action Buttons */}
                                                    <div className="d-flex flex-column gap-2" style={{ minWidth: '100px' }}>
                                                        <div className='d-flex justify-content-center align-items-center gap-2'>
                                                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditAssignment(assignment)}>
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-success" onClick={() => handleAddPayment(assignment)}>
                                                                <i className="bi bi-currency-rupee"></i>
                                                            </button>
                                                        </div>

                                                        <div className='d-flex justify-content-center align-items-center gap-2'>
                                                            <button className="btn btn-sm btn-outline-info" onClick={() => handleAddNote(assignment)}>
                                                                <i className="bi bi-journals"></i>
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
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add/Edit Payment</h5>
                                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Total Amount</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Payment Note</label>
                                    <textarea
                                        className="form-control"
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={submitPayment}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



        </div>
    )
}
